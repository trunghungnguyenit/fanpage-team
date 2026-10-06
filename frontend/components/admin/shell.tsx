"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SessionProvider, type AdminSession } from "@/components/admin/session";
import { ToastProvider } from "@/components/admin/toast";
import { Banner, Spinner, adminBtn } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import { describeError } from "@/lib/admin/messages";
import { RESOURCES } from "@/lib/admin/resources";
import { ROLE_LABEL } from "@/lib/admin/roles";
import { supabase } from "@/lib/admin/supabase";
import { useLoader } from "@/lib/admin/use-loader";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** nhãn ngắn cho thanh tab dưới trên điện thoại */
  short?: string;
  /** chỉ vai trò Quản trị viên mới thấy */
  adminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Tổng quan", icon: "grid" },
  { href: "/admin/briefs", label: "Brief khách gửi", short: "Brief", icon: "mail" },
  ...["projects", "contact-channels"].map((r) => RESOURCES.find((x) => x.resource === r)!).map((r) => ({ href: `/admin/manage/${r.resource}`, label: r.title, short: r.resource === "contact-channels" ? "Liên hệ" : undefined, icon: r.icon })),
  { href: "/admin/texts", label: "Chữ giao diện", icon: "type" },
  ...RESOURCES.filter((r) => !["projects", "contact-channels"].includes(r.resource)).map((r) => ({ href: `/admin/manage/${r.resource}`, label: r.title, icon: r.icon, adminOnly: r.adminOnly })),
];

type Gate = { state: "checking" } | { state: "ready"; session: AdminSession } | { state: "forbidden" } | { state: "error"; message: string };

/**
 * Khung của trang quản trị: chỉ hiện nội dung khi đã đăng nhập và có quyền admin.
 * Quyền thật được backend kiểm tra ở từng API; đây chỉ là lớp chặn để người không có quyền không thấy giao diện.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [gate, setGate] = useState<Gate>({ state: "checking" });
  const [menuOpen, setMenuOpen] = useState(false);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return router.replace("/admin/login");

    const me = await adminApi.get<AdminSession>("/me");
    if (me.ok) return setGate({ state: "ready", session: me.data });
    if (me.error.kind === "unauthenticated") return; // đã đăng xuất, nghe sự kiện bên dưới sẽ chuyển trang
    if (me.error.kind === "forbidden") return setGate({ state: "forbidden" });
    setGate({ state: "error", message: describeError(me.error, { subject: "trang quản trị", verb: "mở trang quản trị" }).message });
  }, [router]);

  useLoader(check);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/admin/login?reason=expired");
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (gate.state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Đang kiểm tra phiên đăng nhập…" />
      </div>
    );
  }

  if (gate.state === "forbidden" || gate.state === "error") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-5">
        <h1 className="text-[26px] font-extrabold tracking-tight">{gate.state === "forbidden" ? "Chưa có quyền truy cập" : "Chưa mở được trang quản trị"}</h1>
        <Banner>
          {gate.state === "forbidden"
            ? "Tài khoản Google này đã đăng nhập nhưng email chưa có trong danh sách tài khoản quản trị, hoặc đã bị khóa. Hãy nhờ quản trị viên thêm email của bạn ở mục Tài khoản admin."
            : gate.message}
        </Banner>
        <div className="flex gap-2">
          {gate.state === "error" && (
            <button
              type="button"
              onClick={() => {
                setGate({ state: "checking" });
                void check();
              }}
              className={adminBtn.primary()}
            >
              Thử lại
            </button>
          )}
          <button type="button" onClick={() => void logout()} className={adminBtn.outline()}>
            Đăng xuất
          </button>
        </div>
      </main>
    );
  }

  const { session } = gate;
  const sidebar = (
    <nav aria-label="Quản trị" className="flex flex-col gap-1">
      {NAV.filter((item) => !item.adminOnly || session.role === "admin").map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors ${
              active ? "bg-brand-soft text-brand-text" : "text-fg-2 hover:bg-muted hover:text-fg"
            }`}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  // Lối tắt ở đáy màn hình cho điện thoại (vùng ngón cái chạm tới được); mục còn lại nằm trong "Thêm".
  const tabs: NavItem[] = ["/admin", "/admin/briefs", "/admin/manage/projects", "/admin/manage/contact-channels"].flatMap((href) => NAV.filter((n) => n.href === href));
  const tabClass = (active: boolean) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${active ? "text-brand-text" : "text-fg-3 active:text-fg"}`;

  return (
    <SessionProvider value={session}>
      <ToastProvider>
        <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
          <aside className="hidden border-r border-line bg-surface-2 lg:block">
            <div className="sticky top-0 flex h-screen flex-col gap-5 overflow-y-auto p-4">
              <Link href="/admin" className="px-1 pt-2">
                <Logo />
              </Link>
              <span className="px-1 text-xs font-bold tracking-wider text-fg-4 uppercase">Quản trị</span>
              {sidebar}
            </div>
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-header px-4 backdrop-blur-xl lg:px-8">
              <Link href="/admin" aria-label="Tổng quan" className="flex min-h-11 items-center lg:hidden">
                <Logo />
              </Link>
              <span className="hidden text-sm text-fg-3 lg:block">
                Đăng nhập với <strong className="text-fg-2">{session.email}</strong> · {ROLE_LABEL[session.role]}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <a href="/vi" target="_blank" rel="noopener noreferrer" className={adminBtn.outline("h-11 px-3.5 text-sm max-sm:hidden")}>
                  Xem website
                </a>
                <ThemeToggle label="Đổi giao diện sáng/tối" />
                <button type="button" onClick={() => void logout()} className={adminBtn.outline("h-11 px-3.5 text-sm")}>
                  <Icon name="logout" size={16} />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 lg:px-8 lg:py-8">{children}</main>
          </div>
        </div>

        <nav aria-label="Lối tắt" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-header pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          {tabs.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
                <Icon name={item.icon} size={22} />
                {item.short ?? item.label}
              </Link>
            );
          })}
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Mở menu quản trị" aria-expanded={menuOpen} className={tabClass(false)}>
            <Icon name="menu" size={22} />
            Thêm
          </button>
        </nav>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="animate-fade-in absolute inset-0 bg-[rgb(15_26_58/0.4)]" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <div className="animate-fade-in absolute inset-y-0 left-0 flex w-72 flex-col gap-5 overflow-y-auto bg-bg p-4 shadow-xl">
              <div className="flex items-center justify-between px-1 pt-2">
                <Logo />
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" className={adminBtn.icon()}>
                  <Icon name="close" size={18} />
                </button>
              </div>
              {sidebar}
              <a href="/vi" target="_blank" rel="noopener noreferrer" className={adminBtn.outline("justify-center sm:hidden")}>
                Xem website
              </a>
            </div>
          </div>
        )}
      </ToastProvider>
    </SessionProvider>
  );
}
