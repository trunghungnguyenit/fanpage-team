"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** CTA nổi chỉ hiện trên mobile, trượt vào sau khi cuộn qua hero. */
export function StickyCta({
  href,
  label,
  sub,
}: {
  href: string;
  label: string;
  sub: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-[560px] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[140%] opacity-0"
      }`}
    >
      <Link
        href={href}
        scroll={false}
        tabIndex={visible ? 0 : -1}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand px-5 text-base font-semibold text-white shadow-[0_14px_30px_rgb(43_91_232/0.35)] transition-colors hover:bg-brand-hover"
      >
        <span className="flex flex-col items-center gap-px text-center">
          <span>{label}</span>
          <span className="text-xs font-medium text-on-brand-muted">{sub}</span>
        </span>
      </Link>
    </div>
  );
}
