import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { themeScript } from "@/lib/theme-script";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

// Trang quản trị không cho công cụ tìm kiếm lập chỉ mục.
export const metadata: Metadata = {
  title: "Quản trị | HTCode",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg font-sans text-fg">{children}</body>
    </html>
  );
}
