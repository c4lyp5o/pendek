import { LRUCache } from 'lru-cache';

export default function slowDown(options) {
  const delayAfter = options?.delayAfter || 100;
  const delayMs = options?.delayMs || 500;
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    delay: (request, token) =>
      new Promise((resolve) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const delay =
          currentUsage >= delayAfter
            ? (currentUsage - delayAfter + 1) * delayMs
            : 0;

        setTimeout(resolve, delay);
      }),
  };
}
