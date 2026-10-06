"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Logo } from "@/components/logo";
import { Banner, adminBtn } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import { describeError } from "@/lib/admin/messages";
import { supabase, supabaseConfigured } from "@/lib/admin/supabase";
import { useLoader } from "@/lib/admin/use-loader";

/** Lỗi Google/Supabase gửi kèm trên URL khi quay về từ trang đăng nhập Google. */
function redirectError(): { code: string; description: string } | null {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = params.get("error_code") ?? hash.get("error_code") ?? params.get("error") ?? hash.get("error");
  if (!code) return null;
  return { code, description: params.get("error_description") ?? hash.get("error_description") ?? "" };
}

/** Câu báo lỗi theo mã lỗi (không hiện câu chữ gốc của Google/Supabase). */
function oauthMessage(error: { code: string; description: string }): string {
  if (error.code === "access_denied") return "Bạn đã hủy đăng nhập bằng Google. Bấm nút bên dưới để thử lại.";
  if (error.code === "provider_email_needs_verification" || (/email/i.test(error.description) && /verif|confirm/i.test(error.description))) {
    return "Email Google này chưa được xác minh nên không đăng nhập được. Hãy dùng tài khoản Google khác.";
  }
  if (error.code === "over_request_rate_limit") return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
  if (error.code === "bad_oauth_callback" || error.code === "bad_oauth_state") return "Phiên đăng nhập Google đã hết hạn hoặc không hợp lệ. Hãy bấm đăng nhập lại.";
  return `Không đăng nhập được bằng Google (mã: ${error.code}). Vui lòng thử lại sau ít phút, nếu vẫn lỗi hãy báo người phụ trách.`;
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const expired = useSearchParams().get("reason") === "expired";
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Vào trang này theo hai cách: đã có phiên sẵn, hoặc vừa quay về từ Google (supabase-js tự đọc phiên trên URL).
  const check = useCallback(async () => {
    const failure = redirectError();
    if (failure) {
      window.history.replaceState(null, "", window.location.pathname);
      setProblem(oauthMessage(failure));
      return;
    }

    const { data } = await supabase.auth.getSession();
    // Bỏ phần token còn sót trên thanh địa chỉ sau khi supabase-js đã đọc xong.
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (!data.session) return;

    // Đăng nhập Google đúng chưa đủ: backend phải xác nhận tài khoản có quyền admin.
    setPending(true);
    const me = await adminApi.get<{ email: string }>("/me");
    if (me.ok) return router.replace("/admin");

    const email = data.session.user.email;
    await supabase.auth.signOut();
    setPending(false);
    setProblem(
      me.error.kind === "forbidden"
        ? `Tài khoản Google${email ? ` ${email}` : ""} không có trong danh sách tài khoản quản trị (hoặc đã bị khóa). Hãy nhờ quản trị viên thêm email này ở mục Tài khoản admin, hoặc chọn tài khoản Google khác.`
        : describeError(me.error, { subject: "trang quản trị", verb: "đăng nhập" }).message,
    );
  }, [router]);

  useLoader(check);

  async function loginWithGoogle() {
    if (pending) return;
    setProblem(null);
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
        // Luôn hỏi chọn tài khoản để người dùng có thể đổi sang Google khác khi bị từ chối.
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setPending(false);
      setProblem(
        error.status === 0 || error.name === "AuthRetryableFetchError"
          ? "Không kết nối được tới Supabase. Hãy kiểm tra mạng và địa chỉ NEXT_PUBLIC_SUPABASE_URL, rồi thử lại."
          : `Không mở được trang đăng nhập Google${error.code ? ` (mã: ${error.code})` : ""}. Vui lòng thử lại sau ít phút.`,
      );
    }
    // Không lỗi thì trình duyệt đang chuyển sang Google, giữ nút ở trạng thái chờ.
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-[0_12px_30px_rgb(15_26_58/0.06)] sm:p-8">
          <h1 className="text-[26px] font-extrabold tracking-tight">Đăng nhập quản trị</h1>
          <p className="mt-1.5 text-[15px] text-fg-3">Dành cho quản trị viên của HTCode. Đăng nhập bằng tài khoản Google đã được thêm vào danh sách quản trị.</p>

          <div className="mt-6 flex flex-col gap-4">
            {!supabaseConfigured && (
              <Banner>
                Chưa cấu hình đăng nhập. Hãy khai báo NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong frontend/.env.local rồi khởi động lại frontend.
              </Banner>
            )}
            {expired && !problem && <Banner tone="info">Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</Banner>}
            {problem && <Banner>{problem}</Banner>}

            <button type="button" onClick={() => void loginWithGoogle()} disabled={pending || !supabaseConfigured} className={adminBtn.outline("h-12 w-full justify-center gap-3 text-base")}>
              <GoogleMark />
              {pending ? "Đang chuyển tới Google…" : "Đăng nhập với Google"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
