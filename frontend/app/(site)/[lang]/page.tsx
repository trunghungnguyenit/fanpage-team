import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Models } from "@/components/sections/models";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { TrustBar } from "@/components/sections/trust-bar";
import { Why } from "@/components/sections/why";
import { Work } from "@/components/sections/work";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { StickyCta } from "@/components/site/sticky-cta";
import { getDictionary, getProjects } from "@/lib/content";
import { hasLocale } from "@/lib/i18n";
import { SITE_URL, languageAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.ui.metaTitle,
    description: t.lede,
    alternates: languageAlternates(lang),
    openGraph: {
      type: "website",
      siteName: "HTCode",
      title: t.ui.metaTitle,
      description: t.lede,
      url: `/${lang}`,
      locale: lang === "vi" ? "vi_VN" : "en_US",
    },
  };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, projects] = await Promise.all([getDictionary(lang), getProjects(lang)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HTCode",
    url: `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}/logo-mark.png`,
    description: t.lede,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a
        href="#main"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        {t.ui.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main">
        <Hero lang={lang} t={t} />
        <TrustBar t={t} />
        <Why t={t} />
        <Services lang={lang} t={t} />
        <Process t={t} />
        <Work lang={lang} t={t} projects={projects} />
        <Models lang={lang} t={t} />
        <Faq t={t} />
        <Contact lang={lang} t={t} />
      </main>
      <Footer lang={lang} t={t} />
      <StickyCta href={`/${lang}/brief`} label={t.startProject} sub={t.reply24} />
    </>
  );
}
