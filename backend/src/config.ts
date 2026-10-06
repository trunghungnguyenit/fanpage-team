/** Cấu hình đọc từ biến môi trường, có giá trị mặc định cho môi trường dev. */
export const config = {
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
