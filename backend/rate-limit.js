// Simple in-memory fixed-window rate limiter, keyed per client IP.
// Good enough for a single-process homelab app. Swap for Redis if you scale.

// Shared per-window store: name -> Map(ip -> bucket). Each rateLimit() call
// gets its own scope so login/signup/create don't share quota.
const stores = new Map();

function storeFor(scope) {
	let m = stores.get(scope);
	if (!m) stores.set(scope, (m = new Map()));
	return m;
}

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

/**
 * Elysia beforeHandle hook. Returning a response from a beforeHandle hook
 * SHORT-CIRCUITS the pipeline — the wrapped handler never runs — so the
 * limiter only needs to return a 429 to fully block the request.
 */
export function rateLimit({ windowMs = 60_000, max = 100, scope = "default" } = {}) {
	const buckets = storeFor(scope);
	return async function (c) {
		const key = keyFor(c);
		const now = Date.now();
		const bucket = buckets.get(key);

		if (!bucket || bucket.resetAt <= now) {
			buckets.set(key, { count: 1, resetAt: now + windowMs });
			return; // under limit -> proceed to handler
		}

		bucket.count += 1;
		if (bucket.count > max) {
			// prune stale buckets occasionally to avoid unbounded growth
			if (buckets.size > 10_000) {
				for (const [k, v] of buckets) {
					if (v.resetAt <= Date.now()) buckets.delete(k);
				}
			}
			c.set.status = 429;
			return { message: "Too many requests, slow down" };
		}
	};
}

export { keyFor };
