import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefScreen, type BriefSearchParams } from "@/components/brief/brief-screen";
import { getDictionary } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";

// Form brief không cần lập chỉ mục.
export const metadata: Metadata = { robots: { index: false } };

export default async function BriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<BriefSearchParams>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main className="flex h-dvh flex-col">
      <BriefScreen lang={lang} t={t} params={await searchParams} />
    </main>
  );
}
