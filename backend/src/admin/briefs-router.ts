import { Router } from "express";
import { z } from "zod";
import { getSupabase } from "../db/supabase.js";
import { notFound, unwrapAdmin } from "./errors.js";
import { optionalText, parseBody } from "./validation.js";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;
const PAGE_SIZE = 20;
const EXPORT_LIMIT = 5000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface BriefRow {
  id: string;
  created_at: string;
  locale: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  engagement_model_key: string | null;
  budget_key: string;
  timeline_key: string;
  status: string;
  internal_note: string;
  brief_services: { service_key: string }[];
}

const listQuery = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(60, "TOO_LONG|60").optional(),
  page: z.coerce.number().int().min(1).default(1),
});

const updateBody = z.object({
  status: z.enum(STATUSES),
  internal_note: optionalText(2000),
});

/** Bỏ ký tự có nghĩa đặc biệt trong bộ lọc PostgREST để từ khóa tìm kiếm không đổi được câu lọc. */
const safeTerm = (q: string) => q.replace(/[%,()*\\"'.:]/g, " ").replace(/\s+/g, " ").trim();

/** Truy vấn brief kèm các dịch vụ đã chọn, áp bộ lọc trạng thái và từ khóa (tên hoặc email). */
function briefQuery(filters: { status?: string; q?: string }, options?: { count?: "exact" }) {
  let query = getSupabase()
    .from("briefs")
    .select("*, brief_services(service_key)", options)
    .order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  const term = filters.q ? safeTerm(filters.q) : "";
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  return query;
}

/** Đưa `brief_services` về danh sách khóa dịch vụ. */
const toBrief = ({ brief_services, ...rest }: BriefRow) => ({
  ...rest,
  services: brief_services.map((s) => s.service_key),
});

/** Ô CSV: bọc nháy kép, và chặn công thức (=, +, -, @) khi mở bằng Excel. */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Bảng khóa -> nhãn tiếng Việt của một bảng danh mục, để file CSV dễ đọc. */
async function labelMap(table: string, field: "title" | "label") {
  const rows = unwrapAdmin(
    await getSupabase()
      .from(table)
      .select(`key, ${field}`)
      .overrideTypes<Record<string, unknown>[], { merge: false }>(),
  );
  return new Map(rows.map((r) => [r.key as string, (r[field] as { vi: string }).vi]));
}

export const briefsRouter = Router();

briefsRouter.get("/", async (req, res) => {
  const filters = parseBody(listQuery, req.query);
  const from = (filters.page - 1) * PAGE_SIZE;

  const query = briefQuery(filters, { count: "exact" }).range(from, from + PAGE_SIZE - 1);
  const { data, count, error } = await query.overrideTypes<BriefRow[], { merge: false }>();
  if (error) throw new Error(`Không đọc được brief: ${error.message}`);

  res.json({ items: data.map(toBrief), total: count ?? 0, page: filters.page, pageSize: PAGE_SIZE });
});

briefsRouter.get("/export.csv", async (req, res) => {
  const filters = parseBody(listQuery, req.query);
  const rows = unwrapAdmin(
    await briefQuery(filters).limit(EXPORT_LIMIT).overrideTypes<BriefRow[], { merge: false }>(),
  ).map(toBrief);

  const [services, models, budgets, timelines] = await Promise.all([
    labelMap("services", "title"),
    labelMap("engagement_models", "title"),
    labelMap("budget_ranges", "label"),
    labelMap("timelines", "label"),
  ]);

  const header = ["Thời gian gửi", "Họ tên", "Email", "Điện thoại", "Ngôn ngữ", "Dịch vụ", "Hình thức", "Ngân sách", "Bắt đầu", "Trạng thái", "Nội dung", "Ghi chú nội bộ"];
  const lines = rows.map((b) =>
    [
      b.created_at,
      b.name,
      b.email,
      b.phone,
      b.locale,
      b.services.map((k) => services.get(k) ?? k).join("; "),
      b.engagement_model_key ? (models.get(b.engagement_model_key) ?? b.engagement_model_key) : "Chưa chắc",
      budgets.get(b.budget_key) ?? b.budget_key,
      timelines.get(b.timeline_key) ?? b.timeline_key,
      b.status,
      b.message,
      b.internal_note,
    ]
      .map(csvCell)
      .join(","),
  );

  // BOM giúp Excel đọc đúng tiếng Việt có dấu.
  const csv = `﻿${[header.map(csvCell).join(","), ...lines].join("\r\n")}`;
  res
    .type("text/csv; charset=utf-8")
    .set("Content-Disposition", `attachment; filename="brief-${new Date().toISOString().slice(0, 10)}.csv"`)
    .send(csv);
});

briefsRouter.put("/:id", async (req, res) => {
  if (!UUID.test(req.params.id)) throw notFound();
  const body = parseBody(updateBody, req.body);

  const rows = unwrapAdmin(
    await getSupabase()
      .from("briefs")
      .update(body)
      .eq("id", req.params.id)
      .select("*, brief_services(service_key)")
      .overrideTypes<BriefRow[], { merge: false }>(),
  );
  if (rows.length === 0) throw notFound();
  res.json({ item: toBrief(rows[0]) });
});

briefsRouter.delete("/:id", async (req, res) => {
  if (!UUID.test(req.params.id)) throw notFound();
  const rows = unwrapAdmin(
    await getSupabase().from("briefs").delete().eq("id", req.params.id).select("id"),
  );
  if (rows.length === 0) throw notFound();
  res.status(204).end();
});
