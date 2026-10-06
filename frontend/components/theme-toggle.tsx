"use client";

import { Icon } from "@/components/icons";

export function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.themeSwitching = "";
    root.dataset.theme = next;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => delete root.dataset.themeSwitching),
    );
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* Không dùng được storage: theme vẫn áp dụng cho lượt truy cập này */
    }
  };

  // Icon đổi bằng CSS (biến thể `dark`) nên không cần state phía client.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-muted text-fg transition-colors hover:bg-muted-hover"
    >
      <Icon name="moon" size={18} className="dark:hidden" />
      <Icon name="sun" size={18} className="hidden dark:block" />
    </button>
  );
}
