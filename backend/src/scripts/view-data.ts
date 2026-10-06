// Xem nhanh dữ liệu trong Supabase: số dòng mỗi bảng, brief theo trạng thái và brief mới nhất.
// Chạy: npm run db:view -w backend

import { getSupabase, unwrap } from "../db/supabase.js";

const TABLES = [
  "site_texts",
  "services",
  "engagement_models",
  "budget_ranges",
  "timelines",
  "process_steps",
  "faqs",
  "contact_channels",
  "projects",
  "briefs",
  "brief_services",
] as const;

const BRIEF_STATUSES = ["new", "contacted", "qualified", "closed"] as const;

interface LatestBrief {
  id: string;
  created_at: string;
  locale: string;
  name: string;
  email: string;
  status: string;
  engagement_model_key: string | null;
  budget_key: string;
  timeline_key: string;
  brief_services: { service_key: string }[];
}

/** Che bớt email để không in dữ liệu cá nhân đầy đủ ra màn hình. */
const maskEmail = (email: string) => email.replace(/^(.).*(@.*)$/, "$1***$2");

async function countRows(table: string, filter?: { column: string; value: string }) {
  let query = getSupabase().from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) throw new Error(`Không đọc được bảng ${table}: ${error.message}`);
  return count ?? 0;
}

async function main() {
  console.log("== Số dòng mỗi bảng ==");
  console.table(
    Object.fromEntries(await Promise.all(TABLES.map(async (t) => [t, { rows: await countRows(t) }]))),
  );

  console.log("== Brief theo trạng thái ==");
  console.table(
    Object.fromEntries(
      await Promise.all(
        BRIEF_STATUSES.map(async (s) => [s, { rows: await countRows("briefs", { column: "status", value: s }) }]),
      ),
    ),
  );

  const latest = unwrap(
    await getSupabase()
      .from("briefs")
      .select(
        "id, created_at, locale, name, email, status, engagement_model_key, budget_key, timeline_key, brief_services(service_key)",
      )
      .order("created_at", { ascending: false })
      .limit(5)
      .overrideTypes<LatestBrief[], { merge: false }>(),
  );

  console.log("== 5 brief mới nhất ==");
  console.table(
    latest.map((b) => ({
      tạoLúc: b.created_at,
      ngônNgữ: b.locale,
      tên: b.name,
      email: maskEmail(b.email),
      trạngThái: b.status,
      dịchVụ: b.brief_services.map((s) => s.service_key).join(", "),
      hìnhThức: b.engagement_model_key ?? "chưa chắc",
      ngânSách: b.budget_key,
      thờiGian: b.timeline_key,
    })),
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
