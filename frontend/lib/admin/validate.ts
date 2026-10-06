import type { FieldDef, FieldErrors, FormValues, I18n, Row } from "@/lib/admin/types";

// Quy tắc kiểm tra ở trình duyệt, khớp với backend (backend/src/admin/*) để báo lỗi ngay khi nhập.
// Backend vẫn kiểm tra lại toàn bộ nên mọi mã lỗi ở đây cũng có thể đến từ API.

const WEB_URL = /^https?:\/\/\S+$/i;
const CONTACT_URL = /^(https?:\/\/|mailto:|tel:)\S+$/i;
// Chỉ nhận https; riêng localhost được dùng http để chạy Supabase cục bộ (khớp backend).
const IMAGE_URL = /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/)\S+$/i;
const IMAGE_URL_MAX = 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGS = ["vi", "en"] as const;

const isBlank = (v: unknown) => typeof v !== "string" || v.trim() === "";

/** Kiểm tra một danh sách chuỗi (từng dòng không rỗng, không quá dài, không quá nhiều dòng). */
function checkList(
  items: string[],
  path: string,
  rules: { required: boolean; maxItems: number; itemMax: number },
  errors: FieldErrors,
) {
  if (rules.required && items.length === 0) errors[path] = { code: "REQUIRED" };
  else if (items.length > rules.maxItems) errors[path] = { code: "TOO_MANY", params: { max: rules.maxItems } };

  items.forEach((item, i) => {
    if (isBlank(item)) errors[`${path}.${i}`] = { code: "REQUIRED" };
    else if (item.trim().length > rules.itemMax) {
      errors[`${path}.${i}`] = { code: "TOO_LONG", params: { max: rules.itemMax } };
    }
  });
}

/** Kiểm tra một trường, trả về các lỗi (rỗng nếu hợp lệ). */
export function validateField(def: FieldDef, value: unknown): FieldErrors {
  const errors: FieldErrors = {};
  const { name } = def;

  switch (def.kind) {
    case "text":
    case "textarea": {
      const text = typeof value === "string" ? value.trim() : "";
      if (text === "") {
        if (def.required) errors[name] = { code: "REQUIRED" };
      } else if (text.length > def.max) errors[name] = { code: "TOO_LONG", params: { max: def.max } };
      else if (def.format === "web-url" && !WEB_URL.test(text)) errors[name] = { code: "INVALID_URL" };
      else if (def.format === "contact-url" && !CONTACT_URL.test(text)) errors[name] = { code: "INVALID_URL" };
      else if (def.format === "email" && !EMAIL.test(text)) errors[name] = { code: "INVALID_EMAIL" };
      break;
    }
    case "number": {
      const raw = typeof value === "string" ? value.trim() : "";
      if (raw === "") {
        if (def.required) errors[name] = { code: "REQUIRED" };
        break;
      }
      const n = Number(raw);
      if (!Number.isInteger(n)) errors[name] = { code: "INVALID_INTEGER" };
      else if (n < def.min) errors[name] = { code: "TOO_SMALL", params: { min: def.min } };
      else if (n > def.max) errors[name] = { code: "TOO_BIG", params: { max: def.max } };
      break;
    }
    case "select":
      if (def.required && isBlank(value)) errors[name] = { code: "REQUIRED" };
      break;
    case "i18n-text": {
      const v = (value ?? {}) as Partial<I18n>;
      for (const lang of LANGS) {
        const text = (v[lang] ?? "").trim();
        if (text === "") errors[`${name}.${lang}`] = { code: "REQUIRED" };
        else if (text.length > def.max) errors[`${name}.${lang}`] = { code: "TOO_LONG", params: { max: def.max } };
      }
      break;
    }
    case "i18n-list": {
      const v = (value ?? {}) as Partial<I18n<string[]>>;
      for (const lang of LANGS) {
        checkList(v[lang] ?? [], `${name}.${lang}`, { required: true, maxItems: def.maxItems, itemMax: def.itemMax }, errors);
      }
      break;
    }
    case "string-list":
      checkList((value as string[]) ?? [], name, { required: false, maxItems: def.maxItems, itemMax: def.itemMax }, errors);
      break;
    case "images": {
      const urls = (value as string[]) ?? [];
      if (urls.length > def.maxItems) errors[name] = { code: "TOO_MANY", params: { max: def.maxItems } };
      urls.forEach((u, i) => {
        if (!IMAGE_URL.test(u) || u.length > IMAGE_URL_MAX) errors[`${name}.${i}`] = { code: "INVALID_URL" };
      });
      break;
    }
    case "boolean":
      break;
  }
  return errors;
}

/** Kiểm tra toàn bộ form. */
export function validateForm(fields: FieldDef[], values: FormValues): FieldErrors {
  return fields.reduce<FieldErrors>((all, def) => ({ ...all, ...validateField(def, values[def.name]) }), {});
}

/**
 * Đưa dữ liệu danh sách từ database về mảng chuỗi để form luôn sửa được, kể cả khi dữ liệu nhập tay lệch chuẩn
 * (chuỗi JSON `["https://..."]`, phần tử là số, hoặc object dạng `{"url": "https://..."}`). Phần tử không hiểu được thì bỏ qua.
 */
function toStringList(raw: unknown): string[] {
  let list: unknown = raw;
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [raw];
    }
  }
  if (!Array.isArray(list)) return [];
  return list.flatMap((item): string[] => {
    if (typeof item === "string") return [item];
    if (typeof item === "number") return [String(item)];
    if (item && typeof item === "object" && typeof (item as { url?: unknown }).url === "string") return [(item as { url: string }).url];
    return [];
  });
}

const blankLangs = <T,>(empty: T): I18n<T> => ({ vi: structuredClone(empty), en: structuredClone(empty) });

/** Giá trị ban đầu của form: từ dòng đang sửa, hoặc giá trị trống/mặc định khi thêm mới. */
export function initialValues(fields: FieldDef[], row?: Row): FormValues {
  const values: FormValues = {};
  for (const def of fields) {
    const raw = row?.[def.name];
    switch (def.kind) {
      case "text":
      case "textarea":
      case "select":
        values[def.name] = raw == null ? "" : String(raw);
        break;
      case "number":
        values[def.name] = raw == null ? "" : String(raw);
        break;
      case "boolean":
        values[def.name] = typeof raw === "boolean" ? raw : (def.defaultValue ?? false);
        break;
      case "i18n-text":
        values[def.name] = row ? { ...(raw as I18n) } : blankLangs("");
        break;
      case "i18n-list":
        values[def.name] = row ? structuredClone(raw as I18n<string[]>) : blankLangs([""]);
        break;
      case "string-list":
      case "images":
        values[def.name] = toStringList(raw);
        break;
    }
  }
  return values;
}

/** Chuẩn hóa dữ liệu form thành thân yêu cầu gửi lên API. */
export function toPayload(fields: FieldDef[], values: FormValues): Row {
  const payload: Row = {};
  for (const def of fields) {
    const v = values[def.name];
    switch (def.kind) {
      case "text":
      case "textarea":
      case "select":
        payload[def.name] = typeof v === "string" ? v.trim() : "";
        break;
      case "number":
        // Để trống thì không gửi: backend tự đặt giá trị (ví dụ thứ tự kế tiếp).
        if (typeof v === "string" && v.trim() !== "") payload[def.name] = Number(v);
        break;
      case "i18n-text": {
        const t = v as I18n;
        payload[def.name] = { vi: t.vi.trim(), en: t.en.trim() };
        break;
      }
      case "i18n-list": {
        const l = v as I18n<string[]>;
        payload[def.name] = { vi: l.vi.map((s) => s.trim()), en: l.en.map((s) => s.trim()) };
        break;
      }
      case "string-list":
      case "images":
        payload[def.name] = (v as string[]).map((s) => s.trim());
        break;
      case "boolean":
        payload[def.name] = Boolean(v);
        break;
    }
  }
  return payload;
}
