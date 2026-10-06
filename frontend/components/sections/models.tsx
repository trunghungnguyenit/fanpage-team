import Link from "next/link";
import { Icon } from "@/components/icons";
import { SectionHead } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Models({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="models" className="mx-auto max-w-300 px-5 pt-14 sm:pt-18">
      <SectionHead tint="purple" kicker={t.models} title={t.modelsH} lede={t.modelsP} />
      <div className="reveal grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-stretch gap-3.5">
        {t.mdl.map((m) => {
          // Chọn hình thức hợp tác sẽ điền sẵn hình thức và dịch vụ mặc định trong brief.
          const params = new URLSearchParams({ model: m.key });
          if (m.defaultServiceKey) params.set("svc", m.defaultServiceKey);
          const href = `/${lang}/brief?${params}`;

          return (
            <div
              key={m.key}
              className={`relative flex flex-col gap-3.5 rounded-3xl bg-surface px-5.5 pt-6 pb-5.5 ${
                m.isFeatured
                  ? "border-2 border-brand-text shadow-[0_16px_36px_rgb(43_91_232/0.12)]"
                  : "border border-line"
              }`}
            >
              {m.isFeatured && (
                <span className="absolute -top-[13px] left-5.5 flex h-[26px] items-center rounded-full bg-brand px-3 text-xs font-bold text-white">
                  {t.bestMvp}
                </span>
              )}
              <span className="text-[15px] leading-snug text-fg-3 italic">“{m.situation}”</span>
              <span className="text-[22px] font-extrabold tracking-tight">{m.title}</span>
              <span className="text-[15px] leading-normal text-fg-2">{m.desc}</span>
              <ul className="flex flex-col gap-2 border-t border-line-soft pt-1">
                {m.points.map((x) => (
                  <li key={x} className="flex gap-2.5 pt-1.5 text-sm leading-snug">
                    <Icon name="check" size={16} strokeWidth={2.4} className="mt-0.5 flex-none text-brand-text" />
                    {x}
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                scroll={false}
                className={`mt-auto flex h-[50px] items-center justify-center rounded-xl border px-4.5 text-[15px] font-semibold transition-[filter] hover:brightness-95 ${
                  m.isFeatured
                    ? "border-brand bg-brand text-white"
                    : "border-line-brand bg-surface text-fg"
                }`}
              >
                {t.soundsLikeUs}
              </Link>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-2xl bg-tint-green-soft px-4.5 py-3.5 text-[15px] text-tint-green-fg">
        <Icon name="gift" />
        <span className="min-w-[220px] flex-1">
          <strong>{t.retainerT}</strong> {t.retainerP}
        </span>
      </div>
    </section>
  );
}
