import { getSupabase, unwrap } from "../db/supabase.js";
import type { Brief, FieldErrors } from "../schemas/brief.js";

/** Tập khóa đang có trong một bảng tra cứu. */
async function keysOf(table: string): Promise<Set<string>> {
  const rows = unwrap(
    await getSupabase().from(table).select("key").overrideTypes<{ key: string }[], { merge: false }>(),
  );
  return new Set(rows.map((r) => r.key));
}

/** Kiểm tra các khóa lựa chọn của brief có tồn tại trong database, trả về các trường sai. */
export async function findInvalidOptions(brief: Brief): Promise<FieldErrors> {
  const [services, models, budgets, timelines] = await Promise.all([
    keysOf("services"),
    keysOf("engagement_models"),
    keysOf("budget_ranges"),
    keysOf("timelines"),
  ]);

  const errors: FieldErrors = {};
  if (!brief.services.every((s) => services.has(s))) errors.services = true;
  if (brief.engagementModel !== null && !models.has(brief.engagementModel)) errors.engagementModel = true;
  if (!budgets.has(brief.budget)) errors.budget = true;
  if (!timelines.has(brief.timeline)) errors.timeline = true;
  return errors;
}

/** Lưu brief và các dịch vụ đã chọn (một transaction trong hàm `submit_brief`), trả về id brief. */
export async function createBrief(brief: Brief): Promise<string> {
  return unwrap(
    await getSupabase().rpc("submit_brief", {
      p_locale: brief.locale,
      p_name: brief.name,
      p_email: brief.email,
      p_phone: brief.phone,
      p_message: brief.message,
      p_engagement_model: brief.engagementModel,
      p_budget: brief.budget,
      p_timeline: brief.timeline,
      p_services: brief.services,
    }),
  ) as string;
}
