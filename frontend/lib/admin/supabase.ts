import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Đã khai báo đủ biến môi trường để đăng nhập chưa. */
export const supabaseConfigured = Boolean(url && anonKey);

/**
 * Client Supabase ở trình duyệt, chỉ dùng để đăng nhập và giữ phiên (tự làm mới token).
 * Khóa anon là khóa công khai theo thiết kế; mọi thao tác dữ liệu đều đi qua backend và được backend kiểm tra quyền.
 */
export const supabase = createClient(url ?? "http://localhost", anonKey ?? "chua-cau-hinh", {
  auth: { persistSession: true, autoRefreshToken: true },
});
