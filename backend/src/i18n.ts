export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

/** Giá trị có đủ hai ngôn ngữ, đúng với cột jsonb trong database. */
export type I18n<T = string> = Record<Locale, T>;

/** Chọn giá trị theo ngôn ngữ. */
export const localize = <T>(value: I18n<T>, locale: Locale): T => value[locale];

/** Đọc ngôn ngữ từ query `?lang=`, giá trị không hợp lệ dùng ngôn ngữ mặc định. */
export function parseLocale(raw: unknown): Locale {
  return LOCALES.find((l) => l === raw) ?? DEFAULT_LOCALE;
}
