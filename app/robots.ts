/**
 * @file robots.ts
 * @description robots.txt 생성
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/feed/post/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

