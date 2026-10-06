"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Banner, PageHeader, Spinner, adminBtn, cardClass } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import { describeError } from "@/lib/admin/messages";
import { useLoader } from "@/lib/admin/use-loader";

interface Overview {
  briefsNew: number;
  briefsTotal: number;
  projectsPublished: number;
  projectsHidden: number;
  faqs: number;
  contactFilled: number;
}

/** Trang tổng quan: số liệu chính và những việc nên làm ngay. */
export function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await adminApi.get<Overview>("/overview");
    if (result.ok) {
      setError(null);
      setData(result.data);
    } else setError(describeError(result.error, { subject: "số liệu tổng quan", verb: "tải số liệu" }).message);
  }, []);

  useLoader(load);

  const todo: { text: string; href: string; label: string }[] = [];
  if (data) {
    if (data.briefsNew > 0) todo.push({ text: `${data.briefsNew} brief mới chưa được liên hệ.`, href: "/admin/briefs", label: "Xem brief" });
    if (data.contactFilled === 0) todo.push({ text: "Chưa có kênh liên hệ nào hiển thị trên website.", href: "/admin/manage/contact-channels", label: "Điền thông tin liên hệ" });
    if (data.projectsPublished === 0) todo.push({ text: "Chưa có dự án nào được hiển thị trên website.", href: "/admin/manage/projects", label: "Thêm dự án" });
  }

  const cards: { label: string; value: number; hint: string; icon: IconName; href: string }[] = data
    ? [
        { label: "Brief mới", value: data.briefsNew, hint: `${data.briefsTotal} brief tất cả`, icon: "mail", href: "/admin/briefs" },
        { label: "Dự án đang hiển thị", value: data.projectsPublished, hint: `${data.projectsHidden} dự án đang ẩn`, icon: "folder", href: "/admin/manage/projects" },
        { label: "Kênh liên hệ hiển thị", value: data.contactFilled, hint: "Đã bật trên website", icon: "call", href: "/admin/manage/contact-channels" },
        { label: "Câu hỏi thường gặp", value: data.faqs, hint: "Mục FAQ ở trang chủ", icon: "help", href: "/admin/manage/faqs" },
      ]
    : [];

  return (
    <>
      <PageHeader title="Tổng quan" description="Tình hình website và những việc cần xử lý." />

      {error && (
        <Banner
          action={
            <button
              type="button"
              onClick={() => {
                setError(null);
                void load();
              }}
              className={adminBtn.outline("h-11 px-3 text-sm")}
            >
              Thử lại
            </button>
          }
        >
          {error}
        </Banner>
      )}
      {!error && !data && <Spinner label="Đang tải số liệu…" />}

      {data && (
        <div className="flex flex-col gap-6">
          {todo.length > 0 && (
            <section aria-labelledby="todo-title" className={`${cardClass} p-5`}>
              <h2 id="todo-title" className="text-lg font-extrabold tracking-tight">
                Việc nên làm
              </h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {todo.map((t) => (
                  <li key={t.text} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-soft-2 px-4 py-3">
                    <span className="text-[15px] font-semibold">{t.text}</span>
                    <Link href={t.href} className={adminBtn.outline("h-11 px-3.5 text-sm")}>
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {cards.map((c) => (
              <Link key={c.label} href={c.href} className={`${cardClass} flex flex-col items-start gap-3 p-4 transition-[border-color,box-shadow] sm:flex-row sm:items-center sm:gap-4 sm:p-5 hover:border-line-brand hover:shadow-[0_10px_24px_rgb(43_91_232/0.08)]`}>
                <span className="flex size-12 flex-none items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
                  <Icon name={c.icon} size={22} />
                </span>
                <div>
                  <p className="text-[28px] leading-none font-extrabold tracking-tight">{c.value}</p>
                  <p className="mt-1 text-sm font-bold">{c.label}</p>
                  <p className="text-[13px] text-fg-3">{c.hint}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
