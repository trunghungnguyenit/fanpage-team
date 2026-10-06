import type { ReactNode } from "react";
import { TINT, type Tint } from "@/lib/projects";

type Variant = "primary" | "outline" | "light" | "ghost";

const base =
  "inline-flex items-center rounded-2xl font-semibold transition-[background-color,border-color,transform,color] cursor-pointer active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/25",
  outline:
    "bg-surface border border-line-brand text-fg hover:bg-brand-soft-2 hover:border-line-brand-hover",
  light: "bg-white text-brand-deep hover:bg-brand-soft",
  ghost: "bg-muted text-fg hover:bg-muted-hover rounded-xl",
};

/** Chuỗi class cho nút và liên kết có giao diện nút. */
export function btn(variant: Variant, extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

/** Hàng CTA full chiều rộng: nhãn bên trái, icon bên phải. */
export const ctaRow = "h-14 w-full justify-center px-5 text-base";

export function Pill({
  tint,
  children,
  className = "",
}: {
  tint: Tint | "brand";
  children: ReactNode;
  className?: string;
}) {
  const t = tint === "brand" ? TINT.blue : TINT[tint];
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold tracking-[0.12em] uppercase ${t.soft} ${t.fg} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  tint = "blue",
  kicker,
  title,
  lede,
}: {
  tint?: Tint;
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <>
      <Pill tint={tint}>{kicker}</Pill>
      <h2 className="text-h2 mt-3.5 mb-2 max-w-[20ch] text-balance">{title}</h2>
      {lede && <p className="mb-7 max-w-[56ch] text-base leading-relaxed text-fg-3">{lede}</p>}
    </>
  );
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  className = "",
  itemClass = "h-11 px-3.5 text-sm",
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  itemClass?: string;
}) {
  return (
    <div role="tablist" className={`inline-flex gap-1 rounded-2xl bg-muted p-1 ${className}`}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            className={`min-w-11 cursor-pointer rounded-xl font-semibold whitespace-nowrap transition-colors ${itemClass} ${
              on ? "bg-surface text-fg shadow-sm" : "text-fg-3 hover:text-fg"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
