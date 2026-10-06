"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/admin/roles";

/** Tài khoản đang đăng nhập vào trang quản trị (lấy từ backend sau khi xác nhận quyền). */
export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
}

const SessionContext = createContext<AdminSession | null>(null);

export const SessionProvider = SessionContext.Provider;

/** Tài khoản đang đăng nhập; chỉ dùng bên trong khung quản trị (đã qua cổng kiểm tra quyền). */
export function useAdminSession(): AdminSession {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useAdminSession phải nằm trong AdminShell");
  return session;
}
