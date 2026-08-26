import { getIronSession } from "iron-session";
import cookie from "cookie";
import { sessionOptions, config } from "./config.js";

/**
 * iron-session adapter backed by Elysia's raw request Cookie header (read)
 * and the Set-Cookie response header (write). We do NOT rely on the
 * @elysiajs/cookie plugin's derived setCookie — writing the header directly
 * is deterministic.
 */
function makeCookieStore(c) {
	return {
		get(name) {
			const all = cookie.parse(c?.request?.headers?.get?.("cookie") || "");
			const v = all[name];
			return v ? { name, value: v } : undefined;
		},
		set(name, value, opts = {}) {
			const { httpOnly = true, secure, sameSite, path = "/", maxAge, expires } = opts;
			const header = cookie.serialize(name, value, {
				httpOnly,
				secure,
				sameSite,
				path,
				maxAge,
				expires: typeof expires === "string" ? new Date(expires) : expires,
			});
			if (!Array.isArray(c.set.headers["Set-Cookie"])) c.set.headers["Set-Cookie"] = [];
			c.set.headers["Set-Cookie"].push(header);
		},
	};
}

/**
 * Resolve the iron-session for a request. Returns the session object
 * (with .save()/.destroy() wired) or null on error.
 */
export async function getSession(c) {
	try {
		return await getIronSession(makeCookieStore(c), sessionOptions);
	} catch (e) {
		console.error("[session] error:", e?.stack || e?.message || e);
		return null;
	}
}

/** Returns the session if logged in and not expired, else null. */
export async function requireLogin(session) {
	if (!session || session.isLoggedIn !== true) return null;

	if (config.idleRequiresLogout && session.loginTime) {
		const elapsed = Date.now() - session.loginTime;
		if (elapsed > config.logoutTime * 1000) {
			await session.destroy();
			return null;
		}
	}

	return session;
}

/** Returns the session if the user is a superadmin, else null. */
export function requireSuperadmin(session) {
	if (!session || session.isLoggedIn !== true) return null;
	if (session.role !== "superadmin") return null;
	return session;
}

if (!config.cookiePassword || config.cookiePassword.length < 32) {
	throw new Error(
		"[pendek] COOKIE_PASSWORD must be set and at least 32 characters long."
	);
}