import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";
import { DatabaseNotConfiguredError } from "../errors.js";

let client: SupabaseClient | undefined;

/**
 * Trả về client Supabase dùng service role (bỏ qua RLS, chỉ dùng ở backend).
 * Tạo khi cần dùng lần đầu để server vẫn chạy được khi chưa có cấu hình database.
 */
export function getSupabase(): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) throw new DatabaseNotConfiguredError();
  client ??= createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Lấy dữ liệu từ kết quả truy vấn Supabase, ném lỗi nếu truy vấn thất bại. */
export function unwrap<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) throw new Error(`Lỗi database: ${result.error.message}`);
  return result.data as T;
}
