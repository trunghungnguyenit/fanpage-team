"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { btn } from "@/components/ui";
import { TINT, TINT_CYCLE } from "@/lib/projects";

interface Service {
  key: string;
  icon: IconName;
  title: string;
  desc: string;
}

/**
 * Chọn một dịch vụ trong lưới, phần mô tả hiện ở một khung cố định bên dưới.
 * Luôn có đúng một dịch vụ được chọn nên không có nhiều ô cùng mở và các ô không bị kéo giãn.
 */
export function ServicePicker({
  items,
  briefHref,
  briefLabel,
}: {
  items: Service[];
  /** Đường dẫn form brief, khóa dịch vụ đang chọn được thêm vào `?svc=`. */
  briefHref: string;
  briefLabel: string;
}) {
  const [active, setActive] = useState(0);
  const current = items[active];
  const currentTint = TINT[TINT_CYCLE[active % 3]];

  return (
    <>
      <div role="tablist" className="reveal grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((s, i) => {
          const on = i === active;
          const tint = TINT[TINT_CYCLE[i % 3]];
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              id={`service-tab-${s.key}`}
              aria-selected={on}
              aria-controls="service-panel"
              onClick={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-[border-color,background-color,box-shadow] ${
                on
                  ? "border-brand-text bg-brand-soft-2 shadow-[0_10px_24px_rgb(43_91_232/0.08)]"
                  : "border-line bg-surface hover:border-line-brand"
              }`}
            >
              <span
                className={`flex size-10 flex-none items-center justify-center rounded-xl ${tint.soft} ${tint.fg}`}
              >
                <Icon name={s.icon} size={20} strokeWidth={1.8} />
              </span>
              <span className="text-[15px] leading-snug font-bold tracking-tight">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div
        key={current.key}
        role="tabpanel"
        id="service-panel"
        aria-labelledby={`service-tab-${current.key}`}
        className="animate-fade-in mt-3 flex flex-col gap-5 rounded-3xl border border-line bg-surface p-[clamp(20px,4vw,32px)] shadow-[0_12px_30px_rgb(15_26_58/0.05)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex size-14 flex-none items-center justify-center rounded-2xl ${currentTint.soft} ${currentTint.fg}`}
          >
            <Icon name={current.icon} size={26} strokeWidth={1.8} />
          </span>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{current.title}</h3>
            <p className="mt-1.5 max-w-[60ch] text-base leading-relaxed text-fg-3">{current.desc}</p>
          </div>
        </div>
        <Link
          href={`${briefHref}?svc=${current.key}`}
          scroll={false}
          className={btn("outline", "h-12 flex-none gap-2 px-5 text-[15px] whitespace-nowrap")}
        >
          {briefLabel}
        </Link>
      </div>
    </>
  );
}
