import { FaqList } from "@/components/sections/faq-list";
import { Pill } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n";

export function Faq({ t }: { t: Dictionary }) {
  return (
    <section id="faq" className="mx-auto max-w-215 px-5 pt-14 sm:pt-18">
      <Pill tint="blue">FAQ</Pill>
      <h2 className="text-h2 mt-3.5 mb-6 text-balance">{t.faqH}</h2>
      <FaqList items={t.faqs} />
    </section>
  );
}
