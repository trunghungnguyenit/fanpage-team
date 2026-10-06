"use client";

import { useCallback, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/admin/toast";
import { Banner, ConfirmDialog, Drawer, PageHeader, Spinner, adminBtn, cardClass, inputClass } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import { describeError, fieldMessage } from "@/lib/admin/messages";
import type { FieldErrors, I18n } from "@/lib/admin/types";
import { useLoader } from "@/lib/admin/use-loader";

interface TextRow {
  key: string;
  value: I18n<unknown>;
}

const MAX_TEXT = 2000;
const MAX_ITEMS = 30;

/** Các khóa chữ giao diện chia theo khu vực để dễ tìm. Khóa chưa liệt kê rơi vào nhóm “Khác”. */
const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Trang chủ: đầu trang (Hero)", keys: ["kicker", "h1a", "h1b", "h1c", "lede", "ctaPrimary", "ctaSecondary", "reassure", "stats", "trust"] },
  { title: "Trang chủ: Vì sao chọn chúng tôi", keys: ["whyK", "whyH", "whyP", "why"] },
  { title: "Trang chủ: Dịch vụ", keys: ["services", "servicesH", "servicesP"] },
  { title: "Trang chủ: Quy trình", keys: ["process", "processH", "processP", "yourRole", "deliverables", "discoveryFree"] },
  { title: "Trang chủ: Dự án", keys: ["work", "workH", "workP", "viewAll", "featuredTag", "showing", "techL", "visitSite", "similar"] },
  { title: "Trang chủ: Hình thức hợp tác", keys: ["models", "modelsH", "modelsP", "bestMvp", "soundsLikeUs", "retainerT", "retainerP"] },
  { title: "Trang chủ: Hỏi đáp (FAQ)", keys: ["faq", "faqH"] },
  { title: "Trang chủ: Liên hệ và chân trang", keys: ["closeH", "closeP", "sendBrief", "reassureClose", "orReach", "legal", "address", "startProject", "reply24", "ndaShort"] },
  { title: "Menu và nút dùng chung", keys: ["home", "back", "backHome", "next", "all", "more", "briefShort"] },
  { title: "Trang Tất cả dự án", keys: ["allTitle", "allH", "allP", "searchPh", "allSvc", "serviceL", "sortL", "sortFeat", "sortNew", "results", "resultsOne", "noResults", "clearFilters"] },
  {
    title: "Form brief",
    keys: ["step", "sent", "q1", "q1sub", "errSvc", "q2", "modelLabel", "notSure", "budget", "start", "q3", "name", "namePh", "email", "phoneZalo", "msg", "msgPh", "privacy", "errName", "errEmail", "submit", "doneT", "doneB", "you", "sumSvc", "sumModel", "service"],
  },
  { title: "Thông báo hệ thống", keys: ["ui"] },
];

/** Tên dễ hiểu của các trường con nằm trong khối lồng nhau. */
const NESTED_LABELS: Record<string, string> = {
  k: "Nhãn nhỏ phía trên",
  title: "Tiêu đề",
  items: "Các ý",
  theme: "Nút đổi giao diện sáng/tối",
  language: "Nhóm chọn ngôn ngữ",
  menu: "Nút mở menu",
  close: "Nút đóng",
  caseStudy: "Nhãn “Case study”",
  notFoundTitle: "Tiêu đề trang không tìm thấy",
  notFoundBack: "Nút về trang chủ (khi lỗi 404)",
  metaTitle: "Tiêu đề trang trên tab trình duyệt",
  skip: "Liên kết “bỏ qua điều hướng”",
  submitting: "Chữ khi đang gửi brief",
  submitError: "Thông báo khi gửi brief không được",
};

const LANGS = ["vi", "en"] as const;
const LANG_LABEL = { vi: "Tiếng Việt", en: "English" } as const;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Bản trống có cùng cấu trúc với `template`, dùng khi thêm một mục mới vào danh sách. */
function blankLike(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (Array.isArray(template)) return [""];
  if (isObject(template)) return Object.fromEntries(Object.keys(template).map((k) => [k, blankLike(template[k])]));
  return template;
}

/** Xem trước một giá trị bằng một dòng chữ ngắn. */
function preview(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(preview).join(" · ");
  if (isObject(value)) return Object.values(value).map(preview).join(" · ");
  return "";
}

/** Kiểm tra giống backend: cùng cấu trúc, không rỗng, không quá dài, giữ nguyên các ký hiệu như {n}. */
function check(template: unknown, value: unknown, path: string, errors: FieldErrors) {
  const fail = (code: string, params?: Record<string, number | string>) => {
    errors[path] ??= params ? { code, params } : { code };
  };

  if (typeof template === "string") {
    if (typeof value !== "string" || value.trim() === "") return fail("REQUIRED");
    const text = value.trim();
    if (text.length > MAX_TEXT) return fail("TOO_LONG", { max: MAX_TEXT });
    const missing = (template.match(/\{\w+\}/g) ?? []).filter((t) => !text.includes(t));
    if (missing.length > 0) fail("MISSING_PLACEHOLDER", { tokens: missing.join(" ") });
  } else if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length === 0) return fail("REQUIRED");
    if (value.length > MAX_ITEMS) fail("TOO_MANY", { max: MAX_ITEMS });
    const itemTemplate = template.length > 0 ? template[0] : "";
    value.forEach((item, i) => check(itemTemplate, item, `${path}.${i}`, errors));
  } else if (isObject(template)) {
    if (!isObject(value)) return fail("REQUIRED");
    for (const k of Object.keys(template)) check(template[k], value[k], `${path}.${k}`, errors);
  }
}

/** Tên hiển thị của một đường dẫn lỗi, lấy từ phần tên chữ cuối cùng. */
function labelOfPath(path: string): string {
  const name = path.split(".").filter((s) => s !== "vi" && s !== "en" && !/^\d+$/.test(s)).pop();
  return (name && NESTED_LABELS[name]) || "nội dung này";
}

export function TextsManager() {
  const [rows, setRows] = useState<TextRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TextRow | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    const result = await adminApi.get<{ items: TextRow[] }>("/texts");
    if (result.ok) {
      setError(null);
      setRows(result.data.items);
    } else setError(describeError(result.error, { subject: "chữ giao diện", verb: "tải danh sách chữ giao diện" }).message);
  }, []);

  useLoader(load);

  const groups = useMemo(() => {
    if (!rows) return [];
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const listed = new Set(GROUPS.flatMap((g) => g.keys));
    const all = [
      ...GROUPS.map((g) => ({ title: g.title, rows: g.keys.flatMap((k) => (byKey.has(k) ? [byKey.get(k)!] : [])) })),
      { title: "Khác", rows: rows.filter((r) => !listed.has(r.key)) },
    ];
    const term = search.trim().toLowerCase();
    return all
      .map((g) => ({ ...g, rows: term ? g.rows.filter((r) => `${r.key} ${preview(r.value.vi)} ${preview(r.value.en)}`.toLowerCase().includes(term)) : g.rows }))
      .filter((g) => g.rows.length > 0);
  }, [rows, search]);

  return (
    <>
      <PageHeader
        title="Chữ giao diện"
        description="Toàn bộ chữ cố định trên website, cho cả tiếng Việt và tiếng Anh. Bấm “Sửa” ở dòng cần đổi."
      />

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
      {!error && !rows && <Spinner label="Đang tải chữ giao diện…" />}

      {rows && (
        <>
          <div className="relative mb-4 max-w-sm">
            <Icon name="search" size={18} className="pointer-events-none absolute top-3 left-3.5 text-fg-4" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo nội dung hoặc mã…"
              aria-label="Tìm chữ giao diện"
              className={`${inputClass()} h-11 pl-10`}
            />
          </div>

          {groups.length === 0 && <p className="py-8 text-center text-sm text-fg-3">Không có chữ nào khớp “{search}”.</p>}

          <div className="flex flex-col gap-3">
            {groups.map((g, i) => (
              <details key={g.title} open={Boolean(search) || i === 0} className={`${cardClass} group`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-bold">
                  <span>
                    {g.title} <span className="text-sm font-medium text-fg-4">({g.rows.length})</span>
                  </span>
                  <Icon name="chevronDown" size={18} className="flex-none text-fg-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="divide-y divide-line-soft border-t border-line-soft">
                  {g.rows.map((r) => (
                    <li key={r.key} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold">{preview(r.value.vi)}</p>
                        <p className="truncate text-[13px] text-fg-3">
                          <code className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs">{r.key}</code>
                          {preview(r.value.en)}
                        </p>
                      </div>
                      <button type="button" onClick={() => setEditing(r)} className={adminBtn.outline("h-11 flex-none px-3.5 text-sm")}>
                        <Icon name="edit" size={16} />
                        Sửa
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </>
      )}

      {editing && (
        <TextEditor
          key={editing.key}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            toast("success", "Đã lưu chữ giao diện. Website cập nhật sau tối đa vài chục giây.");
            void load();
          }}
          onGone={() => {
            setEditing(null);
            toast("error", "Mục chữ này không còn tồn tại. Danh sách đã được tải lại.");
            void load();
          }}
        />
      )}
    </>
  );
}

function TextEditor({ row, onClose, onSaved, onGone }: { row: TextRow; onClose: () => void; onSaved: () => void; onGone: () => void }) {
  const formId = useId();
  const form = useRef<HTMLFormElement>(null);
  const initial = useMemo(() => JSON.stringify(row.value), [row]);
  const [value, setValue] = useState<I18n<unknown>>(() => JSON.parse(initial) as I18n<unknown>);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);
  const dirty = JSON.stringify(value) !== initial;

  const focusFirstError = () => requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  const requestClose = () => (dirty ? setAskDiscard(true) : onClose());

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setProblem(null);

    const found: FieldErrors = {};
    for (const lang of LANGS) check(row.value[lang], value[lang], lang, found);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setProblem(describeError({ kind: "validation", fields: found }, { subject: "chữ giao diện", verb: "lưu" }).message);
      focusFirstError();
      return;
    }
    setErrors({});

    setSaving(true);
    const result = await adminApi.put(`/texts/${row.key}`, value);
    setSaving(false);
    if (result.ok) return onSaved();
    if (result.error.kind === "not-found") return onGone();
    if (result.error.kind === "validation") {
      setErrors(result.error.fields);
      focusFirstError();
    }
    setProblem(describeError(result.error, { subject: "chữ giao diện", verb: "lưu" }).message);
  }

  return (
    <>
      <Drawer
        title="Sửa chữ giao diện"
        onClose={requestClose}
        footer={
          <>
            <button type="button" onClick={requestClose} className={adminBtn.outline()}>
              Hủy
            </button>
            <button type="submit" form={formId} disabled={saving} className={adminBtn.primary()}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </>
        }
      >
        <form id={formId} ref={form} onSubmit={save} noValidate className="flex flex-col gap-5">
          {problem && <Banner>{problem}</Banner>}
          <p className="text-[13px] text-fg-3">
            Mã: <code className="rounded bg-muted px-1.5 py-0.5 text-fg-2">{row.key}</code>
          </p>
          {/\{\w+\}/.test(JSON.stringify(row.value)) && (
            <Banner tone="info">Nội dung có ký hiệu trong ngoặc nhọn như {"{n}"} hoặc {"{name}"}: giữ nguyên các ký hiệu này, hệ thống sẽ thay bằng dữ liệu thật.</Banner>
          )}
          {LANGS.map((lang) => (
            <section key={lang} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
              <h3 className="text-sm font-extrabold tracking-wide text-fg-3 uppercase">{LANG_LABEL[lang]}</h3>
              <ValueEditor
                template={row.value[lang]}
                value={value[lang]}
                path={lang}
                idBase={`${formId}-${lang}`}
                errors={errors}
                onChange={(next) => {
                  setValue((v) => ({ ...v, [lang]: next }));
                  setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([p]) => p !== lang && !p.startsWith(`${lang}.`))));
                }}
              />
            </section>
          ))}
        </form>
      </Drawer>

      {askDiscard && (
        <ConfirmDialog title="Bỏ các thay đổi chưa lưu?" confirmLabel="Bỏ thay đổi" pending={false} onConfirm={onClose} onClose={() => setAskDiscard(false)}>
          Bạn đã sửa nội dung nhưng chưa lưu. Nếu đóng bây giờ, các thay đổi đó sẽ mất.
        </ConfirmDialog>
      )}
    </>
  );
}

/** Trình sửa đệ quy: chuỗi dùng ô nhập, danh sách thêm/xóa từng dòng, khối lồng nhau chia thành các ô con. */
function ValueEditor({
  template,
  value,
  path,
  idBase,
  errors,
  label,
  onChange,
}: {
  template: unknown;
  value: unknown;
  path: string;
  idBase: string;
  errors: FieldErrors;
  label?: string;
  onChange: (next: unknown) => void;
}) {
  const error = errors[path] ? fieldMessage(errors[path], { label: (label ?? labelOfPath(path)).toLowerCase() }) : undefined;
  const errorNode = error && (
    <p id={`${idBase}-error`} role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug font-medium text-danger">
      <Icon name="alert" size={15} className="mt-px flex-none" />
      {error}
    </p>
  );

  if (typeof template === "string") {
    const text = typeof value === "string" ? value : "";
    const long = text.length > 70 || text.includes("\n") || template.length > 70;
    const props = {
      id: idBase,
      value: text,
      "aria-label": label,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${idBase}-error` : undefined,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    };
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={idBase} className="text-[13px] font-bold">
            {label}
          </label>
        )}
        {long ? <textarea {...props} rows={3} className={`${inputClass(!!error)} resize-y py-3 leading-relaxed`} /> : <input {...props} type="text" className={`${inputClass(!!error)} h-11`} />}
        {errorNode}
      </div>
    );
  }

  if (Array.isArray(template)) {
    const items = Array.isArray(value) ? value : [];
    const itemTemplate = template.length > 0 ? template[0] : "";
    return (
      <div className="flex flex-col gap-2">
        {label && <span className="text-[13px] font-bold">{label}</span>}
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <ValueEditor
                template={itemTemplate}
                value={item}
                path={`${path}.${i}`}
                idBase={`${idBase}-${i}`}
                errors={errors}
                label={typeof itemTemplate === "string" ? `Dòng ${i + 1}` : `Mục ${i + 1}`}
                onChange={(next) => onChange(items.map((it, idx) => (idx === i ? next : it)))}
              />
            </div>
            <button type="button" aria-label={`Xóa mục ${i + 1}`} onClick={() => onChange(items.filter((_, idx) => idx !== i))} className={adminBtn.icon("mt-5 flex-none")}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        {errorNode}
        <button type="button" disabled={items.length >= MAX_ITEMS} onClick={() => onChange([...items, blankLike(itemTemplate)])} className={adminBtn.outline("h-11 w-fit px-3.5 text-sm")}>
          <Icon name="plus" size={16} />
          Thêm mục
        </button>
      </div>
    );
  }

  if (isObject(template)) {
    const obj = isObject(value) ? value : {};
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-3">
        {errorNode}
        {Object.keys(template).map((k) => (
          <ValueEditor
            key={k}
            template={template[k]}
            value={obj[k]}
            path={`${path}.${k}`}
            idBase={`${idBase}-${k}`}
            errors={errors}
            label={NESTED_LABELS[k] ?? k}
            onChange={(next) => onChange({ ...obj, [k]: next })}
          />
        ))}
      </div>
    );
  }

  return null;
}
