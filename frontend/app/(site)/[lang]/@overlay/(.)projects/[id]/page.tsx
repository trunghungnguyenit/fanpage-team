import { notFound } from "next/navigation";
import { Overlay } from "@/components/overlay";
import { CaseDetail } from "@/components/projects/case-detail";
import { getDictionary, getProject } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";

export default async function CaseOverlay({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, project] = await Promise.all([getDictionary(lang), getProject(lang, Number(id))]);
  if (!project) notFound();

  return (
    <Overlay variant="sheet" label={project.title}>
      <CaseDetail p={project} lang={lang} t={t} />
    </Overlay>
  );
}
