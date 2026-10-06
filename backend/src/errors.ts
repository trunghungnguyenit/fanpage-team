/** Lỗi có kèm mã HTTP để error handler trả về đúng trạng thái. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Chưa cấu hình Supabase nên các API cần database chưa dùng được. */
export class DatabaseNotConfiguredError extends HttpError {
  constructor() {
    super(503, "Chưa cấu hình SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY");
  }
}
