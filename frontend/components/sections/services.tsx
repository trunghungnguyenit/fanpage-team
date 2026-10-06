import { ServicePicker } from "@/components/sections/service-picker";
import { SectionHead } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Services({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="services" className="mx-auto max-w-300 px-5 pt-14 sm:pt-18">
      <SectionHead kicker={t.services} title={t.servicesH} lede={t.servicesP} />
      <ServicePicker items={t.svc} briefHref={`/${lang}/brief`} briefLabel={t.sendBrief} />
    </section>
  );
}
