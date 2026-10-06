"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { ProjectCard, type CardLabels } from "@/components/project-card";
import { SegmentedTabs } from "@/components/ui";
import { fmt, type Dictionary, type Locale } from "@/lib/i18n";
import {
  PAGE_SIZE,
  PROJECT_TYPES,
  byFeatured,
  type Project,
  type ProjectType,
} from "@/lib/projects";

export type ExplorerLabels = CardLabels &
  Pick<
    Dictionary,
    | "searchPh"
    | "serviceL"
    | "sortL"
    | "sortFeat"
    | "sortNew"
    | "allSvc"
    | "results"
    | "resultsOne"
    | "more"
    | "clearFilters"
    | "noResults"
    | "all"
    | "svc"
  >;

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-bold text-fg-3">
      {label}
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-xl border-[1.5px] border-line-strong bg-surface pr-9 pl-3 text-sm font-semibold text-fg"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          size={16}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-4"
        />
      </span>
    </label>
  );
}

export function ProjectsExplorer({
  lang,
  projects,
  t,
}: {
  lang: Locale;
  projects: Project[];
  t: ExplorerLabels;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | ProjectType>("all");
  const [svc, setSvc] = useState("-1");
  const [sort, setSort] = useState<"featured" | "newest">("featured");
  const [show, setShow] = useState(PAGE_SIZE);

  // Mọi thay đổi bộ lọc đều đưa phân trang về ban đầu.
  const withReset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setShow(PAGE_SIZE);
    };

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (type !== "all" && p.type !== type) return false;
        if (svc !== "-1" && p.serviceKey !== svc) return false;
        if (!needle) return true;
        const service = t.svc.find((s) => s.key === p.serviceKey)?.title ?? "";
        return [p.title, p.summary, service].some((s) =>
          s.toLowerCase().includes(needle),
        );
      })
      .sort(sort === "newest" ? (a, b) => b.id - a.id : byFeatured);
  }, [projects, q, type, svc, sort, t]);

  const hasActive = !!q.trim() || type !== "all" || svc !== "-1";
  const clearAll = () => {
    setQ("");
    setType("all");
    setSvc("-1");
    setShow(PAGE_SIZE);
  };
  const remaining = list.length - show;

  return (
    <>
      <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-2 p-3.5">
        <label className="relative block">
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute top-[15px] left-3.5 text-fg-4"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => withReset(setQ)(e.target.value)}
            placeholder={t.searchPh}
            aria-label={t.searchPh}
            className="h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-surface pr-3.5 pl-[42px] text-base font-medium text-fg placeholder:text-fg-4"
          />
        </label>
        <SegmentedTabs
          value={type}
          onChange={withReset(setType)}
          className="w-full overflow-x-auto"
          itemClass="h-11 flex-1 px-3.5 text-sm"
          items={[{ value: "all", label: t.all }, ...PROJECT_TYPES]}
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-2.5">
          <Select
            label={t.serviceL}
            value={svc}
            onChange={withReset(setSvc)}
            options={[
              { value: "-1", label: t.allSvc },
              ...t.svc.map((s) => ({ value: s.key, label: s.title })),
            ]}
          />
          <Select
            label={t.sortL}
            value={sort}
            onChange={(v) => withReset(setSort)(v as "featured" | "newest")}
            options={[
              { value: "featured", label: t.sortFeat },
              { value: "newest", label: t.sortNew },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 mb-4 flex flex-wrap items-center justify-between gap-2">
        <span role="status" className="text-[15px] font-semibold">
          {fmt(list.length === 1 ? t.resultsOne : t.results, {
            n: list.length,
          })}
        </span>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="flex min-h-11 cursor-pointer items-center px-1 text-sm font-semibold text-brand-text hover:text-fg"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, show).map((p) => (
          <ProjectCard key={p.id} p={p} lang={lang} t={t} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 rounded-3xl border border-dashed border-line-brand px-5 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
            <Icon name="search" size={22} />
          </span>
          <span className="text-[17px] font-bold">{t.noResults}</span>
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer text-sm font-semibold text-brand-text"
          >
            {t.clearFilters}
          </button>
        </div>
      )}

      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShow(show + PAGE_SIZE)}
            className="flex h-13 cursor-pointer items-center gap-2 rounded-2xl border border-line-brand bg-surface px-6 text-[15px] font-semibold transition-colors hover:border-line-brand-hover hover:bg-brand-soft-2"
          >
            {fmt(t.more, { n: remaining })}
            <Icon name="chevronDown" size={18} />
          </button>
        </div>
      )}
    </>
  );
}
