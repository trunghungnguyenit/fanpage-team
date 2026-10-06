import Link from "next/link";
import { Logo } from "@/components/logo";
import { btn } from "@/components/ui";
import { DesktopNav } from "@/components/site/desktop-nav";
import { MobileMenu } from "@/components/site/mobile-menu";
import type { Dictionary, Locale } from "@/lib/i18n";
import { CHANNEL_ICONS, NAV_SECTIONS } from "@/lib/site";

export function Header({ lang, t }: { lang: Locale; t: Dictionary }) {
  const homeHref = `/${lang}`;
  const briefHref = `/${lang}/brief`;
  const nav = NAV_SECTIONS.map((id) => ({ id, label: t[id] }));
  // Menu mobile chỉ hiện kênh có liên kết để bấm được.
  const channels = t.channels
    .filter((c) => c.url)
    .map((c) => ({
      id: c.id,
      label: c.label,
      href: c.url,
      icon: CHANNEL_ICONS[c.kind],
    }));

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-header backdrop-blur-xl">
      <div className="mx-auto flex h-17 max-w-300 items-center justify-between gap-4 px-5">
        <Link href={homeHref} aria-label="HTCode" className="flex min-h-11 items-center">
          <Logo />
        </Link>

        <DesktopNav items={nav} homeHref={homeHref} />

        <div className="flex items-center gap-2">
          <Link
            href={briefHref}
            scroll={false}
            className={btn(
              "primary",
              "h-11 gap-2 rounded-xl px-4.5 text-[15px] whitespace-nowrap shadow-none max-lg:hidden",
            )}
          >
            {t.ctaPrimary}
          </Link>
          <MobileMenu
            nav={nav}
            channels={channels}
            homeHref={homeHref}
            briefHref={briefHref}
            briefLabel={t.sendBrief}
            menuLabel={t.ui.menu}
            closeLabel={t.ui.close}
          />
        </div>
      </div>
    </header>
  );
}
