import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { hasLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";
import { themeScript } from "@/lib/theme-script";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

// viewport-fit=cover để dùng được safe-area (tai thỏ, thanh vuốt) và thanh trình duyệt đổi màu theo giao diện sáng/tối.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

// Layout không gọi backend: lỗi tải nội dung phải hiện được ở `error.tsx` bên trong layout này.
// Tiêu đề và mô tả theo ngôn ngữ do từng trang tự đặt từ nội dung trong database.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HTCode",
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
  overlay,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg font-sans text-fg">
        {children}
        {overlay}
      </body>
    </html>
  );
}
