// Simple in-memory fixed-window rate limiter, keyed per client IP.
// Good enough for a single-process homelab app. Swap for Redis if you scale.

const buckets = new Map();

function keyFor(c) {
	const fwd = c?.request?.headers?.get?.("x-forwarded-for");
	let ip = fwd ? fwd.split(",")[0].trim() : "";
	if (!ip) {
		try {
			ip = c?.server?.requestIP?.(c.request)?.address || "";
		} catch {
			/* ignore */
		}
	}
	return ip || "unknown";
}

export function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
	return async function (c) {
		const key = keyFor(c);
		const now = Date.now();
		const bucket = buckets.get(key);

		if (!bucket || bucket.resetAt <= now) {
			buckets.set(key, { count: 1, resetAt: now + windowMs });
			return;
		}

		bucket.count += 1;
		if (bucket.count > max) {
			// prune stale buckets occasionally to avoid unbounded growth
			if (buckets.size > 10_000) {
				for (const [k, v] of buckets) {
					if (v.resetAt <= Date.now()) buckets.delete(k);
				}
			}
			return c.redirect(`/error?reason=rate`); // handled by SPA
		}
	};
}

export { keyFor };