import { randomUUID } from "node:crypto";
import type { PostgrestError } from "@supabase/supabase-js";
import type { ErrorRequestHandler } from "express";
import { DatabaseNotConfiguredError } from "../errors.js";

/** Lỗi của một trường: mã lỗi để giao diện tự dịch, kèm tham số (ví dụ độ dài tối đa). */
export type FieldErrors = Record<string, { code: string; params?: Record<string, number | string> }>;

/**
 * Lỗi có cấu trúc của API admin. API chỉ trả về `code` (và dữ liệu phụ), không trả câu chữ,
 * để giao diện admin tự hiển thị thông báo tiếng Việt đúng ngữ cảnh.
 */
export class AdminError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

export const validationError = (fields: FieldErrors) => new AdminError(422, "VALIDATION", { fields });

export const notFound = () => new AdminError(404, "NOT_FOUND");

/** Cột bị lỗi, đọc từ phần `details` của lỗi Postgres, ví dụ `Key (service_key)=(x)...`. */
const columnOf = (error: PostgrestError) => /\((\w+)\)=/.exec(error.details ?? "")?.[1];

/**
 * Chuyển lỗi database đã biết thành lỗi có cấu trúc. Lỗi lạ (không đoán được nguyên nhân)
 * được ném tiếp để trở thành lỗi hệ thống kèm mã tham chiếu, không lộ thông tin database.
 */
export function fromDatabaseError(error: PostgrestError): never {
  const column = columnOf(error);
  if (error.code === "23505") throw new AdminError(409, "DUPLICATE", column ? { field: column } : {});
  if (error.code === "23503" && column) throw validationError({ [column]: { code: "INVALID_REFERENCE" } });
  if (error.code === "23514" && column) throw validationError({ [column]: { code: "INVALID_VALUE" } });
  throw new Error(`Lỗi database ${error.code}: ${error.message}`);
}

/** Lấy dữ liệu từ kết quả truy vấn, chuyển lỗi database thành lỗi có cấu trúc. */
export function unwrapAdmin<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) fromDatabaseError(result.error);
  return result.data as T;
}

/** Bộ xử lý lỗi cuối cùng của API admin. */
export const adminErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AdminError) {
    res.status(err.status).json({ ok: false, code: err.code, ...err.extra });
    return;
  }
  // Ảnh vượt giới hạn dung lượng của bộ đọc body.
  if ((err as { status?: number } | null)?.status === 413) {
    res.status(413).json({ ok: false, code: "FILE_TOO_LARGE" });
    return;
  }
  if (err instanceof DatabaseNotConfiguredError) {
    res.status(503).json({ ok: false, code: "NOT_CONFIGURED" });
    return;
  }

  // Lỗi không lường trước: ghi log đầy đủ, chỉ trả mã tham chiếu để admin báo lại.
  const requestId = randomUUID().slice(0, 8);
  console.error("[admin]", requestId, err);
  res.status(500).json({ ok: false, code: "INTERNAL", requestId });
};
