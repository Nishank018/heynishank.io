import type { Metadata } from "next";
import { Redis } from "@upstash/redis";
import { InnerPage } from "@/components/sections/inner-page";
import { AnalyticsView } from "./analytics-view";

export const metadata: Metadata = {
  title: "Analytics — Nishank Gupta",
  description: "Portfolio traffic analytics.",
};
export const revalidate = 60;

async function getTotalViews(): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const redis = new Redis({ url, token });
    const count = await redis.get<number>("portfolio:views:home");
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function AnalyticsPage() {
  const totalViews = await getTotalViews();

  return (
    <InnerPage
      route="analytics"
      title="Analytics"
      subtitle="A small window into how this portfolio is used."
    >
      <AnalyticsView totalViews={totalViews} />
    </InnerPage>
  );
}
