import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../errors.js";

/** Trả về 404 dạng JSON cho đường dẫn không tồn tại. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ ok: false, message: "Không tìm thấy" });
};

/** Mã HTTP của lỗi: lỗi do ta chủ động ném, lỗi của Express (JSON hỏng…) hoặc 500. */
function statusOf(err: unknown): number {
  if (err instanceof HttpError) return err.status;
  const status = (err as { status?: unknown } | null)?.status;
  return typeof status === "number" ? status : 500;
}

/** Bắt mọi lỗi chưa xử lý, ví dụ JSON gửi lên bị sai cú pháp hoặc database lỗi. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = statusOf(err);
  if (status >= 500) console.error(err);

  const message =
    err instanceof HttpError ? err.message : status >= 500 ? "Lỗi máy chủ" : "Yêu cầu không hợp lệ";
  res.status(status).json({ ok: false, message });
};
