import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectsScreen } from "@/components/projects/projects-screen";
import { getDictionary, getProjects } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: `${t.allTitle} | HTCode`,
    description: t.allP,
    alternates: languageAlternates(lang, "/projects"),
  };
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, projects] = await Promise.all([getDictionary(lang), getProjects(lang)]);

  return (
    <main>
      <ProjectsScreen lang={lang} t={t} projects={projects} />
    </main>
  );
}
