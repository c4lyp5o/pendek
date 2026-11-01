export const config = {
	port: Number(process.env.PORT) || 5000,
	// iron-session
	cookieName: process.env.COOKIE_NAME || "pendek_session",
	cookiePassword: process.env.COOKIE_PASSWORD, // required, >=32 chars
	cookieTtl: Number(process.env.COOKIE_TTL) || 60 * 60 * 24 * 7, // 7 days, seconds
	logoutTime: Number(process.env.LOGOUT_TIME) || 60 * 60 * 24, // 24h in seconds
	idleRequiresLogout: process.env.LOGOUT_TIME !== undefined,
	// prisma/db
	postgresUrl: process.env.POSTGRES_URL,
	// app
	baseUrl: process.env.BASE_URL || "http://localhost:5000",
	// Comma-separated hosts allowed to appear in generated short URLs
	// (Host header allowlist). Any other Host falls back to baseUrl.
	allowedHosts: (process.env.ALLOWED_HOSTS || "")
		.split(",")
		.map((h) => h.trim().toLowerCase())
		.filter(Boolean),
	codeAlphabet:
		process.env.CODE_ALPHABET || "23456789abcdefghijkmnpqrstuvwxyz",
	codeLength: Number(process.env.CODE_LENGTH) || 6,
	// security
	disableAutoCreate: process.env.DISABLE_AUTO_CREATE === "true",
	honeypotField: process.env.HONEYPOT_FIELD || "company",
	// Only trust X-Forwarded-For when running behind our own reverse proxy.
	trustProxy: process.env.TRUST_PROXY === "true",
	// Input limits for link creation
	maxUrlsPerLink: Number(process.env.MAX_URLS_PER_LINK) || 10,
	maxUrlLength: Number(process.env.MAX_URL_LENGTH) || 2048,
	maxTagLength: Number(process.env.MAX_TAG_LENGTH) || 50,
};

export const sessionOptions = {
	password: config.cookiePassword,
	cookieName: config.cookieName,
	ttl: config.cookieTtl,
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
	},
};