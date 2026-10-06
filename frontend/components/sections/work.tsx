import Link from "next/link";
import { WorkGrid } from "@/components/sections/work-grid";
import { SectionHead, btn } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

export function Work({ lang, t, projects }: { lang: Locale; t: Dictionary; projects: Project[] }) {
  const allHref = `/${lang}/projects`;
  const labels = {
    featuredTag: t.featuredTag,
  };

  return (
    <section id="work" className="mx-auto max-w-300 px-5 pt-14 sm:pt-18">
      <SectionHead kicker={t.work} title={t.workH} />
      <p className="-mt-0.5 mb-5 max-w-[56ch] text-base leading-relaxed text-fg-3">{t.workP}</p>
      <WorkGrid
        lang={lang}
        projects={projects}
        labels={labels}
        allLabel={t.all}
        showing={t.showing}
        action={
          <Link
            href={allHref}
            scroll={false}
            className="flex h-11 items-center gap-1.5 px-1 text-[15px] font-bold text-brand-text transition-colors hover:text-fg"
          >
            {t.viewAll}
          </Link>
        }
        footer={
          <Link href={allHref} scroll={false} className={btn("outline", "h-14 gap-2.5 px-6.5 text-base")}>
            {t.viewAll}
          </Link>
        }
      />
    </section>
  );
}
