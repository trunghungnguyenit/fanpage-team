"use client";

import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname();

  // Đổi segment ngôn ngữ ở đầu, giữ nguyên phần đường dẫn còn lại.
  // Dùng thẻ <a> (tải lại toàn trang) vì đổi ngôn ngữ thay cả root layout.
  const hrefFor = (target: Locale) => `/${target}${pathname.replace(/^\/[^/]+/, "")}`;

  return (
    <div role="group" aria-label={label} className="flex rounded-xl bg-muted p-1">
      {locales.map((l) => {
        const on = l === lang;
        return (
          <a
            key={l}
            href={hrefFor(l)}
            hrefLang={l}
            aria-current={on ? "true" : undefined}
            className={`flex h-11 w-12 items-center justify-center rounded-[9px] text-[13px] font-bold transition-colors ${
              on ? "bg-surface text-fg shadow-sm" : "text-fg-3 hover:text-fg"
            }`}
          >
            {l.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
