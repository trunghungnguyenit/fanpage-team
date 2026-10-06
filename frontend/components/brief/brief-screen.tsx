import { BriefForm } from "@/components/brief/brief-form";
import type { BriefInput } from "@/lib/brief";
import type { Dictionary, Locale } from "@/lib/i18n";

export type BriefSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Đọc `?svc=mvp,ui-ux&model=fixed-price` để các CTA khác điền sẵn vào brief.
 * Chỉ nhận các khóa đang có trong nội dung, khóa lạ bị bỏ qua.
 */
export function parseBriefPrefill(
  params: BriefSearchParams,
  t: Pick<Dictionary, "svc" | "mdl">,
): Partial<BriefInput> {
  const serviceKeys = new Set(t.svc.map((s) => s.key));
  const svc = (first(params.svc) ?? "").split(",").filter((k) => serviceKeys.has(k));
  const model = first(params.model);
  return {
    ...(svc.length ? { svc: [...new Set(svc)] } : {}),
    ...(model && t.mdl.some((m) => m.key === model) ? { model } : {}),
  };
}

export function BriefScreen({
  lang,
  t,
  params,
}: {
  lang: Locale;
  t: Dictionary;
  params: BriefSearchParams;
}) {
  return (
    <BriefForm
      lang={lang}
      homeHref={`/${lang}`}
      initial={parseBriefPrefill(params, t)}
      t={{
        svc: t.svc,
        mdl: t.mdl,
        notSure: t.notSure,
        budgets: t.budgets,
        timelines: t.timelines,
        step: t.step,
        sent: t.sent,
        q1: t.q1,
        q1sub: t.q1sub,
        errSvc: t.errSvc,
        q2: t.q2,
        modelLabel: t.modelLabel,
        budget: t.budget,
        start: t.start,
        q3: t.q3,
        name: t.name,
        namePh: t.namePh,
        email: t.email,
        phoneZalo: t.phoneZalo,
        msg: t.msg,
        msgPh: t.msgPh,
        privacy: t.privacy,
        errName: t.errName,
        errEmail: t.errEmail,
        back: t.back,
        next: t.next,
        submit: t.submit,
        home: t.home,
        doneT: t.doneT,
        doneB: t.doneB,
        you: t.you,
        sumSvc: t.sumSvc,
        sumModel: t.sumModel,
        ui: t.ui,
      }}
    />
  );
}
