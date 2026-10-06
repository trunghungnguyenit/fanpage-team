import "server-only";
import { cache } from "react";
import { IC, type IconName } from "@/components/icons";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

/** Thời gian (giây) dữ liệu từ backend được cache trước khi lấy lại. */
const REVALIDATE_SECONDS = 10;

/** Nội dung dạng danh mục mà `GET /api/content` trả về (đã chọn ngôn ngữ). */
interface ApiContent {
  texts: Omit<
    Dictionary,
    "svc" | "mdl" | "budgets" | "timelines" | "steps" | "faqs" | "channels"
  >;
  services: { key: string; icon: string; title: string; description: string }[];
  engagementModels: {
    key: string;
    isFeatured: boolean;
    defaultServiceKey: string | null;
    situation: string;
    title: string;
    description: string;
    points: string[];
  }[];
  budgetRanges: { key: string; label: string }[];
  timelines: { key: string; label: string }[];
  processSteps: {
    key: string;
    title: string;
    duration: string;
    description: string;
    clientRole: string;
    deliverables: string[];
  }[];
  faqs: { question: string; answer: string }[];
  contactChannels: Dictionary["channels"];
}

/** Gọi backend và cache theo thời gian. Lỗi mạng hoặc mã khác 2xx sẽ ném lỗi để hiện trang lỗi. */
async function fetchApi(path: string): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Backend trả về ${res.status} cho ${path}`);
  }
  return res;
}

/** Icon không có trong bộ icon thì dùng icon mặc định thay vì vẽ trống. */
const toIconName = (icon: string): IconName =>
  icon in IC ? (icon as IconName) : "sparkles";

/**
 * Ghép nội dung từ backend thành `Dictionary` mà các component đang dùng.
 * Mọi nội dung đều đến từ database, frontend không giữ bản sao nào.
 */
export const getDictionary = cache(
  async (lang: Locale): Promise<Dictionary> => {
    const content: ApiContent = await (
      await fetchApi(`/api/content?lang=${lang}`)
    ).json();

    return {
      ...content.texts,
      svc: content.services.map((s) => ({
        key: s.key,
        icon: toIconName(s.icon),
        title: s.title,
        desc: s.description,
      })),
      mdl: content.engagementModels.map((m) => ({
        key: m.key,
        isFeatured: m.isFeatured,
        defaultServiceKey: m.defaultServiceKey,
        situation: m.situation,
        title: m.title,
        desc: m.description,
        points: m.points,
      })),
      budgets: content.budgetRanges,
      timelines: content.timelines,
      steps: content.processSteps.map((s) => ({
        key: s.key,
        title: s.title,
        dur: s.duration,
        desc: s.description,
        role: s.clientRole,
        out: s.deliverables,
      })),
      channels: content.contactChannels,
      faqs: content.faqs.map((f) => ({ q: f.question, a: f.answer })),
    };
  },
);

/** Danh sách dự án đã xuất bản, dự án nổi bật xếp trước. */
export const getProjects = cache(async (lang: Locale): Promise<Project[]> => {
  return (await fetchApi(`/api/projects?lang=${lang}`)).json();
});

/** Chi tiết một dự án, `null` nếu không tồn tại. */
export const getProject = cache(
  async (lang: Locale, id: number): Promise<Project | null> => {
    const res = await fetchApi(`/api/projects/${id}?lang=${lang}`);
    return res.status === 404 ? null : res.json();
  },
);
