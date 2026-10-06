import { Icon, type IconName } from "@/components/icons";
import type { Dictionary } from "@/lib/i18n";

const TRUST_ICONS: IconName[] = ["file", "key", "shield", "life", "globe"];

export function TrustBar({ t }: { t: Dictionary }) {
  return (
    <section className="border-y border-line-soft bg-surface-2">
      <ul className="mx-auto flex max-w-300 flex-wrap items-center gap-x-5.5 gap-y-2.5 px-5 py-4">
        {t.trust.map((label, i) => (
          <li key={label} className="flex items-center gap-2 text-sm font-semibold text-fg-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
              <Icon name={TRUST_ICONS[i]} size={15} />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
