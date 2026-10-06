"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { btn } from "@/components/ui";

// ---- Nút ----

export const adminBtn = {
  primary: (extra = "") => btn("primary", `h-11 gap-2 rounded-xl px-5 text-[15px] shadow-none disabled:cursor-wait disabled:opacity-60 ${extra}`),
  outline: (extra = "") => btn("outline", `h-11 gap-2 rounded-xl px-4 text-[15px] disabled:cursor-wait disabled:opacity-60 ${extra}`),
  danger: (extra = "") =>
    `inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-danger px-5 text-[15px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60 ${extra}`,
  /** Nút vuông nhỏ chỉ có icon (sửa, xóa…). */
  icon: (extra = "") =>
    `flex size-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface text-fg-2 transition-colors hover:border-line-brand hover:text-fg ${extra}`,
};

export function Spinner({ label }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-fg-3">
      <span className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-brand-text" />
      {label}
    </span>
  );
}

// ---- Khung và tiêu đề trang ----

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-fg-3">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export const cardClass = "rounded-3xl border border-line bg-surface shadow-[0_1px_2px_rgb(15_26_58/0.04)]";

// ---- Thông báo ----

type Tone = "error" | "success" | "info";

const TONES: Record<Tone, string> = {
  error: "border-danger-line/40 bg-danger/10 text-danger",
  success: "border-tint-green-fg/30 bg-tint-green-soft text-tint-green-fg",
  info: "border-line-brand bg-brand-soft text-brand-text",
};

/** Khung thông báo. Lỗi dùng role=alert để trình đọc màn hình đọc ngay. */
export function Banner({
  tone = "error",
  children,
  action,
}: {
  tone?: Tone;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[14px] leading-relaxed ${TONES[tone]}`}
    >
      <Icon name={tone === "success" ? "check" : "alert"} size={18} className="mt-0.5 flex-none" />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}

// ---- Ô nhập liệu ----

export const inputClass = (invalid?: boolean) =>
  `w-full rounded-xl border-[1.5px] bg-surface px-3.5 text-base text-fg sm:text-[15px] placeholder:text-fg-4 transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-fg-3 ${
    invalid ? "border-danger-line" : "border-line-strong hover:border-line-brand-hover"
  }`;

/** Vỏ của một trường: nhãn, gợi ý, ô nhập và câu báo lỗi gắn với ô đó. */
export function FieldShell({
  label,
  required,
  hint,
  error,
  htmlFor,
  errorId,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-bold">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[13px] leading-snug text-fg-3">{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug font-medium text-danger">
          <Icon name="alert" size={15} className="mt-px flex-none" />
          {error}
        </p>
      )}
    </div>
  );
}

// ---- Hộp thoại và ngăn kéo ----

/** Các hộp thoại đang mở (lồng nhau), chỉ hộp trên cùng xử lý phím. */
const openDialogs: object[] = [];

/** Giữ focus trong hộp thoại, đóng bằng Escape, khóa cuộn nền. */
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  // `onClose` thường là hàm mới ở mỗi lần render. Giữ bản mới nhất trong ref để effect bên dưới chỉ chạy
  // một lần khi mở: nếu phụ thuộc vào `onClose`, mỗi ký tự gõ vào form sẽ kéo focus ra khỏi ô đang nhập.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const token = {};
    openDialogs.push(token);
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== token) return;
      if (e.key === "Escape") onCloseRef.current();
      if (e.key !== "Tab" || !ref.current) return;
      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      openDialogs.splice(openDialogs.indexOf(token), 1);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  return ref;
}

/** Ngăn kéo từ bên phải: dùng cho form thêm/sửa. */
export function Drawer({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  const ref = useDialog(onClose);
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-fade-in absolute inset-0 bg-[rgb(15_26_58/0.4)] backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-slide-left relative flex h-dvh w-full max-w-2xl flex-col bg-bg shadow-[-10px_0_40px_rgb(15_26_58/0.12)] outline-none"
      >
        <div className="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-xl font-extrabold tracking-tight">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className={adminBtn.icon()}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        <div className="flex flex-none flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">{footer}</div>
      </div>
    </div>
  );
}

/** Hộp thoại xác nhận ở giữa màn hình. */
export function ConfirmDialog({
  title,
  confirmLabel,
  pending,
  error,
  onConfirm,
  onClose,
  children,
}: {
  title: string;
  confirmLabel: string;
  pending: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useDialog(onClose);
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="animate-fade-in absolute inset-0 bg-[rgb(15_26_58/0.5)]" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-fade-in relative flex w-full max-w-md flex-col gap-4 rounded-3xl bg-surface p-6 shadow-[0_20px_60px_rgb(15_26_58/0.25)] outline-none"
      >
        <h2 id={titleId} className="text-xl font-extrabold tracking-tight">
          {title}
        </h2>
        <div className="text-[15px] leading-relaxed text-fg-2">{children}</div>
        {error && <Banner>{error}</Banner>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={adminBtn.outline()}>
            Hủy
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className={adminBtn.danger()}>
            {pending ? "Đang xử lý…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Huy hiệu ----

const BADGE_TONES = {
  green: "bg-tint-green-soft text-tint-green-fg",
  blue: "bg-brand-soft text-brand-text",
  purple: "bg-tint-purple-soft text-tint-purple-fg",
  muted: "bg-muted text-fg-3",
  amber: "bg-[#fff4d6] text-[#8a5a00] dark:bg-[#3a2c0a] dark:text-[#f5c451]",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = "muted", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-bold whitespace-nowrap ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}
