"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Variant = "screen" | "sheet" | "form";

const CloseContext = createContext<(() => void) | null>(null);

/**
 * Trả về hàm đóng. Trong overlay (route bị chặn) sẽ quay lại lịch sử;
 * trên trang mở trực tiếp (không có overlay) sẽ chuyển tới `fallbackHref`.
 */
export function useClose(fallbackHref: string) {
  const overlayClose = useContext(CloseContext);
  const router = useRouter();
  return useCallback(() => {
    if (overlayClose) overlayClose();
    else router.push(fallbackHref);
  }, [overlayClose, router, fallbackHref]);
}

export function CloseButton({
  fallbackHref,
  className,
  children,
  ...aria
}: {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const close = useClose(fallbackHref);
  return (
    <button type="button" onClick={close} className={className} {...aria}>
      {children}
    </button>
  );
}

const panel: Record<Variant, string> = {
  screen: "fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-bg animate-slide-up",
  form: "fixed inset-0 z-50 flex flex-col bg-bg animate-slide-up",
  sheet: "",
};

/**
 * Overlay toàn màn hình do intercepting route render. Đóng = quay lại lịch sử,
 * nên URL, nút Back của trình duyệt và thao tác refresh đều hoạt động đúng.
 */
export function Overlay({
  variant,
  label,
  children,
}: {
  variant: Variant;
  label: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    // Trả focus về phần tử đã mở overlay (nút/thẻ vừa bấm) khi đóng, để người dùng bàn phím không bị mất vị trí.
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, [close]);

  return (
    <CloseContext.Provider value={close}>
      {variant === "sheet" ? (
        <>
          <div
            onClick={close}
            aria-hidden="true"
            className="animate-fade-in fixed inset-0 z-50 bg-[rgb(15_26_58/0.4)] backdrop-blur-[2px]"
          />
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              tabIndex={-1}
              className="animate-slide-up pointer-events-auto max-h-[92dvh] w-full max-w-[720px] overflow-y-auto overscroll-contain rounded-t-3xl pb-[env(safe-area-inset-bottom)] bg-surface shadow-[0_-10px_40px_rgb(15_26_58/0.12)] outline-none"
            >
              {children}
            </div>
          </div>
        </>
      ) : (
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className={`${panel[variant]} outline-none`}
        >
          {children}
        </div>
      )}
    </CloseContext.Provider>
  );
}
