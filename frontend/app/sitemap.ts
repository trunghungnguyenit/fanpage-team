import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

// Danh sách dự án lấy từ database nên phải tính lại mỗi lần, không chốt lúc build.
export const dynamic = "force-dynamic";

/** Mỗi địa chỉ kèm bản dịch tương ứng để công cụ tìm kiếm liên kết các ngôn ngữ. */
const entry = (path: string): MetadataRoute.Sitemap =>
  locales.map((lang) => ({
    url: `${SITE_URL}/${lang}${path}`,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
    },
  }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projectIds: number[] = [];
  try {
    projectIds = (await getProjects("vi")).map((p) => p.id);
  } catch {
    // Backend chưa sẵn sàng: vẫn trả về các trang tĩnh.
  }

  return [
    ...entry(""),
    ...entry("/projects"),
    ...projectIds.flatMap((id) => entry(`/projects/${id}`)),
  ];
}
