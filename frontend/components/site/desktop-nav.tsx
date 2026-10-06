"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Menu desktop, tự đánh dấu mục tương ứng với phần đang nằm giữa màn hình. */
export function DesktopNav({
  items,
  homeHref,
}: {
  items: { id: string; label: string }[];
  homeHref: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // Chỉ xét dải giữa màn hình để mục được chọn là phần người dùng đang đọc.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Menu" className="hidden items-center gap-1 lg:flex">
      {items.map((n) => {
        const on = active === n.id;
        return (
          <Link
            key={n.id}
            href={`${homeHref}#${n.id}`}
            aria-current={on ? "location" : undefined}
            className={`flex h-11 items-center rounded-xl px-3 text-[15px] font-semibold transition-colors ${
              on ? "bg-brand-soft text-brand-text" : "text-fg-2 hover:bg-muted hover:text-fg"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
