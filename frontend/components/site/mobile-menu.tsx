"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { btn, ctaRow } from "@/components/ui";
import { linkTarget } from "@/lib/site";

interface Props {
  nav: { id: string; label: string }[];
  channels: {
    id: number;
    label: string;
    href: string;
    icon: IconName;
  }[];
  homeHref: string;
  briefHref: string;
  briefLabel: string;
  menuLabel: string;
  closeLabel: string;
}

const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export function MobileMenu({
  nav,
  channels,
  homeHref,
  briefHref,
  briefLabel,
  menuLabel,
  closeLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={menuLabel}
        aria-expanded={open}
        className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-muted text-fg transition-colors hover:bg-muted-hover lg:hidden"
      >
        <Icon name="menu" size={22} />
      </button>

      {isClient &&
        createPortal(
          <div
            role={open ? "dialog" : undefined}
            aria-modal={open || undefined}
            aria-label={open ? menuLabel : undefined}
            aria-hidden={!open}
            inert={!open}
            className={`fixed inset-0 z-40 flex flex-col bg-bg transition-[opacity,visibility] duration-200 ${
              open ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            <div className="flex h-17 flex-none items-center justify-between border-b border-line px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-muted hover:bg-muted-hover"
              >
                <Icon name="close" />
              </button>
            </div>

            <nav className="flex flex-col overflow-y-auto px-5 py-3">
              {nav.map((n, i) => (
                <Link
                  key={n.id}
                  href={`${homeHref}#${n.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 border-b border-line-soft px-1 py-4 text-[26px] font-bold tracking-tight transition-colors hover:text-brand-text"
                >
                  <span className="w-6 text-[13px] font-bold text-fg-4">
                    0{i + 1}
                  </span>
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2.5 px-5 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <Link
                href={briefHref}
                scroll={false}
                onClick={() => setOpen(false)}
                className={btn("primary", ctaRow)}
              >
                {briefLabel}
              </Link>
              {channels.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {channels.map((c) => (
                    <a
                      key={c.id}
                      href={c.href}
                      {...linkTarget(c.href)}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-muted px-2 text-xs font-bold text-fg transition-colors hover:bg-muted-hover"
                    >
                      <Icon
                        name={c.icon}
                        size={17}
                        className="text-brand-text"
                      />
                      <span className="truncate">{c.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
