"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="reveal flex flex-col gap-2.5">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div
            key={f.q}
            className={`rounded-2xl border transition-colors ${
              on ? "border-line-brand bg-brand-soft-2" : "border-line bg-surface"
            }`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex min-h-15 w-full cursor-pointer items-center justify-between gap-3.5 px-4.5 py-3.5 text-left text-base leading-snug font-bold"
              >
                {f.q}
                <span className="flex size-[30px] flex-none items-center justify-center rounded-[9px] border border-line bg-surface">
                  <Icon
                    name="plus"
                    size={16}
                    strokeWidth={2.2}
                    className={`text-brand-text transition-transform duration-200 ${on ? "rotate-45" : ""}`}
                  />
                </span>
              </button>
            </h3>
            {on && (
              <p
                id={`faq-${i}`}
                className="px-4.5 pb-4.5 text-[15px] leading-relaxed text-pretty text-fg-2"
              >
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
