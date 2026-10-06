import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale } from "@/lib/i18n";

// Chuyển hướng mọi đường dẫn thiếu tiền tố ngôn ngữ về ngôn ngữ mặc định (vi).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (hasLocale(first)) return;

  request.nextUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Bỏ qua phần nội bộ của Next, trang quản trị (/admin không có tiền tố ngôn ngữ) và mọi file có đuôi.
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};
