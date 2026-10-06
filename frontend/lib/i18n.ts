import type { Dictionary } from "@/lib/dictionary";

export type { Dictionary };

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Thay các placeholder `{key}` trong chuỗi mẫu của từ điển. */
export const fmt = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));

/** Nhãn theo số lượng, ví dụ "1 project" / "2 projects". */
export const countLabel = (t: Pick<Dictionary, "results" | "resultsOne">, n: number) =>
  fmt(n === 1 ? t.resultsOne : t.results, { n });
