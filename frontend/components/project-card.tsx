import Link from "next/link";
import { StarIcon } from "@/components/icons";
import { ProjectCover } from "@/components/project-cover";
import type { Dictionary, Locale } from "@/lib/i18n";
import { isPlaceholder } from "@/lib/placeholder";
import { PROJECT_TYPES, TINT, TYPE_TINT, hostnameOf, type Project } from "@/lib/projects";

const techChip =
  "flex h-6 items-center rounded-lg border border-line bg-surface-2 px-2.5 text-xs font-semibold text-fg-3";

export type CardLabels = Pick<Dictionary, "featuredTag">;

export function ProjectCard({ p, lang, t }: { p: Project; lang: Locale; t: CardLabels }) {
  const tint = TINT[TYPE_TINT[p.type]];
  // Bỏ các giá trị giữ chỗ để thẻ không hiện "[Tech]".
  const tech = p.tech.filter((name) => !isPlaceholder(name));

  return (
    <Link
      href={`/${lang}/projects/${p.id}`}
      scroll={false}
      className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_1px_2px_rgb(15_26_58/0.04)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-brand hover:shadow-[0_14px_30px_rgb(15_26_58/0.08)]"
    >
      <div className={`relative h-[150px] overflow-hidden ${tint.cover}`}>
        <ProjectCover src={p.image} alt={p.title} />
        {p.isFeatured && (
          <span className="absolute top-2.5 right-2.5 flex h-6 items-center gap-1 rounded-full bg-brand px-2.5 text-xs font-bold text-white">
            <StarIcon />
            {t.featuredTag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-4.5 pt-4 pb-4.5">
        <span className={`flex h-6 w-fit items-center rounded-full px-2.5 text-xs font-bold ${tint.chip} ${tint.fg}`}>
          {PROJECT_TYPES.find((x) => x.value === p.type)?.label}
        </span>
        <span className="text-lg leading-tight font-bold tracking-tight">{p.title}</span>
        <span className="text-sm leading-normal text-fg-3">{p.summary}</span>
        {tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tech.map((name, i) => (
              <span key={`${name}-${i}`} className={techChip}>
                {name}
              </span>
            ))}
          </div>
        )}
        {p.url && (
          <span className="mt-auto truncate border-t border-line-soft pt-3 text-[13px] font-semibold text-brand-text">
            {hostnameOf(p.url)}
          </span>
        )}
      </div>
    </Link>
  );
}
