import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limit = await checkRateLimit(request, "views");
  if (!limit.success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const redis = new Redis({ url, token });
    const views = await redis.incr("portfolio:views:home");
    return NextResponse.json({ views }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
