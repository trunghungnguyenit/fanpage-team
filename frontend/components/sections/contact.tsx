import Link from "next/link";
import { Icon } from "@/components/icons";
import { btn } from "@/components/ui";
import type { Dictionary, Locale } from "@/lib/i18n";
import { CHANNEL_ICONS, linkTarget } from "@/lib/site";

const cardClass =
  "flex min-h-24 flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 p-3.5 text-white";

export function Contact({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section id="contact" className="mx-auto max-w-300 px-5 pt-14 sm:pt-18">
      <div className="reveal relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-center gap-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand to-brand-deep p-[clamp(26px,6vw,60px)] text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 size-[280px] rounded-full border border-white/20 shadow-[0_0_0_40px_rgb(255_255_255/0.05),0_0_0_80px_rgb(255_255_255/0.03)]" />

        <div className="relative flex flex-col gap-4">
          <h2 className="text-[clamp(2rem,5.6vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance">
            {t.closeH}
          </h2>
          <p className="max-w-[46ch] text-base leading-relaxed text-on-brand-muted">
            {t.closeP}
          </p>
          <Link
            href={`/${lang}/brief`}
            scroll={false}
            className={btn(
              "light",
              "mt-1.5 h-14 w-full max-w-[380px] justify-center px-5.5 text-[17px] font-bold",
            )}
          >
            {t.sendBrief}
          </Link>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-on-brand-muted">
            {t.reassureClose.map((r) => (
              <li key={r} className="flex items-center gap-1.5">
                <Icon
                  name="check"
                  size={15}
                  strokeWidth={2.4}
                  className="text-[#9ff0cf]"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Dữ liệu lấy từ bảng contact_channels; chưa điền kênh nào thì ẩn cả cột. */}
        {t.channels.length > 0 && (
          <div className="relative flex flex-col gap-2.5">
            <span className="text-[13px] font-bold tracking-wider text-on-brand-muted uppercase">
              {t.orReach}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {t.channels.map((c) => {
                const content = (
                  <>
                    <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-white text-brand">
                      <Icon name={CHANNEL_ICONS[c.kind]} size={18} />
                    </span>
                    <span className="text-[15px] font-bold">{c.label}</span>
                    <span className="overflow-hidden text-xs text-ellipsis text-on-brand-muted">
                      {c.value}
                    </span>
                  </>
                );
                // Chưa có liên kết thì chỉ hiện thông tin, không bấm được.
                return c.url ? (
                  <a
                    key={c.id}
                    href={c.url}
                    {...linkTarget(c.url)}
                    className={`${cardClass} transition-colors hover:bg-white/20`}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={c.id} className={cardClass}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
