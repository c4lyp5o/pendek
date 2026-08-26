import { Elysia } from "elysia";
import { existsSync } from "node:fs";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";

import { config, sessionOptions } from "./config.js";
import { prisma } from "./db.js";
import { getSession, requireLogin } from "./auth.js";
import { sanitizeUrl, sanitizeCode, isBlockedUrl } from "./validate.js";
import { rateLimit, keyFor } from "./rate-limit.js";
import {
	redirectCache,
	negativeCache,
	isNegativelyCached,
	cacheNegative,
	trackClick,
	startClickFlush,
} from "./cache.js";

// Cache miss -> load a Code row from Postgres and convert it into the compact
// shape the redirect handler serves. Returns null for missing/disabled codes.
async function loadCode(code) {
	const row = await prisma.code.findUnique({
		where: { code },
		include: { urls: true },
	});
	if (!row || !row.isEnabled || row.urls.length === 0) return null;
	return {
		id: row.id,
		code: row.code,
		isMultiple: row.isMultiple,
		// keep the object shape the picker page consumes (url + tag)
		urls: row.urls.map((u) => ({ url: u.url, tag: u.tag })),
	};
}

// A write to a code must drop its hot copies so redirects observe the change.
function invalidateCode(code) {
	redirectCache.del(code);
	negativeCache.del(code);
}

// Auto short-code generator honoring config alphabet/length.
const generateCode = customAlphabet(config.codeAlphabet, config.codeLength);

// Create a Code row with an auto-generated code, retrying on the rare
// unique-collision instead of letting Prisma's P2002 bubble to a 500.
async function createCodeRow(buildData, attempts = 5) {
	for (let i = 0; i < attempts; i++) {
		const code = generateCode();
		try {
			const record = await prisma.code.create({ data: buildData(code) });
			return { code, record };
		} catch (e) {
			if (e?.code === "P2002") continue; // collision -> fresh code
			throw e;
		}
	}
	throw new Error("Could not allocate a unique short code");
}

const app = new Elysia()
	.onError(({ code, error, set }) => {
		console.error(`[error] ${code}:`, error?.stack || error?.message || error);
		set.status = code === "VALIDATION" ? 400 : 500;
		return { message: "Something went wrong" };
	});

/* ------------------------------------------------------------------ */
/* Redirect: GET /:code  ->  302 to the (first) target URL              */
/* ------------------------------------------------------------------ */
app.get("/:code", async ({ params, set }) => {
	const code = params.code;

	// Protect the SPA routes from being mistaken for short codes.
	if (
		/^(dashboard|login|signup|api|error|pendingka|settings)$/i.test(code)
	) {
		return spaIndex();
	}

	// Hot path: cache hit serves the mapping without touching the DB.
	let entry = redirectCache.get(code);

	// Skip the DB for codes we recently proved don't exist (anti-fuzz).
	if (entry === undefined && isNegativelyCached(code)) {
		set.status = 404;
		return { message: "Link not found or disabled" };
	}

	if (entry === undefined) {
		// Cold path: cache miss -> load once from Postgres, keep in hot store.
		entry = await loadCode(code);
		if (entry) {
			redirectCache.set(code, entry);
		} else {
			cacheNegative(code);
		}
	}

	if (!entry) {
		set.status = 404;
		return { message: "Link not found or disabled" };
	}

	// Clicks are buffered in memory and flushed to Postgres in batches —
	// no per-request UPDATE, no @updatedAt churn.
	trackClick(entry.id);

	// Multi-link codes land on the picker page (SPA route), single -> 302.
	if (entry.isMultiple) {
		return { message: "multiple", code: entry.code, urls: entry.urls };
	}

	const target = sanitizeUrl(entry.urls[0].url);
	if (!target) {
		set.status = 404;
		return { message: "Link isn't valid anymore" };
	}

	set.status = 302;
	set.headers = { ...(set.headers || {}), Location: target };
	return null;
});

/* ------------------------------------------------------------------ */
/* Public create (auto short code) — no auth, rate limited             */
/* ------------------------------------------------------------------ */
app.post(
	"/api/create",
	async ({ body, set, request }) => {
		const urls = Array.isArray(body?.urls) ? body.urls : [body?.url];

		const cleaned = [];
		for (const u of urls) {
			const s = sanitizeUrl(u);
			if (!s || isBlockedUrl(s)) {
				set.status = 400;
				return { message: "Invalid URL" };
			}
			cleaned.push(s);
		}
		if (cleaned.filter(Boolean).length === 0) {
			set.status = 400;
			return { message: "At least one valid URL required" };
		}

		const tags = Array.isArray(body?.tags) ? body.tags : [];

		const { code } = await createCodeRow((code) => ({
			code,
			isMultiple: cleaned.length > 1,
			urls: {
				create: cleaned.map((u, i) => ({
					url: u,
					tag: typeof tags[i] === "string" && tags[i] ? tags[i] : null,
				})),
			},
		}));

		return {
			code,
			shortUrl: `${originFor(request)}/${code}`,
		};
	},
	// hooks (third positional arg) — rate limit public create
	{
		beforeHandle: [rateLimit({ windowMs: 60_000, max: 15, scope: "create" })],
	}
);

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */
app
	.get("/api/session", async (c) => {
		const session = await getSession(c);
		return {
			isLoggedIn: !!session?.isLoggedIn,
			username: session?.username || "",
			userId: session?.userId || null,
		};
	})
	.post(
		"/api/auth/signup",
		async ({ body, set }) => {
		if (config.disableAutoCreate) {
			set.status = 403;
			return { message: "Signups are disabled" };
		}
		// Honeypot: real users never fill this hidden field; bots do.
		if (body?.[config.honeypotField]) {
			return { message: "Account created" }; // lie to the bot
		}
		const { username, password } = body || {};
		if (
			!username ||
			!password ||
			String(username).length > 30 ||
			!/^[a-zA-Z0-9_]+$/.test(String(username))
		) {
			set.status = 400;
			return { message: "Invalid username or password" };
		}
		if (String(password).length < 8) {
			set.status = 400;
			return { message: "Password must be at least 8 characters" };
		}

		const existing = await prisma.user.findUnique({
			where: { username: String(username) },
		});
		// Generic message to avoid username enumeration.
		if (existing) {
			set.status = 400;
			return { message: "That username can't be used" };
		}

			const hash = await bcrypt.hash(String(password), 12);
			await prisma.user.create({
				data: { username: String(username), password: hash },
			});
			return { message: "Account created" };
		},
		// Honeypot + signup throttling: 5/min/IP keeps bulk account farming down.
		{ beforeHandle: [rateLimit({ windowMs: 60_000, max: 5, scope: "signup" })] }
	)
	.post(
		"/api/auth/login",
		async (c) => {
		const { set, body } = c;
		const { username, password } = body || {};
		if (!username || !password) {
			set.status = 400;
			return { message: "Username and password required" };
		}

		const user = await prisma.user.findUnique({
			where: { username: String(username) },
		});

		// Always run a compare even for missing users, to keep timing constant.
		// The fallback is a REAL bcrypt hash of a dummy password — a malformed
		// hash would make compare() return immediately and leak via timing.
		const hash = user?.password || "$2a$12$6pX3jt3ygSEq4KaK3I.3eehUI6NvPsH7Rb1lE66l7ARzloN1erEO2";
		const ok = await bcrypt.compare(String(password), hash);

		if (!user || !ok) {
			set.status = 401;
			return { message: "Incorrect username or password" };
		}

		const session = await getSession(c);
		session.isLoggedIn = true;
		session.username = user.username;
		session.userId = user.id;
		session.loginTime = Date.now();
		await session.save();

			return {
				message: "Logged in",
				username: user.username,
				userId: user.id,
			};
		},
		// Brute-force throttle: 10 login attempts/min/IP (constant-time compare
		// alone doesn't stop credential stuffing).
		{ beforeHandle: [rateLimit({ windowMs: 60_000, max: 10, scope: "login" })] }
	)
	.post("/api/auth/logout", async (c) => {
		const session = await getSession(c);
		if (session) {
			session.destroy();
			await session.save();
		}
		return { message: "Logged out" };
	});

/* ------------------------------------------------------------------ */
/* Authed link management                                             */
/* ------------------------------------------------------------------ */
const authed = new Elysia({ prefix: "/api/links" })
	.derive(async (c) => {
		const session = await getSession(c);
		return { authedUser: await requireLogin(session) };
	})
	// Guard runs before every /api/links handler: derive alone does NOT halt
	// the pipeline in Elysia, and a null authedUser previously left handlers
	// querying with userId: undefined ("no filter") — a full auth bypass.
	.onBeforeHandle(({ authedUser, set }) => {
		if (!authedUser) {
			set.status = 401;
			return { message: "Not logged in" };
		}
	});

authed
	.post("/create", async ({ body, set, authedUser, request }) => {
		let { code, urls, tags } = body || {};
		if (typeof code === "string" && code.trim()) {
			code = sanitizeCode(code);
			if (!code) {
				set.status = 400;
				return { message: "Invalid custom code" };
			}
		} else {
			code = null; // auto-generate
		}

		if (!Array.isArray(urls) || urls.length === 0) {
			set.status = 400;
			return { message: "At least one URL required" };
		}
		const cleaned = [];
		for (const u of urls) {
			const s = sanitizeUrl(u);
			if (!s || isBlockedUrl(s)) {
				set.status = 400;
				return { message: "One or more URLs are invalid" };
			}
			cleaned.push(s);
		}

		const tagsArr = Array.isArray(tags) ? tags : [];
		const buildData = (c) => ({
			code: c,
			isMultiple: cleaned.length > 1,
			belongsTo: { connect: { id: authedUser.userId } },
			urls: {
				create: cleaned.map((u, i) => ({
					url: u,
					tag: typeof tagsArr[i] === "string" && tagsArr[i] ? tagsArr[i] : null,
				})),
			},
		});
		let finalCode;
		if (code) {
			// Custom code: check once, then insert via the same collision-safe path
			// so a race between the check and the insert still can't 500.
			const taken = await prisma.code.findUnique({ where: { code } });
			if (taken) {
				set.status = 400;
				return { message: "That code is already taken" };
			}
			try {
				await prisma.code.create({ data: buildData(code) });
			} catch (e) {
				if (e?.code === "P2002") {
					set.status = 400;
					return { message: "That code is already taken" };
				}
				throw e;
			}
			finalCode = code;
		} else {
			finalCode = (await createCodeRow(buildData)).code;
		}
		invalidateCode(finalCode);
		return { code: finalCode, shortUrl: `${originFor(request)}/${finalCode}` };
	})
	.get("/", async ({ query, authedUser }) => {
		const page = Math.max(1, Number(query?.page) || 1);
		const pageSize = Math.min(50, Math.max(1, Number(query?.pageSize) || 10));
		const skip = pageSize * (page - 1);

		const [codes, totalCodes] = await Promise.all([
			prisma.code.findMany({
				where: { userId: authedUser.userId },
				orderBy: { createdAt: "desc" },
				skip,
				take: pageSize,
				include: { urls: true },
			}),
			prisma.code.count({ where: { userId: authedUser.userId } }),
		]);
		return { codes, totalCodes, page, pageSize };
	})
	.get("/:id", async ({ params, set, authedUser }) => {
		const id = Number(params.id);
		const row = await prisma.code.findFirst({
			where: { id, userId: authedUser?.userId },
			include: { urls: true },
		});
		if (!row) {
			set.status = 404;
			return { message: "Not found" };
		}
		return row;
	})
	.patch("/:id", async ({ params, body, set, authedUser }) => {
		const id = Number(params.id);
		const row = await prisma.code.findFirst({
			where: { id, userId: authedUser?.userId },
		});
		if (!row) {
			set.status = 404;
			return { message: "Not found" };
		}

		let { code, urls, tags } = body || {};
		if (typeof code === "string" && code.trim()) {
			code = sanitizeCode(code);
			if (!code) {
				set.status = 400;
				return { message: "Invalid code" };
			}
			if (code !== row.code) {
				const taken = await prisma.code.findUnique({ where: { code } });
				if (taken) {
					set.status = 400;
					return { message: "Code already taken" };
				}
			}
		} else {
			code = row.code;
		}

		if (Array.isArray(urls) && urls.length > 0) {
			const cleaned = [];
			for (const u of urls) {
				const s = sanitizeUrl(u);
				if (!s || isBlockedUrl(s)) {
					set.status = 400;
					return { message: "Invalid URL" };
				}
				cleaned.push(s);
			}
			const tagsArr = Array.isArray(tags) ? tags : [];
			// URL replace + code rename must be atomic: a crash between deleteMany
			// and create would otherwise leave the link with zero URLs.
			const updated = await prisma.$transaction(async (tx) => {
				await tx.url.deleteMany({ where: { codeId: id } });
				await Promise.all(
					cleaned.map((u, i) =>
						tx.url.create({
							data: {
								codeId: id,
								url: u,
								tag: typeof tagsArr[i] === "string" && tagsArr[i] ? tagsArr[i] : null,
							},
						})
					)
				);
				return tx.code.update({
					where: { id },
					data: { code },
					include: { urls: true },
				});
			});
			invalidateCode(row.code);
			invalidateCode(updated.code);
			return updated;
		}

		const updated = await prisma.code.update({
			where: { id },
			data: { code },
			include: { urls: true },
		});
		// Invalidate both the old and new code — a code may have been renamed.
		invalidateCode(row.code);
		invalidateCode(updated.code);
		return updated;
	})
	.delete("/:id", async ({ params, set, authedUser }) => {
		const id = Number(params.id);
		const row = await prisma.code.findFirst({
			where: { id, userId: authedUser?.userId },
		});
		if (!row) {
			set.status = 404;
			return { message: "Not found" };
		}
		await prisma.code.delete({ where: { id } }); // cascade deletes urls
		invalidateCode(row.code);
		return { message: "Deleted" };
	});

app.use(authed);

/* ------------------------------------------------------------------ */
/* SPA fallback + server                                             */
/* ------------------------------------------------------------------ */
const SPA_INDEX = new URL("../frontend/dist/index.html", import.meta.url);
// Derive the public base URL from the inbound request, so links made via
// any reachable host (localhost, LAN IP, wireguard 192.168.1.10, or a
// reverse proxy domain) echo a working shortUrl instead of a hardcoded one.
function originFor(request, set) {
	const host = request?.headers?.get?.("host");
	if (host) {
		const h = host.toLowerCase();
		// Host header is attacker-controlled: only echo known hosts, otherwise
		// fall back to the configured base URL (prevents link-spoofing).
		// Default allowlist = the baseUrl's own host + common LAN/loopback.
		const baseHost = new URL(config.baseUrl).host.toLowerCase();
		const allowed =
			h === baseHost ||
			config.allowedHosts.includes(h) ||
			/^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(h);
		if (allowed) {
			const proto = request.headers.get("x-forwarded-proto") || "http";
			return `${proto}://${host}`;
		}
	}
	return config.baseUrl;
}

function spaIndex() {
	return new Response(Bun.file(SPA_INDEX.pathname), {
		headers: { "content-type": "text/html; charset=utf-8" },
	});
}

const MIME = {
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".map": "application/json",
};

app.get("*", ({ request }) => {
	// Anything under /api that reached here is a real miss -> let Elysia 404.
	const url = new URL(request.url);
	const pathname = decodeURIComponent(url.pathname);
	if (pathname.startsWith("/api/")) return;

	// Check for an actual file in the built SPA first (JS/CSS/media/fonts).
	const p = pathname.startsWith("/") ? pathname.slice(1) : pathname;
	const dist = new URL("../frontend/dist", import.meta.url);
	const root = dist.pathname.endsWith("/") ? dist.pathname : dist.pathname + "/";
	const candidate = root + p;
	if (p && existsSync(candidate)) {
		const ext = candidate.slice(candidate.lastIndexOf("."));
		return new Response(Bun.file(candidate), {
			headers: {
				...(MIME[ext]
					? { "content-type": MIME[ext] }
					: { "content-type": "application/octet-stream" }),
			},
		});
	}

	// Otherwise it's a client-side route -> SPA index.
	return spaIndex();
});

app.listen(config.port, () => {
	console.log(`🩷 pendek running at http://localhost:${config.port}`);
	// Periodic flush of buffered redirect click counts to Postgres.
	startClickFlush();
});