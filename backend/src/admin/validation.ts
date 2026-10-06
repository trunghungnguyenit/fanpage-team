import { z } from "zod";
import { validationError, type FieldErrors } from "./errors.js";

// ---- Các mảnh schema dùng chung. Thông báo lỗi là MÃ (xem `codeOf`), không phải câu chữ. ----

/** Chuỗi bắt buộc, đã cắt khoảng trắng hai đầu. */
export const text = (max: number) => z.string().trim().min(1, "REQUIRED").max(max, `TOO_LONG|${max}`);

/** Chuỗi được phép để trống. */
export const optionalText = (max: number) => z.string().trim().max(max, `TOO_LONG|${max}`);

/** Nội dung hai ngôn ngữ, cả hai đều bắt buộc. */
export const i18nText = (max: number) => z.object({ vi: text(max), en: text(max) });

const list = (maxItems: number, itemMax: number) =>
  z.array(text(itemMax)).min(1, "REQUIRED").max(maxItems, `TOO_MANY|${maxItems}`);

/** Danh sách chuỗi hai ngôn ngữ, mỗi ngôn ngữ có ít nhất một dòng. */
export const i18nList = (maxItems: number, itemMax: number) =>
  z.object({ vi: list(maxItems, itemMax), en: list(maxItems, itemMax) });

/** Chuỗi rỗng được coi là "không có" (null). */
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** Địa chỉ website http(s), có thể để trống. */
export const nullableWebUrl = z.preprocess(
  emptyToNull,
  z.string().trim().max(500, "TOO_LONG|500").regex(/^https?:\/\/\S+$/i, "INVALID_URL").nullable(),
);

/** Địa chỉ ảnh, chỉ nhận https (riêng localhost được dùng http để chạy Supabase cục bộ). */
export const imageUrl = z
  .string()
  .trim()
  .max(1000, "TOO_LONG|1000")
  .regex(/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/)\S+$/i, "INVALID_URL");

/** Liên kết kênh liên hệ: https, http, mailto hoặc tel; để trống thì thẻ không bấm được. */
export const contactUrl = z
  .string()
  .trim()
  .max(500, "TOO_LONG|500")
  .refine((v) => v === "" || /^(https?:\/\/|mailto:|tel:)\S+$/i.test(v), "INVALID_URL");

/** Khóa tham chiếu tới bảng khác, có thể để trống. */
export const nullableKey = z.preprocess(emptyToNull, z.string().trim().max(60).nullable());

export const requiredKey = z.string().trim().min(1, "REQUIRED").max(60, "TOO_LONG|60");

/** Số nguyên trong khoảng cho phép. */
export const int = (min: number, max: number) =>
  z
    .number()
    .int("INVALID_INTEGER")
    .min(min, `TOO_SMALL|${min}`)
    .max(max, `TOO_BIG|${max}`);

// ---- Chuyển lỗi zod thành mã lỗi theo trường ----

const PARAM_NAME: Record<string, string> = {
  TOO_LONG: "max",
  TOO_MANY: "max",
  TOO_SMALL: "min",
  TOO_BIG: "max",
};

function codeOf(issue: z.core.$ZodIssue): { code: string; params?: Record<string, number> } {
  if (/^[A-Z_]+(\|\d+)?$/.test(issue.message)) {
    const [code, param] = issue.message.split("|");
    return param ? { code, params: { [PARAM_NAME[code] ?? "value"]: Number(param) } } : { code };
  }
  if (issue.code === "invalid_type") {
    return { code: issue.message.includes("received undefined") ? "REQUIRED" : "INVALID_TYPE" };
  }
  if (issue.code === "invalid_value") {
    // Chưa chọn (không gửi hoặc chuỗi rỗng) là thiếu dữ liệu, còn lại là chọn giá trị không có trong danh sách.
    const empty = issue.input === undefined || issue.input === "";
    return { code: empty ? "REQUIRED" : "INVALID_CHOICE" };
  }
  return { code: "INVALID_VALUE" };
}

/** Gom các lỗi zod thành `{ "title.vi": { code: "REQUIRED" } }`; chỉ giữ lỗi đầu tiên của mỗi trường. */
export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    fields[path] ??= codeOf(issue);
  }
  return fields;
}

/** Kiểm tra dữ liệu gửi lên; sai thì ném lỗi 422 kèm lỗi từng trường. */
export function parseBody<S extends z.ZodType>(schema: S, body: unknown): z.output<S> {
  // reportInput để biết giá trị gửi lên khi phân biệt "chưa chọn" và "chọn sai".
  const result = schema.safeParse(body, { reportInput: true });
  if (!result.success) throw validationError(fieldErrorsFromZod(result.error));
  return result.data;
}

/** Tạo khóa dạng chữ thường-gạch-ngang từ tên tiếng Việt, ví dụ "Thiết kế web" -> "thiet-ke-web". */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
