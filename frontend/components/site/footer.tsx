import Link from "next/link";
import { LangSwitch } from "@/components/lang-switch";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Dictionary, Locale } from "@/lib/i18n";
import { NAV_SECTIONS } from "@/lib/site";

export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <footer className="mt-18 border-t border-line bg-surface-2">
      <div className="mx-auto flex max-w-300 flex-col gap-6 px-5 pt-9 pb-30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <nav className="flex flex-wrap gap-x-4.5 gap-y-1">
            {NAV_SECTIONS.map((id) => (
              <Link
                key={id}
                href={`/${lang}#${id}`}
                className="flex min-h-11 min-w-11 items-center justify-center px-1 text-sm font-semibold text-fg-2 transition-colors hover:text-brand-text"
              >
                {t[id]}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1.5 text-[13px] text-fg-4">
          <span>© 2026 HTCode · [{t.legal}]</span>
          <span>{t.address}</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <LangSwitch lang={lang} label={t.ui.language} />
          <ThemeToggle label={t.ui.theme} />
        </div>
      </div>
    </footer>
  );
}
