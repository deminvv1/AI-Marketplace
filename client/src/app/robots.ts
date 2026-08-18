import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Members-only areas: crawling them only ever yields the sign-in redirect. */
const DISALLOW = [
  "/dashboard", "/settings", "/messages", "/projects", "/proposals",
  "/profile", "/search", "/specialists", "/solutions", "/forum",
  "/saved", "/admin", "/project-alerts", "/onboarding",
  "/register", "/login", "/auth/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOW }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
