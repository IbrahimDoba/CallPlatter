import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/privacy", "/terms", "/api/", "/admin/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
