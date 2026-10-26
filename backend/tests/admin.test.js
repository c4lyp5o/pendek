import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Pendek superadmin role system — guards + user CRUD (plan 2026-08-26).
// E2E via a real spawned server (index.js calls app.listen at import, so
// importing it would boot the dev DB + bind the dev port). The server gets
// POSTGRES_URL=pendek_test + PORT=5129; the parent test process only touches
// pendek_test via a dynamic prisma import AFTER the env override.

const ROOT = join(import.meta.dir, "..");
const TEST_PORT = 5129;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const PREFIX = "__TEST_";
// Each request pretends to come from a distinct IP (rate-limit.js keys on
// x-forwarded-for first). Without this, the login limiter (10/min/IP) starves
// later tests and every admin call looks like a 403 auth failure instead.
let ipSeq = 0;
function nextIp() {
	ipSeq += 1;
	return `10.42.${Math.floor(ipSeq / 250) % 250}.${(ipSeq % 250) + 1}`;
}
const ADMIN_USER = `${PREFIX}admin`;
const REG_USER = `${PREFIX}user`;
const ADMIN_PASS = "test-admin-pass-123";
const REG_PASS = "test-user-pass-123";

let prisma = null;
let bcrypt = null;
let proc = null;
let superadminId = null;
let regularId = null;

function testDbUrl() {
	const dev = process.env.POSTGRES_URL || "";
	return dev.replace("/pendek_dev", "/pendek_test");
}

function extractCookie(res) {
	// Bun fetch: getSetCookie() when available, else raw header.
	const getSet = res.headers.getSetCookie?.();
	const raw = getSet && getSet.length > 0 ? getSet[0] : res.headers.get("set-cookie");
	if (!raw) return "";
	return raw.split(";")[0];
}

async function api(path, opts = {}) {
	const headers = {
		"Content-Type": "application/json",
		"X-Forwarded-For": nextIp(),
	};
	if (opts.cookie) headers["Cookie"] = opts.cookie;
	const init = { method: opts.method || "GET", headers };
	if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
	const res = await fetch(`${BASE}${path}`, init);
	let data = null;
	try {
		data = await res.json();
	} catch {
		data = null;
	}
	return { status: res.status, data, cookie: extractCookie(res) };
}

async function login(username, password) {
	return api("/api/auth/login", { method: "POST", body: { username, password } });
}

async function waitForServer(tries = 60) {
	for (let i = 0; i < tries; i++) {
		try {
			const res = await fetch(`${BASE}/api/session`);
			if (res.ok) return true;
		} catch {
			// not up yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
}

beforeAll(async () => {
	// Point THIS process at the scratch DB before prisma is constructed.
	process.env.POSTGRES_URL = testDbUrl();
	const dbmod = await import("../db.js");
	prisma = dbmod.prisma;
	bcrypt = (await import("bcryptjs")).default;

	// Clean leftovers from an aborted run, then seed fixtures.
	await prisma.code.deleteMany({ where: { belongsTo: { username: { startsWith: PREFIX } } } });
	await prisma.user.deleteMany({ where: { username: { startsWith: PREFIX } } });

	const adminHash = await bcrypt.hash(ADMIN_PASS, 12);
	const regHash = await bcrypt.hash(REG_PASS, 12);
	const admin = await prisma.user.create({
		data: { username: ADMIN_USER, password: adminHash, role: "superadmin" },
	});
	const reg = await prisma.user.create({
		data: { username: REG_USER, password: regHash, role: "user" },
	});
	superadminId = admin.id;
	regularId = reg.id;

	// Boot the real server as a child on the scratch DB + test port.
	const env = {
		...process.env,
		PORT: String(TEST_PORT),
		POSTGRES_URL: testDbUrl(),
		NODE_ENV: "test",
	};
	proc = Bun.spawn(["bun", "index.js"], {
		cwd: ROOT,
		env,
		stdout: "ignore",
		stderr: "ignore",
	});
	const up = await waitForServer();
	if (!up) throw new Error("test server never became ready on :5129");
}, 60000);

afterAll(async () => {
	try {
		if (prisma) {
			await prisma.code.deleteMany({
				where: { belongsTo: { username: { startsWith: PREFIX } } },
			});
			await prisma.user.deleteMany({ where: { username: { startsWith: PREFIX } } });
			// Codes owned by deleted test users are SET NULL — sweep them.
			await prisma.code.deleteMany({ where: { userId: null, code: { startsWith: "__" } } });
			const left = await prisma.user.count({ where: { username: { startsWith: PREFIX } } });
			if (left !== 0) console.log(`[admin.test] residue: ${left} ${PREFIX} users left`);
			await prisma.$disconnect();
		}
	} finally {
		if (proc) proc.kill();
	}
});

describe("requireSuperadmin (unit)", () => {
	test("rejects logged-out / regular / wrong-role sessions", async () => {
		const { requireSuperadmin } = await import("../auth.js");
		expect(requireSuperadmin(null)).toBeNull();
		expect(requireSuperadmin({ isLoggedIn: false, role: "superadmin" })).toBeNull();
		expect(requireSuperadmin({ isLoggedIn: true, role: "user" })).toBeNull();
		const s = { isLoggedIn: true, role: "superadmin" };
		expect(requireSuperadmin(s)).toBe(s);
	});
});

describe("admin guards (e2e)", () => {
	test("GET /api/admin/users without login -> 403", async () => {
		const r = await api("/api/admin/users");
		expect(r.status).toBe(403);
		expect(r.data?.message).toMatch(/Superadmin/i);
	});

	test("regular user cannot list users -> 403", async () => {
		const l = await login(REG_USER, REG_PASS);
		expect(l.status).toBe(200);
		const r = await api("/api/admin/users", { cookie: l.cookie });
		expect(r.status).toBe(403);
	});

	test("regular user cannot create users -> 403", async () => {
		const l = await login(REG_USER, REG_PASS);
		const r = await api("/api/admin/users", {
			method: "POST",
			cookie: l.cookie,
			body: { username: `${PREFIX}nope`, password: "password-123", role: "user" },
		});
		expect(r.status).toBe(403);
	});

	test("superadmin cannot touch /api/links -> 403", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		expect(l.status).toBe(200);
		const r = await api("/api/links/", { cookie: l.cookie });
		expect(r.status).toBe(403);
		expect(r.data?.message).toMatch(/cannot manage links/i);
	});

	test("regular user CAN list own links -> 200", async () => {
		const l = await login(REG_USER, REG_PASS);
		const r = await api("/api/links/", { cookie: l.cookie });
		expect(r.status).toBe(200);
		expect(Array.isArray(r.data?.codes)).toBe(true);
	});

	test("superadmin can list users -> 200, no password leak", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api("/api/admin/users", { cookie: l.cookie });
		expect(r.status).toBe(200);
		expect(Array.isArray(r.data?.users)).toBe(true);
		for (const u of r.data.users) {
			expect(u.password).toBeUndefined();
			expect(typeof u.username).toBe("string");
		}
	});

	test("/api/session echoes role", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api("/api/session", { cookie: l.cookie });
		expect(r.status).toBe(200);
		expect(r.data?.role).toBe("superadmin");
	});
});

describe("admin user CRUD (e2e)", () => {
	test("create user happy path", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const uname = `${PREFIX}crud1`;
		const r = await api("/api/admin/users", {
			method: "POST",
			cookie: l.cookie,
			body: { username: uname, password: "crud-pass-123", role: "user" },
		});
		expect(r.status).toBe(200);
		expect(r.data?.user?.username).toBe(uname);
		expect(r.data?.user?.role).toBe("user");
		expect(r.data?.user?.password).toBeUndefined();
		// New user can log in as a regular user.
		const nl = await login(uname, "crud-pass-123");
		expect(nl.status).toBe(200);
		expect(nl.data?.role).toBe("user");
	});

	test("duplicate username -> 400", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api("/api/admin/users", {
			method: "POST",
			cookie: l.cookie,
			body: { username: `${PREFIX}crud1`, password: "crud-pass-123", role: "user" },
		});
		expect(r.status).toBe(400);
		expect(r.data?.message).toMatch(/taken/i);
	});

	test("invalid role -> 400", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api("/api/admin/users", {
			method: "POST",
			cookie: l.cookie,
			body: { username: `${PREFIX}badrole`, password: "password-123", role: "root" },
		});
		expect(r.status).toBe(400);
		expect(r.data?.message).toMatch(/Invalid role/i);
	});

	test("short password -> 400", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api("/api/admin/users", {
			method: "POST",
			cookie: l.cookie,
			body: { username: `${PREFIX}shortpw`, password: "short", role: "user" },
		});
		expect(r.status).toBe(400);
	});

	test("password reset works + old password dies", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const list = await api("/api/admin/users", { cookie: l.cookie });
		const target = list.data.users.find((u) => u.username === `${PREFIX}crud1`);
		expect(target).toBeDefined();
		const pr = await api(`/api/admin/users/${target.id}/password`, {
			method: "PATCH",
			cookie: l.cookie,
			body: { password: "crud-pass-456" },
		});
		expect(pr.status).toBe(200);
		const ok = await login(`${PREFIX}crud1`, "crud-pass-456");
		expect(ok.status).toBe(200);
		const stale = await login(`${PREFIX}crud1`, "crud-pass-123");
		expect(stale.status).toBe(401);
	});

	test("role update with bad value -> 400", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api(`/api/admin/users/${regularId}/role`, {
			method: "PATCH",
			cookie: l.cookie,
			body: { role: "root" },
		});
		expect(r.status).toBe(400);
	});

	test("cannot delete own account -> 400", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api(`/api/admin/users/${superadminId}`, {
			method: "DELETE",
			cookie: l.cookie,
		});
		expect(r.status).toBe(400);
		expect(r.data?.message).toMatch(/own account/i);
	});

	test("delete missing user -> 404", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api("/api/admin/users/2147483000", {
			method: "DELETE",
			cookie: l.cookie,
		});
		expect([404, 400]).toContain(r.status);
	});

	test("promote + delete second superadmin, last one is locked", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		// Promote the crud user to a second superadmin.
		const list = await api("/api/admin/users", { cookie: l.cookie });
		const crud = list.data.users.find((u) => u.username === `${PREFIX}crud1`);
		const promo = await api(`/api/admin/users/${crud.id}/role`, {
			method: "PATCH",
			cookie: l.cookie,
			body: { role: "superadmin" },
		});
		expect(promo.status).toBe(200);
		// Deleting a non-last superadmin is allowed.
		const del = await api(`/api/admin/users/${crud.id}`, {
			method: "DELETE",
			cookie: l.cookie,
		});
		expect(del.status).toBe(200);
		// Now only one superadmin is left (this caller). Deleting it is refused —
		// the own-account guard fires first, so THAT is the message we get. The
		// last-superadmin branch below it is shadowed for a self-delete and only
		// reachable defensively (e.g. a stale session userId).
		const last = await api(`/api/admin/users/${superadminId}`, {
			method: "DELETE",
			cookie: l.cookie,
		});
		expect(last.status).toBe(400);
		expect(last.data?.message).toMatch(/own account/i);
	});

	test("self-demotion as the last superadmin -> 400", async () => {
		const l = await login(ADMIN_USER, ADMIN_PASS);
		const r = await api(`/api/admin/users/${superadminId}/role`, {
			method: "PATCH",
			cookie: l.cookie,
			body: { role: "user" },
		});
		expect(r.status).toBe(400);
		expect(r.data?.message).toMatch(/last superadmin/i);
	});
});
