/**
 * Normalize + validate an inbound URL. Rejects anything that is not
 * http/https, and collapses junk. Returns the cleaned URL or null.
 */
export function sanitizeUrl(raw) {
	if (typeof raw !== "string") return null;
	let url = raw.trim();

	// lowercase scheme only so we accept "HTTP://" but still enforce scheme
	const lower = url.toLowerCase();
	if (
		!lower.startsWith("http://") &&
		!lower.startsWith("https://")
	) {
		return null;
	}

	try {
		// use URL after forcing a scheme so control chars etc. are rejected
		const parsed = new URL(url);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return null;
		}
		// require a host
		if (!parsed.hostname) return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

/** Validate a user-supplied short code (custom link slug). Null if invalid. */
export function sanitizeCode(raw) {
	if (typeof raw !== "string") return null;
	const code = raw.trim();
	if (code.length < 4 || code.length > 25) return null;
	if (!/^[a-zA-Z0-9]+$/.test(code)) return null; // alphanumeric only
	if (/^(dashboard|login|signup|api|pendingka|settings)$/i.test(code)) {
		return null; // reserved words
	}
	return code;
}

/** Reserved-ish: blocks obviously dangerous destinations used for phishing. */
export const BLOCKED_HOST_SUBSTRINGS = [
	"bit.ly", // self-promoted shorteners
	"t.co",
	"tinyurl",
];

export function isBlockedUrl(normalized) {
	try {
		const u = new URL(normalized);
		const host = u.hostname.toLowerCase();
		return BLOCKED_HOST_SUBSTRINGS.some((b) => host.includes(b));
	} catch {
		return true;
	}
}