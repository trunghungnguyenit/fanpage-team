"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { Icon } from "@/components/icons";
import { useClose } from "@/components/overlay";
import { TINT, TINT_CYCLE } from "@/lib/projects";
import {
  BLANK_BRIEF,
  EMAIL_RE,
  type BriefField,
  type BriefInput,
} from "@/lib/brief";
import { submitBrief } from "@/lib/actions/brief";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n";

export type BriefLabels = Pick<
  Dictionary,
  | "svc"
  | "mdl"
  | "notSure"
  | "budgets"
  | "timelines"
  | "step"
  | "sent"
  | "q1"
  | "q1sub"
  | "errSvc"
  | "q2"
  | "modelLabel"
  | "budget"
  | "start"
  | "q3"
  | "name"
  | "namePh"
  | "email"
  | "phoneZalo"
  | "msg"
  | "msgPh"
  | "privacy"
  | "errName"
  | "errEmail"
  | "back"
  | "next"
  | "submit"
  | "home"
  | "doneT"
  | "doneB"
  | "you"
  | "sumSvc"
  | "sumModel"
  | "ui"
>;

type Step = 1 | 2 | 3 | 4;
type Errors = Partial<Record<BriefField, true>>;

const chip = (on: boolean) =>
  on
    ? "border-brand-text bg-brand-soft-2 text-brand-text"
    : "border-line-strong bg-surface text-fg";

function OptionGrid({
  options,
  value,
  onPick,
  tall,
}: {
  options: { value: string | null; label: string }[];
  value: string | null;
  onPick: (value: string | null) => void;
  tall?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((o) => (
        <button
          key={o.value ?? "none"}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onPick(o.value)}
          className={`flex min-h-14 cursor-pointer items-center rounded-2xl border-[1.5px] px-3.5 text-left text-[15px] leading-snug font-semibold transition-colors ${tall ? "py-2" : ""} ${chip(value === o.value)}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {children}
      {error && (
        <span role="alert" className="text-[13px] font-medium text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

const input =
  "h-13 rounded-xl border-[1.5px] bg-surface px-3.5 text-base font-medium text-fg placeholder:text-fg-4";

export function BriefForm({
  lang,
  t,
  homeHref,
  initial,
}: {
  lang: Locale;
  t: BriefLabels;
  homeHref: string;
  initial?: Partial<BriefInput>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [f, setF] = useState<BriefInput>({ ...BLANK_BRIEF, ...initial });
  const [err, setErr] = useState<Errors>({});
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const close = useClose(homeHref);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Chuyển bước: cuộn về đầu và đưa focus vào tiêu đề để người dùng bàn phím/đọc màn hình biết đã sang bước mới.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [step]);

  const modelOptions = [
    ...t.mdl.map((m) => ({ value: m.key, label: m.title })),
    { value: null, label: t.notSure },
  ];
  const budgetOptions = t.budgets.map((b) => ({
    value: b.key,
    label: b.label,
  }));
  const timelineOptions = t.timelines.map((o) => ({
    value: o.key,
    label: o.label,
  }));
  const labelOf = (
    options: { value: string | null; label: string }[],
    value: string | null,
  ) => options.find((o) => o.value === value)?.label ?? "";

  const set = <K extends keyof BriefInput>(key: K, value: BriefInput[K]) => {
    setF((s) => ({ ...s, [key]: value }));
    setErr((e) => ({ ...e, [key]: false }));
  };

  const submit = () => {
    const errors: Errors = {};
    if (!f.name.trim()) errors.name = true;
    if (!EMAIL_RE.test(f.email)) errors.email = true;
    if (Object.keys(errors).length) {
      setErr(errors);
      document
        .getElementById(errors.name ? "brief-name" : "brief-email")
        ?.focus();
      return;
    }

    setFailed(false);
    startTransition(async () => {
      const res = await submitBrief(lang, f);
      if (res.ok) {
        setErr({});
        setStep(4);
      } else if (res.errors.svc) {
        setErr(res.errors);
        setStep(1);
      } else {
        setErr(res.errors);
        setFailed(Object.keys(res.errors).length === 0);
      }
    });
  };

  const next = () => {
    if (step === 1 && !f.svc.length) return setErr({ svc: true });
    if (step === 3) return submit();
    if (step === 4) return close();
    setErr({});
    setStep((s) => (s + 1) as Step);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  const nextLabel = step === 3 ? t.submit : step === 4 ? t.home : t.next;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <div className="mx-auto w-full max-w-155 flex-none px-5">
        <div className="flex h-16 items-center justify-between">
          <span className="text-sm font-semibold text-fg-3" aria-live="polite">
            {step < 4 ? `${t.step} ${step}/3` : t.sent}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label={t.ui.close}
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted-hover"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-sm transition-colors duration-200 ${n <= Math.min(step, 3) ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-155 px-5 py-7">
          {step === 1 && (
            <>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="outline-none mb-1.5 text-[30px] font-extrabold tracking-[-0.025em]"
              >
                {t.q1}
              </h2>
              <p className="mb-5.5 text-[15px] text-fg-3">{t.q1sub}</p>
              <div className="flex flex-col gap-2.5">
                {t.svc.map((s, i) => {
                  const on = f.svc.includes(s.key);
                  const tint = TINT[TINT_CYCLE[i % 3]];
                  return (
                    <button
                      key={s.title}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        set(
                          "svc",
                          on
                            ? f.svc.filter((x) => x !== s.key)
                            : [...f.svc, s.key],
                        )
                      }
                      className={`flex min-h-15 cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] px-4 text-left text-base font-semibold transition-colors ${chip(on)}`}
                    >
                      <span
                        className={`flex size-9 flex-none items-center justify-center rounded-[10px] ${tint.soft} ${tint.fg}`}
                      >
                        <Icon name={s.icon} size={18} strokeWidth={1.8} />
                      </span>
                      <span className="flex-1 text-fg">{s.title}</span>
                      <span
                        className={`flex size-5.5 flex-none items-center justify-center rounded-[7px] border-[1.5px] text-white ${
                          on
                            ? "border-brand-text bg-brand"
                            : "border-line-strong bg-surface"
                        }`}
                      >
                        {on && <Icon name="check" size={14} strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {err.svc && (
                <p role="alert" className="mt-3.5 text-sm text-danger">
                  {t.errSvc}
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="outline-none mb-5.5 text-[30px] font-extrabold tracking-[-0.025em]"
              >
                {t.q2}
              </h2>
              <div className="mb-2.5 text-sm font-bold">{t.modelLabel}</div>
              <div className="mb-6.5">
                <OptionGrid
                  options={modelOptions}
                  value={f.model}
                  onPick={(v) => set("model", v)}
                  tall
                />
              </div>
              <div className="mb-2.5 text-sm font-bold">{t.budget}</div>
              <div className="mb-6.5">
                <OptionGrid
                  options={budgetOptions}
                  value={f.budget}
                  onPick={(v) => v && set("budget", v)}
                />
              </div>
              <div className="mb-2.5 text-sm font-bold">{t.start}</div>
              <OptionGrid
                options={timelineOptions}
                value={f.timeline}
                onPick={(v) => v && set("timeline", v)}
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="outline-none mb-5.5 text-[30px] font-extrabold tracking-[-0.025em]"
              >
                {t.q3}
              </h2>
              <div className="flex flex-col gap-4.5">
                <Field
                  label={`${t.name} *`}
                  error={err.name ? t.errName : undefined}
                >
                  <input
                    value={f.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={t.namePh}
                    id="brief-name"
                    autoComplete="name"
                    aria-invalid={err.name || undefined}
                    className={`${input} ${err.name ? "border-danger-line" : "border-line-strong"}`}
                  />
                </Field>
                <Field
                  label={`${t.email} *`}
                  error={err.email ? t.errEmail : undefined}
                >
                  <input
                    type="email"
                    value={f.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@company.com"
                    id="brief-email"
                    autoComplete="email"
                    aria-invalid={err.email || undefined}
                    className={`${input} ${err.email ? "border-danger-line" : "border-line-strong"}`}
                  />
                </Field>
                <Field label={t.phoneZalo}>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={f.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+84 …"
                    autoComplete="tel"
                    className={`${input} border-line-strong`}
                  />
                </Field>
                <Field label={t.msg}>
                  <textarea
                    rows={4}
                    value={f.msg}
                    onChange={(e) => set("msg", e.target.value)}
                    placeholder={t.msgPh}
                    className="resize-none rounded-xl border-[1.5px] border-line-strong bg-surface px-3.5 py-3 text-base leading-normal font-medium text-fg placeholder:text-fg-4"
                  />
                </Field>
                <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] leading-normal text-fg-3">
                  <Icon
                    name="lock"
                    size={18}
                    className="flex-none text-brand-text"
                  />
                  {t.privacy}
                </div>
                {failed && (
                  <p role="alert" className="text-sm text-danger">
                    {t.ui.submitError}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="mb-6 flex size-16 items-center justify-center rounded-[20px] bg-tint-green-soft text-success">
                <Icon name="check" size={32} strokeWidth={2.5} />
              </div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="outline-none mb-2.5 text-[32px] leading-[1.1] font-extrabold tracking-[-0.025em]"
              >
                {fmt(t.doneT, {
                  name: f.name.trim().split(" ").pop() || t.you,
                })}
              </h2>
              <p className="mb-6 text-base leading-relaxed text-fg-3">
                {fmt(t.doneB, { email: f.email })}
              </p>
              <dl className="overflow-hidden rounded-2xl border border-line">
                {[
                  [
                    t.sumSvc,
                    f.svc
                      .map((k) => t.svc.find((s) => s.key === k)?.title ?? k)
                      .join(", "),
                  ],
                  [t.sumModel, labelOf(modelOptions, f.model)],
                  [t.budget, labelOf(budgetOptions, f.budget)],
                  [t.start, labelOf(timelineOptions, f.timeline)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-3 border-b border-line-soft px-4 py-3.5 text-sm last:border-b-0"
                  >
                    <dt className="text-fg-3">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>

      <div className="flex-none border-t border-line">
        <div className="mx-auto flex max-w-155 gap-2.5 px-5 pt-3.5 pb-5.5">
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => {
                setErr({});
                setStep((s) => (s - 1) as Step);
              }}
              className="flex h-14 cursor-pointer items-center rounded-2xl border border-line-brand px-5 text-base font-semibold transition-colors hover:bg-brand-soft-2"
            >
              {t.back}
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex h-14 flex-1 cursor-pointer items-center justify-center rounded-2xl bg-brand px-5.5 text-base font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? t.ui.submitting : nextLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
