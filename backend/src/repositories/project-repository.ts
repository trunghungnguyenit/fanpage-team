import { getSupabase, unwrap } from "../db/supabase.js";
import { localize, type I18n, type Locale } from "../i18n.js";
import { fetchOgImage } from "../services/og-image.js";

export const PROJECT_TYPES = ["web", "mobile", "ai"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Thời gian trước khi lấy lại ảnh: ngắn hơn khi lần trước không tìm thấy ảnh. */
const REFRESH_AFTER_MS = { found: 24 * 60 * 60 * 1000, missing: 60 * 60 * 1000 };

interface ProjectRow {
  id: number;
  type: ProjectType;
  service_key: string;
  is_featured: boolean;
  title: I18n;
  summary: I18n;
  /** địa chỉ website đang chạy, `null` nếu chưa có */
  url: string | null;
  tech: string[];
  /** ảnh nhập tay, luôn được ưu tiên hơn ảnh tự lấy */
  images: string[];
  og_image: string | null;
  og_image_checked_at: string | null;
  og_image_source: string | null;
}

const toProject = (p: ProjectRow, locale: Locale) => ({
  id: p.id,
  type: p.type,
  serviceKey: p.service_key,
  isFeatured: p.is_featured,
  title: localize(p.title, locale),
  summary: localize(p.summary, locale),
  url: p.url,
  tech: p.tech,
  image: p.images[0] ?? p.og_image ?? null,
});

/** Dự án cần lấy ảnh tự động: có website, chưa có ảnh nhập tay, và chưa lấy hoặc đã quá hạn hoặc url đã đổi. */
function needsOgRefresh(p: ProjectRow): boolean {
  if (!p.url || p.images.length > 0) return false;
  if (!p.og_image_checked_at || p.og_image_source !== p.url) return true;
  const ttl = p.og_image ? REFRESH_AFTER_MS.found : REFRESH_AFTER_MS.missing;
  return Date.now() - Date.parse(p.og_image_checked_at) > ttl;
}

/** Dự án đang được lấy ảnh, tránh chạy trùng khi có nhiều request cùng lúc. */
const refreshing = new Set<number>();

async function saveOgImage(p: ProjectRow & { url: string }) {
  try {
    const image = await fetchOgImage(p.url);
    unwrap(
      await getSupabase()
        .from("projects")
        .update({
          og_image: image,
          og_image_checked_at: new Date().toISOString(),
          og_image_source: p.url,
        })
        .eq("id", p.id),
    );
  } catch (err) {
    console.error("[og-image] không cập nhật được dự án", p.id, err);
  }
}

/** Lấy ảnh ở chế độ nền: phản hồi API không phải chờ, lần gọi sau sẽ có ảnh. */
function refreshOgImages(rows: ProjectRow[]) {
  for (const p of rows) {
    if (!p.url || !needsOgRefresh(p) || refreshing.has(p.id)) continue;
    refreshing.add(p.id);
    void saveOgImage({ ...p, url: p.url }).finally(() => refreshing.delete(p.id));
  }
}

/** Danh sách dự án đã xuất bản, dự án nổi bật xếp trước. */
export async function listProjects(locale: Locale, type?: ProjectType) {
  let query = getSupabase().from("projects").select("*").eq("is_published", true);
  if (type) query = query.eq("type", type);
  const rows = unwrap(
    await query
      .order("is_featured", { ascending: false })
      .order("id")
      .overrideTypes<ProjectRow[], { merge: false }>(),
  );
  refreshOgImages(rows);
  return rows.map((p) => toProject(p, locale));
}

/** Chi tiết một dự án đã xuất bản, `null` nếu không tồn tại. */
export async function getProject(id: number, locale: Locale) {
  const [row] = unwrap(
    await getSupabase()
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .limit(1)
      .overrideTypes<ProjectRow[], { merge: false }>(),
  );
  if (!row) return null;
  refreshOgImages([row]);
  return toProject(row, locale);
}
