"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Banner } from "@/components/admin/ui";

interface ToastItem {
  id: number;
  tone: "success" | "error";
  message: string;
}

const ToastContext = createContext<(tone: ToastItem["tone"], message: string) => void>(() => undefined);

/** Hiện thông báo ngắn ở góc dưới bên phải, tự ẩn sau vài giây. */
export const useToast = () => useContext(ToastContext);

const DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((tone: ToastItem["tone"], message: string) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, tone, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] lg:bottom-4 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="animate-fade-in pointer-events-auto bg-surface shadow-[0_10px_30px_rgb(15_26_58/0.15)]">
            <Banner tone={t.tone}>{t.message}</Banner>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
