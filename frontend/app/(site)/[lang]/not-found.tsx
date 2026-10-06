import Link from "next/link";
import { defaultLocale } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-brand-text">404</p>
      <Link href={`/${defaultLocale}`} className="font-semibold text-brand-text underline">
        HTCode
      </Link>
    </main>
  );
}
