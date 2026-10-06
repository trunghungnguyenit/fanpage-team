"use client";

import { useState } from "react";
import { ProjectCard, type CardLabels } from "@/components/project-card";
import { SegmentedTabs } from "@/components/ui";
import { fmt, type Locale } from "@/lib/i18n";
import {
  HOME_LIMIT,
  PROJECT_TYPES,
  byFeatured,
  type Project,
  type ProjectType,
} from "@/lib/projects";

interface Props {
  lang: Locale;
  projects: Project[];
  labels: CardLabels;
  allLabel: string;
  showing: string;
  /** Hiển thị bên phải hàng bộ lọc (liên kết "xem tất cả"). */
  action: React.ReactNode;
  /** Hiển thị dưới lưới dự án (nút "xem tất cả"). */
  footer: React.ReactNode;
}

export function WorkGrid({ lang, projects, labels, allLabel, showing, action, footer }: Props) {
  const [filter, setFilter] = useState<"all" | ProjectType>("all");

  const list = projects
    .filter((p) => filter === "all" || p.type === filter)
    .sort(byFeatured)
    .slice(0, HOME_LIMIT);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          value={filter}
          onChange={setFilter}
          items={[{ value: "all", label: allLabel }, ...PROJECT_TYPES]}
        />
        {action}
      </div>

      <div className="reveal grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProjectCard key={p.id} p={p} lang={lang} t={labels} />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2.5">
        {footer}
        <span className="text-[13px] text-fg-4">
          {fmt(showing, { a: list.length, b: projects.length })}
        </span>
      </div>
    </>
  );
}
