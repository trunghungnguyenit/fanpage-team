import { SectionHead } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n";
import { TINT, TINT_STORY } from "@/lib/projects";

export function Why({ t }: { t: Dictionary }) {
  return (
    <section id="why" className="mx-auto max-w-300 px-5 pt-14 sm:pt-18">
      <SectionHead tint="purple" kicker={t.whyK} title={t.whyH} lede={t.whyP} />
      <div className="reveal grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3">
        {t.why.map((w, i) => {
          const tint = TINT[TINT_STORY[i]];
          const emphasised = i === 1;
          return (
            <div
              key={w.k}
              className={`flex flex-col gap-3.5 rounded-3xl border p-5.5 ${
                emphasised ? "border-line-brand bg-surface" : `border-transparent ${tint.soft}`
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-bold ${tint.fg}`}>
                <span className="tracking-widest uppercase">{w.k}</span>
                <span className="text-[13px]">0{i + 1}</span>
              </div>
              <span className="text-xl leading-tight font-bold tracking-tight">{w.title}</span>
              <ul className="flex flex-col gap-2">
                {w.items.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[15px] leading-snug text-fg-2">
                    <span className={`mt-2 size-1.5 flex-none rounded-full ${tint.dot}`} />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
