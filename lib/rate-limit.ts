import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Scope = "chat" | "contact" | "views";
type LimitResult = { configured: boolean; success: boolean; retryAfter: number };
const limits = new Map<Scope, Ratelimit>();
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redisClient) {
    redisClient = new Redis({ url, token });
  }
  return redisClient;
}

function limiterFor(scope: Scope) {
  const redis = getRedis();
  if (!redis) return null;
  const existing = limits.get(scope);
  if (existing) return existing;
  const limit = scope === "chat" ? 12 : scope === "contact" ? 5 : 30;
  const window = scope === "contact" ? "1 h" : "1 m";
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `portfolio:${scope}`,
  });
  limits.set(scope, limiter);
  return limiter;
}

export async function checkRateLimit(request: Request, scope: Scope): Promise<LimitResult> {
  const limiter = limiterFor(scope);
  if (!limiter) return { configured: false, success: true, retryAfter: 0 };

  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identifier = cfConnectingIp || realIp || forwarded || "127.0.0.1";
  try {
    const result = await limiter.limit(identifier);
    return {
      configured: true,
      success: result.success,
      retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error(`Upstash ${scope} rate limit unavailable; allowing request.`, error);
    return { configured: true, success: true, retryAfter: 0 };
  }
}
