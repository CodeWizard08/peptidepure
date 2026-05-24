import { Redis } from '@upstash/redis';

// Sliding-window rate limiter built on the same Upstash Redis instance that
// backs lib/content.ts. We avoid taking @upstash/ratelimit as a dep since
// we only need one shape of limiter and want full visibility into the
// fail-open path.
//
// Design: per key, we keep a sorted set whose members are timestamped
// event markers (score = ms epoch). Each call:
//   1. removes expired markers (score < now - windowMs)
//   2. adds a new marker for this event
//   3. counts the set
//   4. refreshes the TTL so idle keys evict naturally
// If the count after adding exceeds `max`, the request is over the limit.
//
// Fail-open policy: if Upstash isn't configured (dev) or the round trip
// errors (network blip, quota exhaustion), `allowed = true`. The alternative
// is denying every submission during a Redis outage, which blocks legitimate
// patients during a failure mode we can't observe in real time. The Codex
// rescue review accepted that tradeoff explicitly.

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export type RateLimitResult = {
  allowed: boolean;
  /** Count after this event was recorded. 0 when fail-open. */
  current: number;
  limit: number;
  /** ms until the oldest event in the window expires (0 when fail-open). */
  retryAfterMs: number;
  /** False if Upstash isn't configured or errored. */
  configured: boolean;
};

export async function slidingWindowLimit({
  key,
  max,
  windowMs,
}: {
  key: string;
  max: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const kv = getRedis();
  if (!kv) {
    return { allowed: true, current: 0, limit: max, retryAfterMs: 0, configured: false };
  }

  const now = Date.now();
  const cutoff = now - windowMs;
  // Random suffix so two events within the same ms still produce distinct
  // sorted-set members. ZADD with a duplicate member silently replaces.
  const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const pipeline = kv.pipeline();
    pipeline.zremrangebyscore(key, 0, cutoff);
    pipeline.zadd(key, { score: now, member });
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    const results = (await pipeline.exec()) as [number, number, number, number];
    const count = results[2];

    return {
      allowed: count <= max,
      current: count,
      limit: max,
      retryAfterMs: count > max ? windowMs : 0,
      configured: true,
    };
  } catch (err) {
    console.error('[rate-limit] Upstash error, failing open:', err);
    return { allowed: true, current: 0, limit: max, retryAfterMs: 0, configured: false };
  }
}

/**
 * Extract the client IP from a Next.js Request.
 *
 * Header preference, per Vercel's request-headers docs
 * (https://vercel.com/docs/edge-network/headers/request-headers):
 *   1. `x-vercel-forwarded-for` — Vercel-set, equivalent to `x-forwarded-for`
 *      but NOT overwritable by a proxy sitting on top of Vercel.
 *   2. `x-forwarded-for` — Vercel overwrites whatever the client sent with
 *      the verified peer IP ("we do not forward external IPs ... to prevent
 *      IP spoofing"), so on a pure Vercel deployment this is also safe.
 *   3. `x-real-ip` — Vercel says this is identical to (2); kept as a
 *      fallback for non-Vercel hosting.
 *
 * We take the leftmost CSV entry (original client) per the X-Forwarded-For
 * RFC convention. Codex rescue review round 2 flagged the previous "trust
 * XFF first" design as spoofable if anything ever serves this route
 * outside of Vercel's edge; the Vercel-specific header closes that gap.
 */
export function getClientIp(headers: Headers): string {
  const vercel = headers.get('x-vercel-forwarded-for');
  if (vercel) {
    const first = vercel.split(',')[0]?.trim();
    if (first) return first;
  }
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'anonymous';
}
