import type { RequestHandler, Response } from "express";
import { getSupabase } from "../db/supabase.js";
import { AdminError, unwrapAdmin } from "./errors.js";

export type AdminRole = "admin" | "editor";

/** Tài khoản admin đang gọi API, lấy từ bảng `admin_users`. */
export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

const JWT_SHAPE = /^[\w-]+\.[\w-]+\.[\w-]+$/;

/** Tài khoản đang gọi API (chỉ dùng sau `requireAdmin`). */
export const sessionOf = (res: Response) => res.locals.admin as AdminSession;

/**
 * Chỉ cho qua người đã đăng nhập Supabase (Google) bằng email đã xác minh, và email đó có trong
 * bảng `admin_users` với is_active = true. Token do Supabase cấp, được Supabase xác thực lại ở mỗi request.
 */
export const requireAdmin: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  // Chuỗi không có dạng JWT (3 đoạn) bị loại ngay, khỏi gọi Supabase cho mỗi request rác.
  if (!JWT_SHAPE.test(token)) throw new AdminError(401, "UNAUTHENTICATED");

  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) throw new AdminError(401, "UNAUTHENTICATED");

  // Email chưa xác minh thì không được tin để đối chiếu quyền.
  const email = data.user.email?.trim().toLowerCase();
  if (!email || !data.user.email_confirmed_at) throw new AdminError(403, "FORBIDDEN");

  const [account] = unwrapAdmin(
    await getSupabase()
      .from("admin_users")
      .select("id, email, name, role, is_active")
      .eq("email", email)
      .limit(1)
      .overrideTypes<(AdminSession & { is_active: boolean })[], { merge: false }>(),
  );
  if (!account || !account.is_active) throw new AdminError(403, "FORBIDDEN");

  res.locals.admin = { id: account.id, email: account.email, name: account.name, role: account.role } satisfies AdminSession;
  next();
};

/** Chỉ cho vai trò `admin`; `editor` nhận lỗi FORBIDDEN_ROLE. */
export const requireAdminRole: RequestHandler = (_req, res, next) => {
  if (sessionOf(res).role !== "admin") throw new AdminError(403, "FORBIDDEN_ROLE");
  next();
};

/** Mọi thao tác xóa (ở bất kỳ mục nào) chỉ dành cho `admin`. */
export const deleteNeedsAdmin: RequestHandler = (req, res, next) => {
  if (req.method === "DELETE") return requireAdminRole(req, res, next);
  next();
};
