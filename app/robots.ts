import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  let origin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (origin && !origin.startsWith("http://") && !origin.startsWith("https://")) {
    origin = `https://${origin}`;
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    ...(origin ? { sitemap: new URL("/sitemap.xml", origin).toString() } : {}),
  };
}
