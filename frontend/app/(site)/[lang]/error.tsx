"use client";

import { useParams } from "next/navigation";

// Chữ cố định hai ngôn ngữ vì khi lỗi thì không lấy được nội dung từ database.
const MESSAGES = {
  vi: {
    title: "Chưa tải được nội dung",
    body: "Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.",
    retry: "Thử lại",
  },
  en: {
    title: "We couldn’t load the page",
    body: "The system is temporarily unavailable. Please try again in a few minutes.",
    retry: "Try again",
  },
};

export default function ErrorPage({ retry }: { retry: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const m = lang === "en" ? MESSAGES.en : MESSAGES.vi;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-h2 max-w-[20ch] text-balance">{m.title}</h1>
      <p className="max-w-[44ch] text-base leading-relaxed text-fg-3">{m.body}</p>
      <button
        type="button"
        onClick={() => retry()}
        className="h-12 cursor-pointer rounded-2xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        {m.retry}
      </button>
    </main>
  );
}
