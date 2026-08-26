import { prisma } from "./db.js";

/**
 * Redirect hot path — in-process LRU.
 *
 * Cold store = Postgres (source of truth). Hot store here caches the exact
 * shape the redirect handler needs (target urls + flags), keyed by short code.
 * Invalidation happens on every write mutation (create/edit/delete) in index.js.
 */
class LruCache {
	constructor(maxEntries = 10_000) {
		this.max = maxEntries;
		this.map = new Map();
	}

	get(key) {
		if (!this.map.has(key)) return undefined;
		const val = this.map.get(key);
		// move to most-recent so eviction targets the least-recently-used
		this.map.delete(key);
		this.map.set(key, val);
		return val;
	}

	set(key, val) {
		if (this.map.has(key)) this.map.delete(key);
		this.map.set(key, val);
		if (this.map.size > this.max) {
			// evict oldest (first inserted) entry
			const oldest = this.map.keys().next().value;
			this.map.delete(oldest);
		}
	}

	del(key) {
		this.map.delete(key);
	}

	clear() {
		this.map.clear();
	}

	get size() {
		return this.map.size;
	}
}

export const redirectCache = new LruCache();

/**
 * Negative cache for invalid codes, so a flood of bogus short codes doesn't
 * hammer Postgres. Kept deliberately TTL-bounded (30s) so a legitimately
 * created code becomes resolvable almost immediately.
 */
export const negativeCache = new LruCache(Math.floor(2_000));

export function isNegativelyCached(code) {
	const hit = negativeCache.get(code);
	return hit !== undefined && Date.now() - hit < 30_000;
}

export function cacheNegative(code) {
	negativeCache.set(code, Date.now());
}

/* ------------------------------------------------------------------ */
/* Click counter — buffered, flushed in batches.                      */
/* ------------------------------------------------------------------ */
// codeId -> pending click count
const clicks = new Map();
let flushing = false;

export function trackClick(codeId) {
	clicks.set(codeId, (clicks.get(codeId) || 0) + 1);
}

/**
 * Write buffered clicks to Postgres as a single raw increment per code,
 * WITHOUT touching @updatedAt (Prisma's code.update would churn it and make
 * every link look freshly edited).
 */
export async function flushClicks() {
	if (clicks.size === 0) return;
	const pending = Array.from(clicks.entries());
	clicks.clear();
	await Promise.all(
		pending.map(([id, n]) =>
			prisma.$executeRaw`
				UPDATE "Code"
				SET "timesClicked" = "timesClicked" + ${n}
				WHERE "id" = ${id}
			`
		)
	);
}

/** Start the periodic counter flush. Guarded against overlapping runs. */
export function startClickFlush(intervalMs = 10_000) {
	setInterval(async () => {
		if (flushing) return;
		flushing = true;
		try {
			await flushClicks();
		} catch (err) {
			console.error("[cache] click flush failed:", err?.message || err);
		} finally {
			flushing = false;
		}
	}, intervalMs);
}