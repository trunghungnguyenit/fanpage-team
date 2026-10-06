import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Form brief không có giá trị để lập chỉ mục.
    rules: { userAgent: "*", allow: "/", disallow: ["/vi/brief", "/en/brief", "/admin"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
