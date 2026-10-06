import { notFound } from "next/navigation";
import { Overlay } from "@/components/overlay";
import { ProjectsScreen } from "@/components/projects/projects-screen";
import { getDictionary, getProjects } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";

export default async function ProjectsOverlay({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, projects] = await Promise.all([getDictionary(lang), getProjects(lang)]);

  return (
    <Overlay variant="screen" label={t.allTitle}>
      <ProjectsScreen lang={lang} t={t} projects={projects} />
    </Overlay>
  );
}
