import Link from "next/link";
import { Icon } from "@/components/icons";
import { CloseButton } from "@/components/overlay";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { Pill, btn } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

/** Màn hình "Tất cả dự án", hiển thị dạng overlay (bị chặn route) hoặc dạng trang. */
export function ProjectsScreen({
  lang,
  t,
  projects,
}: {
  lang: Locale;
  t: Dictionary;
  projects: Project[];
}) {
  const home = `/${lang}`;
  const brief = `/${lang}/brief`;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-line bg-header backdrop-blur-xl">
        <div className="mx-auto flex h-17 max-w-300 items-center justify-between gap-3 px-5">
          <CloseButton
            fallbackHref={home}
            className="flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-muted pr-3.5 pl-2.5 text-[15px] font-semibold transition-colors hover:bg-muted-hover"
          >
            <Icon name="arrowLeft" size={18} />
            {t.backHome}
          </CloseButton>
          <span className="truncate text-base font-bold">{t.allTitle}</span>
          <Link href={brief} scroll={false} className={btn("primary", "h-11 gap-1.5 rounded-xl px-4 text-sm whitespace-nowrap shadow-none")}>
            {t.briefShort}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-300 px-5 pt-9">
        <Pill tint="blue">{t.work}</Pill>
        <h1 className="mt-3.5 mb-2 text-[clamp(2.125rem,6vw,3.5rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
          {t.allH}
        </h1>
        <p className="mb-6 max-w-[56ch] text-base leading-relaxed text-fg-3">{t.allP}</p>

        <ProjectsExplorer
          lang={lang}
          projects={projects}
          t={{
            featuredTag: t.featuredTag,
            searchPh: t.searchPh,
            serviceL: t.serviceL,
            sortL: t.sortL,
            sortFeat: t.sortFeat,
            sortNew: t.sortNew,
            allSvc: t.allSvc,
            results: t.results,
            resultsOne: t.resultsOne,
            more: t.more,
            clearFilters: t.clearFilters,
            noResults: t.noResults,
            all: t.all,
            svc: t.svc,
          }}
        />

        <div className="mt-14 mb-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-[clamp(24px,5vw,48px)] text-white">
          <div className="flex max-w-[520px] flex-col gap-2">
            <h2 className="text-[clamp(1.625rem,4vw,2.375rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
              {t.allCtaH}
            </h2>
            <p className="text-[15px] leading-relaxed text-on-brand-muted">
              {t.reply24} · {t.ndaShort}
            </p>
          </div>
          <Link href={brief} scroll={false} className={btn("light", "h-14 gap-2.5 px-5.5 text-base font-bold")}>
            {t.sendBrief}
          </Link>
        </div>
      </div>
    </div>
  );
}
