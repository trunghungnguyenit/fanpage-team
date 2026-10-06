"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { useAdminSession } from "@/components/admin/session";
import { useToast } from "@/components/admin/toast";
import {
  Badge,
  Banner,
  ConfirmDialog,
  Drawer,
  FieldShell,
  PageHeader,
  Spinner,
  adminBtn,
  cardClass,
  inputClass,
  type BadgeTone,
} from "@/components/admin/ui";
import { adminApi, downloadFile } from "@/lib/admin/api";
import { describeError, fieldMessage } from "@/lib/admin/messages";
import { LOOKUP_LABEL } from "@/lib/admin/resources";
import type { FieldErrors, Row } from "@/lib/admin/types";
import { useLoader } from "@/lib/admin/use-loader";

const STATUSES: { value: string; label: string; tone: BadgeTone }[] = [
  { value: "new", label: "Mới", tone: "blue" },
  { value: "contacted", label: "Đã liên hệ", tone: "purple" },
  { value: "qualified", label: "Tiềm năng", tone: "green" },
  { value: "closed", label: "Đã đóng", tone: "muted" },
];

const NOTE_MAX = 2000;
const SEARCH_MAX = 60;

interface Brief {
  id: string;
  created_at: string;
  locale: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  engagement_model_key: string | null;
  budget_key: string;
  timeline_key: string;
  status: string;
  internal_note: string;
  services: string[];
}

interface Page {
  items: Brief[];
  total: number;
  page: number;
  pageSize: number;
}

type Names = Record<string, Record<string, string>>;

const statusOf = (value: string) => STATUSES.find((s) => s.value === value) ?? STATUSES[0];
const formatTime = (iso: string) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

/** Danh sách brief khách gửi: tìm kiếm, lọc trạng thái, xem chi tiết, ghi chú, xóa và xuất CSV. */
export function BriefsManager() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<Names>({});
  const [selected, setSelected] = useState<Brief | null>(null);
  const [exporting, setExporting] = useState(false);

  // Chờ người dùng ngừng gõ rồi mới tìm, và quay về trang 1 khi từ khóa đổi.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useCallback(
    (extra: Record<string, string> = {}) => {
      const params = new URLSearchParams(extra);
      if (status) params.set("status", status);
      if (term) params.set("q", term);
      return params.toString();
    },
    [status, term],
  );

  const load = useCallback(async () => {
    const result = await adminApi.get<Page>(`/briefs?${query({ page: String(page) })}`);
    if (!result.ok) {
      setError(describeError(result.error, { subject: "danh sách brief", verb: "tải danh sách brief" }).message);
      return;
    }
    setError(null);
    setData(result.data);
  }, [query, page]);

  useLoader(load);

  // Tải tên tiếng Việt của dịch vụ, hình thức, ngân sách, thời gian để hiện thay cho mã.
  useEffect(() => {
    const kinds = ["services", "engagement-models", "budget-ranges", "timelines"];
    void Promise.all(kinds.map((k) => adminApi.get<{ items: Row[] }>(`/${k}`))).then((results) => {
      const next: Names = {};
      results.forEach((r, i) => {
        if (r.ok) next[kinds[i]] = Object.fromEntries(r.data.items.map((row) => [String(row.key), LOOKUP_LABEL[kinds[i]](row)]));
      });
      setNames(next);
    });
  }, []);

  const name = (kind: string, key: string | null) => (key ? (names[kind]?.[key] ?? key) : "Chưa chắc");

  async function exportCsv() {
    setExporting(true);
    const result = await downloadFile(`/briefs/export.csv?${query()}`, `brief-${new Date().toISOString().slice(0, 10)}.csv`);
    setExporting(false);
    if (result.ok) toast("success", "Đã tải file CSV theo bộ lọc hiện tại.");
    else toast("error", describeError(result.error, { subject: "file CSV", verb: "xuất CSV" }).message);
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filtering = Boolean(status || term);

  return (
    <>
      <PageHeader
        title="Brief khách gửi"
        description="Các yêu cầu khách gửi từ form trên website. Đổi trạng thái và ghi chú nội bộ để theo dõi việc liên hệ."
        actions={
          <button type="button" onClick={() => void exportCsv()} disabled={exporting || !data || data.total === 0} className={adminBtn.outline()}>
            <Icon name="download" size={16} />
            {exporting ? "Đang xuất…" : "Xuất CSV"}
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Icon name="search" size={18} className="pointer-events-none absolute top-3 left-3.5 text-fg-4" />
          <input
            type="search"
            value={search}
            maxLength={SEARCH_MAX}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email…"
            aria-label="Tìm brief theo tên hoặc email"
            className={`${inputClass()} h-11 pl-10`}
          />
        </div>
        <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1.5">
          {[{ value: "", label: "Tất cả" }, ...STATUSES].map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={status === s.value}
              onClick={() => {
                setStatus(s.value);
                setPage(1);
              }}
              className={`h-11 cursor-pointer rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
                status === s.value ? "border-brand-text bg-brand-soft-2 text-brand-text" : "border-line bg-surface text-fg-2 hover:border-line-brand"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

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

      {!error && !data && <Spinner label="Đang tải brief…" />}

      {data && data.items.length === 0 && (
        <div className={`${cardClass} flex flex-col items-center gap-2 px-6 py-12 text-center`}>
          <p className="text-[17px] font-bold">{filtering ? "Không có brief nào khớp bộ lọc" : "Chưa có brief nào"}</p>
          <p className="max-w-[46ch] text-sm text-fg-3">
            {filtering ? "Thử đổi từ khóa hoặc chọn trạng thái khác." : "Khi khách gửi form trên website, brief sẽ xuất hiện ở đây."}
          </p>
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
              }}
              className={adminBtn.outline("mt-2")}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((b) => {
              const st = statusOf(b.status);
              return (
                <li key={b.id} className={`${cardClass} flex flex-wrap items-center gap-x-4 gap-y-3 p-4`}>
                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold">{b.name}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {b.internal_note && <Badge>Có ghi chú</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-fg-3">
                      {b.email} · {formatTime(b.created_at)}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-fg-3">
                      {b.services.map((k) => name("services", k)).join(", ")} · {name("budget-ranges", b.budget_key)}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSelected(b)} className={adminBtn.outline("h-11 px-3.5 text-sm")}>
                    <Icon name="eye" size={16} />
                    Xem chi tiết
                  </button>
                </li>
              );
            })}
          </ul>

          <nav aria-label="Phân trang" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-fg-3">
            <span>
              {data.total} brief · trang {data.page}/{pages}
            </span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={adminBtn.outline("h-11 px-3.5 text-sm")}>
                <Icon name="chevronLeft" size={16} />
                Trước
              </button>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={adminBtn.outline("h-11 px-3.5 text-sm")}>
                Sau
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </nav>
        </>
      )}

      {selected && (
        <BriefDrawer
          key={selected.id}
          brief={selected}
          name={name}
          onClose={() => setSelected(null)}
          onChanged={(message) => {
            setSelected(null);
            toast("success", message);
            void load();
          }}
          onGone={() => {
            setSelected(null);
            toast("error", "Brief này không còn tồn tại (có thể đã bị xóa). Danh sách đã được tải lại.");
            void load();
          }}
        />
      )}
    </>
  );
}

function BriefDrawer({
  brief,
  name,
  onClose,
  onChanged,
  onGone,
}: {
  brief: Brief;
  name: (kind: string, key: string | null) => string;
  onClose: () => void;
  onChanged: (message: string) => void;
  onGone: () => void;
}) {
  const formId = useId();
  const [status, setStatus] = useState(brief.status);
  const [note, setNote] = useState(brief.internal_note);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const canDelete = useAdminSession().role === "admin";

  const noteError = errors.internal_note ? fieldMessage(errors.internal_note, { label: "ghi chú" }) : undefined;
  const statusError = errors.status ? fieldMessage(errors.status, { label: "trạng thái", kind: "select" }) : undefined;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setProblem(null);

    // Kiểm tra ngay ở trình duyệt để báo lỗi tức thì.
    const found: FieldErrors = {};
    if (note.trim().length > NOTE_MAX) found.internal_note = { code: "TOO_LONG", params: { max: NOTE_MAX } };
    if (!STATUSES.some((s) => s.value === status)) found.status = { code: "REQUIRED" };
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setProblem(describeError({ kind: "validation", fields: found }, { subject: "brief", verb: "lưu" }).message);
      return;
    }
    setErrors({});

    setSaving(true);
    const result = await adminApi.put(`/briefs/${brief.id}`, { status, internal_note: note.trim() });
    setSaving(false);

    if (result.ok) return onChanged(`Đã cập nhật brief của ${brief.name}.`);
    if (result.error.kind === "not-found") return onGone();
    if (result.error.kind === "validation") setErrors(result.error.fields);
    setProblem(describeError(result.error, { subject: "brief", verb: "lưu" }).message);
  }

  async function remove() {
    setDeleting(true);
    setDeleteError(undefined);
    const result = await adminApi.delete(`/briefs/${brief.id}`);
    setDeleting(false);
    if (result.ok) return onChanged(`Đã xóa brief của ${brief.name}.`);
    if (result.error.kind === "not-found") return onGone();
    setDeleteError(describeError(result.error, { subject: "brief này", verb: "xóa" }).message);
  }

  const detail: [string, string][] = [
    ["Gửi lúc", formatTime(brief.created_at)],
    ["Ngôn ngữ form", brief.locale === "vi" ? "Tiếng Việt" : "English"],
    ["Dịch vụ quan tâm", brief.services.map((k) => name("services", k)).join(", ")],
    ["Hình thức hợp tác", name("engagement-models", brief.engagement_model_key)],
    ["Ngân sách", name("budget-ranges", brief.budget_key)],
    ["Thời gian bắt đầu", name("timelines", brief.timeline_key)],
  ];

  return (
    <>
      <Drawer
        title={brief.name}
        onClose={onClose}
        footer={
          <>
            {canDelete && (
              <button type="button" onClick={() => setConfirmDelete(true)} className={adminBtn.outline("mr-auto hover:border-danger-line hover:text-danger")}>
                <Icon name="trash" size={16} />
                Xóa brief
              </button>
            )}
            <button type="button" onClick={onClose} className={adminBtn.outline()}>
              Đóng
            </button>
            <button type="submit" form={formId} disabled={saving} className={adminBtn.primary()}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <section className={`${cardClass} p-4`}>
            <p className="text-sm">
              <a href={`mailto:${brief.email}`} className="font-semibold text-brand-text hover:underline">
                {brief.email}
              </a>
              {brief.phone && (
                <>
                  {" · "}
                  <a href={`tel:${brief.phone}`} className="font-semibold text-brand-text hover:underline">
                    {brief.phone}
                  </a>
                </>
              )}
            </p>
            <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[150px_1fr]">
              {detail.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-fg-3">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-line-soft pt-3">
              <p className="text-sm text-fg-3">Nội dung khách mô tả</p>
              <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{brief.message || "Khách không nhập mô tả."}</p>
            </div>
          </section>

          <form id={formId} onSubmit={save} noValidate className="flex flex-col gap-5">
            {problem && <Banner>{problem}</Banner>}
            <FieldShell label="Trạng thái xử lý" required error={statusError} htmlFor={`${formId}-status`} errorId={`${formId}-status-error`}>
              <select
                id={`${formId}-status`}
                value={status}
                aria-invalid={statusError ? true : undefined}
                aria-describedby={statusError ? `${formId}-status-error` : undefined}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputClass(!!statusError)} h-11 cursor-pointer`}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FieldShell>
            <FieldShell
              label="Ghi chú nội bộ"
              hint="Chỉ đội ngũ thấy, khách hàng không thấy. Ví dụ: đã gọi lúc nào, khách muốn gì."
              error={noteError}
              htmlFor={`${formId}-note`}
              errorId={`${formId}-note-error`}
            >
              <textarea
                id={`${formId}-note`}
                rows={5}
                value={note}
                aria-invalid={noteError ? true : undefined}
                aria-describedby={noteError ? `${formId}-note-error` : undefined}
                onChange={(e) => setNote(e.target.value)}
                className={`${inputClass(!!noteError)} resize-y py-3 leading-relaxed`}
              />
              <span className={`text-right text-xs ${note.length > NOTE_MAX ? "text-danger" : "text-fg-4"}`}>
                {note.length}/{NOTE_MAX}
              </span>
            </FieldShell>
          </form>
        </div>
      </Drawer>

      {confirmDelete && (
        <ConfirmDialog
          title="Xóa brief này?"
          confirmLabel="Xóa brief"
          pending={deleting}
          error={deleteError}
          onConfirm={() => void remove()}
          onClose={() => setConfirmDelete(false)}
        >
          Bạn sắp xóa brief của <strong>{brief.name}</strong> ({brief.email}). Thao tác này không thể hoàn tác và sẽ mất cả ghi chú nội bộ.
        </ConfirmDialog>
      )}
    </>
  );
}
