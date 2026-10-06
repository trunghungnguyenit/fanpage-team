import Link from "next/link";
import { Icon } from "@/components/icons";
import { btn } from "@/components/ui";
import { isPlaceholder } from "@/lib/placeholder";
import type { Dictionary, Locale } from "@/lib/i18n";
import { TINT, TINT_CYCLE } from "@/lib/projects";

const STAT_ICONS = ["rocket", "clock", "code"] as const;

/**
 * Mỗi dòng trong `stats` có dạng "<số> <nhãn>", ví dụ "25+ sản phẩm đã ra mắt".
 * Dòng còn giữ chỗ ("[Placeholder] ...") bị ẩn cho đến khi có số liệu thật.
 */
function parseStats(stats: string[]) {
  return stats
    .map((line, i) => {
      const [value, ...rest] = line.split(" ");
      return { icon: STAT_ICONS[i], value, label: rest.join(" ") };
    })
    .filter((s) => !isPlaceholder(s.value));
}

function Illustration() {
  return (
    <div
      aria-hidden="true"
      className="animate-float pointer-events-none absolute top-[110px] -right-6 hidden aspect-[1/1.05] w-[clamp(160px,34vw,460px)] opacity-55 sm:block lg:opacity-100"
    >
      <div className="absolute inset-[6%_0_18%_14%] rounded-2xl border border-line bg-gradient-to-br from-brand-soft-2 to-brand-soft" />
      <div className="absolute top-[2%] left-[30%] h-[16%] w-[26%] -rotate-12 rounded-xl bg-tint-blue-chip" />
      <div className="absolute top-[24%] right-[4%] left-[22%] flex h-[36%] flex-col rounded-2xl bg-gradient-to-br from-[#5a83f7] to-brand p-[6%_8%] shadow-[0_18px_40px_rgb(43_91_232/0.28)]">
        <div className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1.5 rounded-full bg-white/70" />
          ))}
        </div>
        <div className="flex flex-1 items-center justify-center font-mono text-[clamp(18px,4vw,44px)] leading-none font-semibold text-white/90">
          &lt;/&gt;
        </div>
      </div>
      <div className="absolute right-[6%] bottom-[14%] flex h-[26%] w-[44%] items-end justify-center rounded-2xl border border-line bg-surface p-[8%] shadow-[0_12px_30px_rgb(15_26_58/0.08)]">
        <div className="h-[60%] w-[70%] rounded-lg bg-gradient-to-br from-illo-a to-illo-b" />
      </div>
      <div className="absolute bottom-[24%] left-[18%] aspect-[1.2] w-[10%] rounded-md bg-tint-blue-chip" />
    </div>
  );
}

export function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const stats = parseStats(t.stats);
  return (
    <section
      id="top"
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(120% 70% at 110% 100%, var(--hero-glow-1) 0, transparent 60%), radial-gradient(60% 40% at 0% 100%, var(--hero-glow-2) 0, transparent 70%)",
      }}
    >
      <div className="pointer-events-none absolute -right-[60px] -bottom-40 size-[520px] rounded-full border border-hero-ring shadow-[0_0_0_60px_color-mix(in_srgb,var(--hero-ring)_25%,transparent),0_0_0_120px_color-mix(in_srgb,var(--hero-ring)_15%,transparent)]" />
      <div className="relative mx-auto max-w-300 px-5 pt-11 pb-14">
        <Illustration />

        <div className="animate-rise relative max-w-[660px]">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-brand-soft px-3.5 text-xs font-bold tracking-[0.12em] text-brand-text uppercase">
            <span className="size-1.5 rounded-full bg-brand-text" />
            {t.kicker}
          </span>
          <h1 className="text-display mt-5 mb-5 max-w-[12ch] text-balance">
            {t.h1a} <span className="text-brand-text">{t.h1b}</span> {t.h1c}
          </h1>
          <p className="mb-7 max-w-[40ch] text-[17px] leading-relaxed text-pretty text-fg-3">
            {t.lede}
          </p>
          <div className="flex max-w-[560px] flex-wrap gap-3">
            <Link
              href={`/${lang}/brief`}
              scroll={false}
              className={btn(
                "primary",
                "h-14 flex-[1_1_240px] justify-center px-5.5 text-[17px]",
              )}
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}#work`}
              className={btn(
                "outline",
                "h-14 flex-[1_1_200px] justify-center px-5.5 text-[17px]",
              )}
            >
              {t.ctaSecondary}
            </Link>
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-fg-3">
            {t.reassure.map((r) => (
              <li key={r} className="flex items-center gap-1.5">
                <Icon
                  name="check"
                  size={15}
                  strokeWidth={2.4}
                  className="text-success"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {stats.length > 0 && (
          <ul className="relative mt-11 grid max-w-[760px] grid-cols-[repeat(auto-fit,minmax(min(30%,170px),1fr))] gap-3">
            {stats.map((s, i) => {
              const tint = TINT[TINT_CYCLE[i]];
              return (
                <li
                  key={s.label}
                  className={`flex flex-col gap-2.5 rounded-2xl border border-fg/5 px-3.5 pt-4 pb-4.5 ${tint.soft}`}
                >
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${tint.chip} ${tint.fg}`}
                  >
                    <Icon name={s.icon} />
                  </span>
                  <span className="text-[clamp(22px,4vw,30px)] leading-none font-bold tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-[13px] leading-snug text-fg-3">
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
