"use client";

import { useState } from "react";

/**
 * Ảnh bìa dự án: dùng ảnh nếu có (ảnh nhập tay hoặc og:image tự lấy từ website),
 * không có hoặc ảnh lỗi thì vẽ khung cửa sổ trình duyệt trừu tượng (không có chữ).
 */
export function ProjectCover({ src, alt }: { src?: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && src !== failedSrc) {
    return (
      // Ảnh đến từ website bên ngoài, địa chỉ bất kỳ nên không dùng next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-4.5 top-4.5 bottom-4.5 flex flex-col gap-2 rounded-xl border border-white/90 bg-white/75 p-3 dark:border-white/10 dark:bg-white/10"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-fg/15" />
        ))}
      </div>
      <span className="h-2 w-2/5 rounded-full bg-fg/15" />
      <span className="h-2 w-3/5 rounded-full bg-fg/10" />
      <span className="mt-auto h-1/3 rounded-lg bg-fg/10" />
    </div>
  );
}
