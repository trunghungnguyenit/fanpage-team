"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n";
import { isPlaceholder } from "@/lib/placeholder";

type Labels = Pick<Dictionary, "steps" | "yourRole" | "deliverables" | "discoveryFree">;

export function ProcessTabs({ steps, yourRole, deliverables, discoveryFree }: Labels) {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <>
      <div
        role="tablist"
        className="-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pt-0.5 pb-3.5"
      >
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.title}
              type="button"
              role="tab"
              id={`process-tab-${i}`}
              aria-selected={on}
              aria-controls="process-panel"
              onClick={() => setActive(i)}
              className={`flex min-w-[150px] flex-[1_0_auto] cursor-pointer snap-start flex-col gap-1 rounded-2xl border-[1.5px] px-3.5 py-3 text-left transition-colors ${
                on ? "border-brand-text bg-brand-soft-2" : "border-line bg-surface"
              }`}
            >
              <span className={`text-xs font-bold ${on ? "text-brand-text" : "text-fg-4"}`}>
                0{i + 1}
              </span>
              <span className="text-[15px] font-bold whitespace-nowrap">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="process-panel"
        aria-labelledby={`process-tab-${active}`}
        className="reveal grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6 rounded-3xl border border-line bg-surface p-[clamp(20px,4vw,32px)] shadow-[0_12px_30px_rgb(15_26_58/0.05)]"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 items-center rounded-full bg-brand px-3 text-[13px] font-bold text-white">
              0{active + 1} · {step.title}
            </span>
            {!isPlaceholder(step.dur) && (
              <span className="flex h-7 items-center gap-1.5 rounded-full bg-muted px-3 text-[13px] font-semibold text-fg-3">
                <Icon name="clock" size={14} />
                {step.dur}
              </span>
            )}
          </div>
          <p className="text-[17px] leading-relaxed text-pretty">{step.desc}</p>
          <div className="flex items-start gap-3 rounded-2xl bg-tint-purple-soft px-4 py-3.5">
            <Icon name="user" className="mt-px flex-none text-tint-purple-fg" />
            <div>
              <div className="mb-0.5 text-xs font-bold tracking-wider text-tint-purple-fg uppercase">
                {yourRole}
              </div>
              <div className="text-[15px] leading-normal">{step.role}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold tracking-wider text-fg-3 uppercase">
            {deliverables}
          </span>
          {step.out.map((o) => (
            <div
              key={o}
              className="flex items-center gap-3 rounded-xl border border-line-soft bg-surface-2 px-3.5 py-3 text-[15px] font-semibold"
            >
              <span className="flex size-6 flex-none items-center justify-center rounded-lg bg-tint-green-soft text-success">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
              {o}
            </div>
          ))}
          {active === 0 && (
            <div className="mt-1 text-sm font-semibold text-tint-green-fg">{discoveryFree}</div>
          )}
        </div>
      </div>
    </>
  );
}
