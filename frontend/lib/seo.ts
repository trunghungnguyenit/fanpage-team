import { locales, type Locale } from "@/lib/i18n";

/** Địa chỉ gốc của website, dùng cho canonical, Open Graph và sitemap. */
export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

/** Canonical của trang trong ngôn ngữ hiện tại và các bản dịch (hreflang). `path` bắt đầu bằng "/" hoặc để trống. */
export function languageAlternates(lang: Locale, path = "") {
  return {
    canonical: `/${lang}${path}`,
    languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
  };
}
