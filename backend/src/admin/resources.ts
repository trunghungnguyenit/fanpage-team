import { z } from "zod";
import {
  contactUrl,
  i18nList,
  i18nText,
  imageUrl,
  int,
  nullableKey,
  nullableWebUrl,
  optionalText,
  requiredKey,
  text,
} from "./validation.js";

/** Nơi khác đang tham chiếu tới một dòng, dùng để chặn xóa khi còn được dùng. */
interface UsageRule {
  /** nhãn trả về cho giao diện: projects, briefs, models */
  kind: "projects" | "briefs" | "models";
  table: string;
  column: string;
}

export interface ResourceDef {
  table: string;
  /** cột khóa chính: `id` (số tự tăng) hoặc `key` (chữ, tự sinh từ tên khi tạo mới) */
  pk: "id" | "key";
  orderBy: string;
  schema: z.ZodObject;
  /** với bảng khóa chữ: lấy tên tiếng Việt để sinh khóa */
  keySource?: (body: Record<string, unknown>) => string;
  usage?: UsageRule[];
}

const sortOrder = int(0, 1000).optional();

/** Tên tiếng Việt của một trường hai ngôn ngữ. */
const viOf = (field: string) => (body: Record<string, unknown>) =>
  (body[field] as { vi: string }).vi;

export const RESOURCES: Record<string, ResourceDef> = {
  projects: {
    table: "projects",
    pk: "id",
    orderBy: "id",
    schema: z.object({
      type: z.enum(["web", "mobile", "ai"]),
      service_key: requiredKey,
      is_featured: z.boolean(),
      is_published: z.boolean(),
      title: i18nText(120),
      summary: i18nText(300),
      url: nullableWebUrl,
      tech: z.array(text(40)).max(12, "TOO_MANY|12"),
      images: z.array(imageUrl).max(6, "TOO_MANY|6"),
    }),
  },
  "contact-channels": {
    table: "contact_channels",
    pk: "id",
    orderBy: "sort_order",
    schema: z.object({
      sort_order: sortOrder,
      kind: z.enum(["email", "phone", "zalo", "messenger", "other"]),
      label: i18nText(60),
      value: optionalText(200),
      url: contactUrl,
      is_published: z.boolean(),
    }),
  },
  services: {
    table: "services",
    pk: "key",
    orderBy: "sort_order",
    keySource: viOf("title"),
    schema: z.object({
      sort_order: sortOrder,
      icon: z.string().trim().regex(/^[a-z]{1,30}$/, "INVALID_CHOICE"),
      title: i18nText(80),
      description: i18nText(300),
    }),
    usage: [
      { kind: "projects", table: "projects", column: "service_key" },
      { kind: "briefs", table: "brief_services", column: "service_key" },
      { kind: "models", table: "engagement_models", column: "default_service_key" },
    ],
  },
  "engagement-models": {
    table: "engagement_models",
    pk: "key",
    orderBy: "sort_order",
    keySource: viOf("title"),
    schema: z.object({
      sort_order: sortOrder,
      is_featured: z.boolean(),
      default_service_key: nullableKey,
      situation: i18nText(200),
      title: i18nText(80),
      description: i18nText(300),
      points: i18nList(6, 120),
    }),
    usage: [{ kind: "briefs", table: "briefs", column: "engagement_model_key" }],
  },
  "budget-ranges": {
    table: "budget_ranges",
    pk: "key",
    orderBy: "sort_order",
    keySource: viOf("label"),
    schema: z.object({ sort_order: sortOrder, label: i18nText(60) }),
    usage: [{ kind: "briefs", table: "briefs", column: "budget_key" }],
  },
  timelines: {
    table: "timelines",
    pk: "key",
    orderBy: "sort_order",
    keySource: viOf("label"),
    schema: z.object({ sort_order: sortOrder, label: i18nText(60) }),
    usage: [{ kind: "briefs", table: "briefs", column: "timeline_key" }],
  },
  "process-steps": {
    table: "process_steps",
    pk: "key",
    orderBy: "sort_order",
    keySource: viOf("title"),
    schema: z.object({
      sort_order: sortOrder,
      title: i18nText(60),
      duration: i18nText(40),
      description: i18nText(400),
      client_role: i18nText(200),
      deliverables: i18nList(6, 120),
    }),
  },
  faqs: {
    table: "faqs",
    pk: "id",
    orderBy: "sort_order",
    schema: z.object({
      sort_order: sortOrder,
      question: i18nText(200),
      answer: i18nText(1000),
    }),
  },
};
