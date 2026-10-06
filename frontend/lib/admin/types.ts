/** Lỗi của một trường: mã lỗi (giống backend) kèm tham số, giao diện tự dịch sang tiếng Việt. */
export interface FieldError {
  code: string;
  params?: Record<string, number | string>;
}

/** Khóa là đường dẫn của trường, ví dụ `title.vi`, `tech.2`, `points.vi.1`. */
export type FieldErrors = Record<string, FieldError>;

/** Các nhóm lỗi mà giao diện admin phân biệt. Không chứa câu chữ từ backend. */
export type AdminErrorInfo =
  | { kind: "network" }
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "role-forbidden" }
  | { kind: "self-action" }
  | { kind: "validation"; fields: FieldErrors }
  | { kind: "in-use"; usage: { kind: string; count: number }[] }
  | { kind: "duplicate" }
  | { kind: "not-found" }
  | { kind: "file-type" }
  | { kind: "file-too-large" }
  | { kind: "storage-not-ready" }
  | { kind: "not-configured" }
  | { kind: "internal"; requestId?: string };

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: AdminErrorInfo };

/** Một dòng dữ liệu từ API admin (cột theo tên trong database). */
export type Row = Record<string, unknown>;

/** Giá trị hai ngôn ngữ lưu trong database. */
export type I18n<T = string> = { vi: T; en: T };

// ---- Định nghĩa trường của form (dùng chung cho kiểm tra dữ liệu và vẽ giao diện) ----

interface BaseField {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** không sửa được sau khi tạo (vẫn hiện, nhưng bị khóa khi chỉnh sửa) */
  immutable?: boolean;
}

export type FieldDef =
  | (BaseField & { kind: "text" | "textarea"; max: number; placeholder?: string; format?: "web-url" | "contact-url" | "email" })
  | (BaseField & { kind: "number"; min: number; max: number })
  | (BaseField & { kind: "boolean"; onLabel?: string; defaultValue?: boolean })
  | (BaseField & { kind: "select"; options?: { value: string; label: string }[]; optionsFrom?: string; emptyLabel?: string })
  | (BaseField & { kind: "i18n-text"; max: number; multiline?: boolean })
  | (BaseField & { kind: "i18n-list"; maxItems: number; itemMax: number })
  | (BaseField & { kind: "string-list"; maxItems: number; itemMax: number; placeholder?: string })
  | (BaseField & { kind: "images"; maxItems: number });

/** Giá trị đang nhập trong form, khóa theo tên trường. */
export type FormValues = Record<string, unknown>;
