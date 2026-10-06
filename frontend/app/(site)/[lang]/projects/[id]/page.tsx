import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseDetail } from "@/components/projects/case-detail";
import { getDictionary, getProject } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const project = await getProject(lang, Number(id));
  if (!project) return {};
  return {
    title: `${project.title} | HTCode`,
    description: project.summary,
    alternates: languageAlternates(lang, `/projects/${project.id}`),
  };
}

export default async function CasePage({ params }: PageProps<"/[lang]/projects/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, project] = await Promise.all([getDictionary(lang), getProject(lang, Number(id))]);
  if (!project) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-180 bg-surface sm:my-6 sm:min-h-0 sm:overflow-hidden sm:rounded-3xl sm:border sm:border-line">
      <CaseDetail p={project} lang={lang} t={t} />
    </main>
  );
}
