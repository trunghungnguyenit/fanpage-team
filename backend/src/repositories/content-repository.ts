import { getSupabase, unwrap } from "../db/supabase.js";
import { localize, type I18n, type Locale } from "../i18n.js";

interface ServiceRow {
  key: string;
  icon: string;
  title: I18n;
  description: I18n;
}
interface EngagementModelRow {
  key: string;
  is_featured: boolean;
  default_service_key: string | null;
  situation: I18n;
  title: I18n;
  description: I18n;
  points: I18n<string[]>;
}
interface OptionRow {
  key: string;
  label: I18n;
}
interface ProcessStepRow {
  key: string;
  title: I18n;
  duration: I18n;
  description: I18n;
  client_role: I18n;
  deliverables: I18n<string[]>;
}
interface SiteTextRow {
  key: string;
  value: I18n<unknown>;
}
interface ContactChannelRow {
  id: number;
  kind: string;
  label: I18n;
  value: string;
  url: string;
}
interface FaqRow {
  id: number;
  question: I18n;
  answer: I18n;
}

/** Lấy toàn bộ một bảng nội dung, sắp theo `sort_order`. */
const selectAll = async <T>(table: string) =>
  unwrap(
    await getSupabase()
      .from(table)
      .select("*")
      .order("sort_order")
      .overrideTypes<T[], { merge: false }>(),
  );

/** Chữ giao diện: object `{ khóa: giá trị theo ngôn ngữ }`, giá trị có thể là chuỗi, mảng hoặc object. */
async function getTexts(locale: Locale) {
  const rows = unwrap(
    await getSupabase().from("site_texts").select("*").overrideTypes<SiteTextRow[], { merge: false }>(),
  );
  return Object.fromEntries(rows.map((r) => [r.key, localize(r.value, locale)]));
}

/** Kênh liên hệ đã bật và đã điền giá trị; kênh còn trống bị bỏ qua. */
async function getContactChannels() {
  return unwrap(
    await getSupabase()
      .from("contact_channels")
      .select("*")
      .eq("is_published", true)
      .neq("value", "")
      .order("sort_order")
      .overrideTypes<ContactChannelRow[], { merge: false }>(),
  );
}

/** Toàn bộ nội dung trang (dịch vụ, hình thức hợp tác, quy trình, FAQ…) theo ngôn ngữ. */
export async function getContent(locale: Locale) {
  const [texts, services, models, budgets, timelines, steps, faqs, channels] = await Promise.all([
    getTexts(locale),
    selectAll<ServiceRow>("services"),
    selectAll<EngagementModelRow>("engagement_models"),
    selectAll<OptionRow>("budget_ranges"),
    selectAll<OptionRow>("timelines"),
    selectAll<ProcessStepRow>("process_steps"),
    selectAll<FaqRow>("faqs"),
    getContactChannels(),
  ]);

  return {
    texts,
    services: services.map((s) => ({
      key: s.key,
      icon: s.icon,
      title: localize(s.title, locale),
      description: localize(s.description, locale),
    })),
    engagementModels: models.map((m) => ({
      key: m.key,
      isFeatured: m.is_featured,
      defaultServiceKey: m.default_service_key,
      situation: localize(m.situation, locale),
      title: localize(m.title, locale),
      description: localize(m.description, locale),
      points: localize(m.points, locale),
    })),
    budgetRanges: budgets.map((b) => ({ key: b.key, label: localize(b.label, locale) })),
    timelines: timelines.map((t) => ({ key: t.key, label: localize(t.label, locale) })),
    processSteps: steps.map((s) => ({
      key: s.key,
      title: localize(s.title, locale),
      duration: localize(s.duration, locale),
      description: localize(s.description, locale),
      clientRole: localize(s.client_role, locale),
      deliverables: localize(s.deliverables, locale),
    })),
    contactChannels: channels.map((c) => ({
      id: c.id,
      kind: c.kind,
      label: localize(c.label, locale),
      value: c.value,
      url: c.url,
    })),
    faqs: faqs.map((f) => ({
      id: f.id,
      question: localize(f.question, locale),
      answer: localize(f.answer, locale),
    })),
  };
}
