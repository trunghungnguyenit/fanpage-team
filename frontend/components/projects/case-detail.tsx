import Link from "next/link";
import { Icon } from "@/components/icons";
import { CloseButton } from "@/components/overlay";
import { ProjectCover } from "@/components/project-cover";
import { btn } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { isPlaceholder } from "@/lib/placeholder";
import { PROJECT_TYPES, TINT, TYPE_TINT, hostnameOf, type Project } from "@/lib/projects";

const techChip =
  "flex h-[30px] items-center rounded-[10px] border border-line bg-surface-2 px-3 text-[13px] font-semibold text-fg-3";

/** Thông tin tóm tắt của dự án kèm nút mở website đang chạy. Hiển thị trong sheet overlay hoặc trên trang riêng. */
export function CaseDetail({ p, lang, t }: { p: Project; lang: Locale; t: Dictionary }) {
  const tint = TINT[TYPE_TINT[p.type]];
  const typeLabel = PROJECT_TYPES.find((x) => x.value === p.type)?.label;
  const svcName = t.svc.find((s) => s.key === p.serviceKey)?.title;
  const tech = p.tech.filter((name) => !isPlaceholder(name));

  return (
    <article>
      <div className="sticky top-0 z-10 bg-surface">
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-sm bg-line-strong" />
        </div>
        <div className="flex items-center justify-between px-5 py-2.5">
          <span className="flex h-[26px] items-center rounded-full bg-brand-soft px-3 text-xs font-bold text-brand-text">
            {t.ui.caseStudy} · {typeLabel}
          </span>
          <CloseButton
            fallbackHref={`/${lang}/projects`}
            aria-label={t.ui.close}
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted-hover"
          >
            <Icon name="close" size={18} />
          </CloseButton>
        </div>
      </div>

      <div className="px-5 pt-1">
        <div className={`relative h-[220px] overflow-hidden rounded-2xl ${tint.cover}`}>
          <ProjectCover src={p.image} alt={p.title} />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pt-5 pb-7">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-1.5">
            <span className={`flex h-6 items-center rounded-full px-2.5 text-xs font-bold ${tint.chip} ${tint.fg}`}>
              {typeLabel}
            </span>
            {svcName && (
              <span className="flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-semibold text-fg-3">
                {svcName}
              </span>
            )}
          </div>
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{p.title}</h1>
          <p className="text-[15px] leading-relaxed text-fg-3">{p.summary}</p>
        </div>

        {tech.length > 0 && (
          <div>
            <div className="mb-2 text-[13px] font-bold">{t.techL}</div>
            <div className="flex flex-wrap gap-2">
              {tech.map((name, i) => (
                <span key={`${name}-${i}`} className={techChip}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={btn("primary", "h-14 w-full flex-col justify-center gap-0 px-5.5 text-base shadow-none")}
            >
              {t.visitSite}
              <span className="text-xs font-medium text-on-brand-muted">{hostnameOf(p.url)}</span>
            </a>
          )}
          <Link
            href={`/${lang}/brief?svc=${p.serviceKey}`}
            scroll={false}
            replace
            className={btn(p.url ? "outline" : "primary", "h-14 w-full justify-center px-5.5 text-base shadow-none")}
          >
            {t.similar}
          </Link>
        </div>
      </div>
    </article>
  );
}
