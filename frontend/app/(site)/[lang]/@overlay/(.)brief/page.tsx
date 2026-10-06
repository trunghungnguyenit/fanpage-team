import { notFound } from "next/navigation";
import { BriefScreen, type BriefSearchParams } from "@/components/brief/brief-screen";
import { Overlay } from "@/components/overlay";
import { getDictionary } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";

export default async function BriefOverlay({
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
    <Overlay variant="form" label={t.sendBrief}>
      <BriefScreen lang={lang} t={t} params={await searchParams} />
    </Overlay>
  );
}
