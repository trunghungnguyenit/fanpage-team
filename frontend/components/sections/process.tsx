import { ProcessTabs } from "@/components/sections/process-tabs";
import { SectionHead } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n";

export function Process({ t }: { t: Dictionary }) {
  return (
    <section id="process" className="mx-auto max-w-300 px-5 pt-14 sm:pt-18">
      <SectionHead tint="green" kicker={t.process} title={t.processH} />
      <p className="-mt-0.5 mb-6 max-w-[56ch] text-base leading-relaxed text-fg-3">{t.processP}</p>
      <ProcessTabs
        steps={t.steps}
        yourRole={t.yourRole}
        deliverables={t.deliverables}
        discoveryFree={t.discoveryFree}
      />
    </section>
  );
}
