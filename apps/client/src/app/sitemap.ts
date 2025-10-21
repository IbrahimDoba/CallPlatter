import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getPosts } from "@/lib/marble/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = siteConfig.url;

  const corePages = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  // Get blog posts and create sitemap entries
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogData = await getPosts();
    if (blogData && blogData.posts) {
      blogPages = blogData.posts.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  // Combine all pages
  return [...corePages, ...blogPages];
}
