"use client";

import { useCallback, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { FormFields, type SelectOption } from "@/components/admin/form-fields";
import { useAdminSession } from "@/components/admin/session";
import { useToast } from "@/components/admin/toast";
import { Badge, Banner, ConfirmDialog, Drawer, PageHeader, Spinner, adminBtn, cardClass, inputClass } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import { describeError } from "@/lib/admin/messages";
import { LOOKUP_LABEL, resourceByName, type Lookups, type ResourceConfig } from "@/lib/admin/resources";
import type { AdminErrorInfo, FieldErrors, FormValues, Row } from "@/lib/admin/types";
import { useLoader } from "@/lib/admin/use-loader";
import { initialValues, toPayload, validateForm } from "@/lib/admin/validate";

type Drawing = { mode: "create" } | { mode: "edit"; row: Row } | null;

const idOf = (config: ResourceConfig, row: Row) => String(row[config.pk]);

/**
 * Danh sách và form thêm/sửa/xóa cho một tài nguyên, dựng hoàn toàn từ cấu hình của tài nguyên đó.
 * Nhận tên tài nguyên (chuỗi) vì cấu hình chứa hàm, không truyền được từ server component sang client component.
 */
export function ResourceManager({ resource }: { resource: string }) {
  const config = resourceByName(resource);
  // key buộc tạo lại toàn bộ trạng thái khi chuyển sang tài nguyên khác.
  return config ? <Manager key={config.resource} config={config} /> : null;
}

function Manager({ config }: { config: ResourceConfig }) {
  const toast = useToast();
  const me = useAdminSession();
  const [items, setItems] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [options, setOptions] = useState<Record<string, SelectOption[]>>({});
  const [lookups, setLookups] = useState<Lookups>({});
  const [drawing, setDrawing] = useState<Drawing>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [search, setSearch] = useState("");

  // Danh mục cần tải thêm để làm lựa chọn trong form (và để hiển thị tên thay cho mã ở danh sách dự án).
  const lookupNames = useMemo(() => {
    const names = new Set<string>(config.fields.flatMap((f) => (f.kind === "select" && f.optionsFrom ? [f.optionsFrom] : [])));
    if (config.resource === "projects") names.add("services");
    return [...names];
  }, [config]);

  const load = useCallback(async () => {
    const [list, ...lookupResults] = await Promise.all([
      adminApi.get<{ items: Row[] }>(`/${config.resource}`),
      ...lookupNames.map((name) => adminApi.get<{ items: Row[] }>(`/${name}`)),
    ]);

    const failed = !list.ok ? list : lookupResults.find((r) => !r.ok);
    if (failed && !failed.ok) {
      setLoadError(describeError(failed.error, { subject: config.singular, verb: "tải danh sách" }).message);
      return;
    }

    setLoadError(null);
    setItems(list.ok ? list.data.items : []);
    const nextOptions: Record<string, SelectOption[]> = {};
    const nextLookups: Lookups = {};
    lookupNames.forEach((name, i) => {
      const result = lookupResults[i];
      if (!result.ok) return;
      const label = LOOKUP_LABEL[name];
      nextOptions[name] = result.data.items.map((r) => ({ value: String(r.key), label: label(r) }));
      nextLookups[name] = Object.fromEntries(nextOptions[name].map((o) => [o.value, o.label]));
    });
    setOptions(nextOptions);
    setLookups(nextLookups);
  }, [config, lookupNames]);

  useLoader(load);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!items || !term) return items;
    return items.filter((r) => `${config.primary(r)} ${config.secondary?.(r, lookups) ?? ""}`.toLowerCase().includes(term));
  }, [items, search, config, lookups]);

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <button type="button" onClick={() => setDrawing({ mode: "create" })} className={adminBtn.primary()}>
            <Icon name="plus" size={18} />
            Thêm {config.singular}
          </button>
        }
      />

      {loadError && (
        <Banner
          action={
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                void load();
              }}
              className={adminBtn.outline("h-11 px-3 text-sm")}
            >
              Thử lại
            </button>
          }
        >
          {loadError}
        </Banner>
      )}

      {!loadError && items === null && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Spinner label="Đang tải danh sách…" />
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${cardClass} h-20 animate-pulse bg-muted`} />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className={`${cardClass} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
            <Icon name={config.icon} size={22} />
          </span>
          <p className="text-[17px] font-bold">Chưa có {config.singular} nào</p>
          <p className="max-w-[44ch] text-sm text-fg-3">Bấm “Thêm {config.singular}” để tạo mục đầu tiên.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          {items.length > 6 && (
            <div className="relative mb-4 max-w-sm">
              <Icon name="search" size={18} className="pointer-events-none absolute top-3 left-3.5 text-fg-4" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Tìm ${config.singular}…`}
                aria-label={`Tìm ${config.singular}`}
                className={`${inputClass()} h-11 pl-10`}
              />
            </div>
          )}

          <ul className="flex flex-col gap-3">
            {visible?.map((row) => (
              <li key={idOf(config, row)} className={`${cardClass} flex flex-wrap items-center gap-x-4 gap-y-3 p-4`}>
                <div className="min-w-0 flex-1 basis-60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold">{config.primary(row)}</span>
                    {config.badges?.(row, me).map((b) => (
                      <Badge key={b.label} tone={b.tone}>
                        {b.label}
                      </Badge>
                    ))}
                  </div>
                  {config.secondary && <p className="mt-1 line-clamp-2 text-sm text-fg-3">{config.secondary(row, lookups)}</p>}
                </div>
                <div className="flex flex-none items-center gap-2">
                  <button type="button" onClick={() => setDrawing({ mode: "edit", row })} className={adminBtn.outline("h-11 px-3.5 text-sm")}>
                    <Icon name="edit" size={16} />
                    Sửa
                  </button>
                  {me.role === "admin" && (
                    <button type="button" onClick={() => setDeleting(row)} aria-label={`Xóa ${config.primary(row)}`} className={adminBtn.icon("hover:border-danger-line hover:text-danger")}>
                      <Icon name="trash" size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {visible?.length === 0 && <p className="py-8 text-center text-sm text-fg-3">Không có {config.singular} nào khớp “{search}”.</p>}
        </>
      )}

      {drawing && (
        <ResourceForm
          key={drawing.mode === "edit" ? idOf(config, drawing.row) : "create"}
          config={config}
          row={drawing.mode === "edit" ? drawing.row : undefined}
          options={options}
          onClose={() => setDrawing(null)}
          onSaved={(name, mode) => {
            setDrawing(null);
            toast("success", mode === "create" ? `Đã thêm ${config.singular} “${name}”.` : `Đã lưu thay đổi cho “${name}”.`);
            void load();
          }}
          onGone={() => {
            setDrawing(null);
            void load();
          }}
        />
      )}

      {deleting && (
        <DeleteDialog
          config={config}
          row={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            toast("success", `Đã xóa ${config.singular} “${config.primary(deleting)}”.`);
            setDeleting(null);
            void load();
          }}
        />
      )}
    </>
  );
}

/** Form thêm/sửa trong ngăn kéo: kiểm tra ngay ở trình duyệt, rồi báo lỗi theo từng trường nếu backend từ chối. */
function ResourceForm({
  config,
  row,
  options,
  onClose,
  onSaved,
  onGone,
}: {
  config: ResourceConfig;
  row?: Row;
  options: Record<string, SelectOption[]>;
  onClose: () => void;
  onSaved: (name: string, mode: "create" | "edit") => void;
  onGone: () => void;
}) {
  const formId = useId();
  const body = useRef<HTMLFormElement>(null);
  const initial = useMemo(() => JSON.stringify(initialValues(config.fields, row)), [config, row]);
  const [values, setValues] = useState<FormValues>(() => JSON.parse(initial) as FormValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);
  const mode = row ? "edit" : "create";
  const dirty = JSON.stringify(values) !== initial;

  /** Đưa focus tới ô lỗi đầu tiên sau khi giao diện vẽ xong các thông báo lỗi. */
  const focusFirstError = () =>
    requestAnimationFrame(() => body.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());

  const requestClose = () => (dirty ? setAskDiscard(true) : onClose());

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setProblem(null);

    const found = validateForm(config.fields, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setProblem(describeError({ kind: "validation", fields: found }, { subject: config.singular, verb: "lưu" }).message);
      focusFirstError();
      return;
    }
    setErrors({});

    setSaving(true);
    const payload = toPayload(config.fields, values);
    const result = row
      ? await adminApi.put<{ item: Row }>(`/${config.resource}/${idOf(config, row)}`, payload)
      : await adminApi.post<{ item: Row }>(`/${config.resource}`, payload);
    setSaving(false);

    if (result.ok) {
      onSaved(config.primary(result.data.item), mode);
      return;
    }
    handleFailure(result.error);
  }

  function handleFailure(error: AdminErrorInfo) {
    if (error.kind === "validation") {
      setErrors(error.fields);
      focusFirstError();
    }
    if (error.kind === "not-found") {
      onGone();
      return;
    }
    setProblem(describeError(error, { subject: config.singular, verb: "lưu" }).message);
  }

  return (
    <>
      <Drawer
        title={mode === "create" ? `Thêm ${config.singular}` : `Sửa ${config.singular}`}
        onClose={requestClose}
        footer={
          <>
            <button type="button" onClick={requestClose} className={adminBtn.outline()}>
              Hủy
            </button>
            <button type="submit" form={formId} disabled={saving} className={adminBtn.primary()}>
              {saving ? "Đang lưu…" : mode === "create" ? `Thêm ${config.singular}` : "Lưu thay đổi"}
            </button>
          </>
        }
      >
        <form id={formId} ref={body} onSubmit={submit} noValidate className="flex flex-col gap-5">
          {problem && <Banner>{problem}</Banner>}
          {mode === "create" && config.createNote && <Banner tone="info">{config.createNote}</Banner>}
          {mode === "edit" && config.pk === "key" && row && (
            <p className="text-[13px] text-fg-3">
              Mã (key): <code className="rounded bg-muted px-1.5 py-0.5 text-fg-2">{String(row.key)}</code>
            </p>
          )}
          <FormFields
            fields={config.fields}
            values={values}
            errors={errors}
            options={options}
            editing={mode === "edit"}
            onChange={(name, value) => {
              setValues((v) => ({ ...v, [name]: value }));
              // Sửa tới đâu, xóa lỗi của trường đó tới đó.
              setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([path]) => path !== name && !path.startsWith(`${name}.`))));
            }}
          />
        </form>
      </Drawer>

      {askDiscard && (
        <ConfirmDialog
          title="Bỏ các thay đổi chưa lưu?"
          confirmLabel="Bỏ thay đổi"
          pending={false}
          onConfirm={onClose}
          onClose={() => setAskDiscard(false)}
        >
          Bạn đã nhập hoặc sửa nội dung nhưng chưa lưu. Nếu đóng bây giờ, các thay đổi đó sẽ mất.
        </ConfirmDialog>
      )}
    </>
  );
}

function DeleteDialog({
  config,
  row,
  onClose,
  onDeleted,
}: {
  config: ResourceConfig;
  row: Row;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function confirm() {
    setPending(true);
    setError(undefined);
    const result = await adminApi.delete(`/${config.resource}/${idOf(config, row)}`);
    setPending(false);
    if (result.ok) return onDeleted();
    if (result.error.kind === "not-found") return onDeleted();
    setError(describeError(result.error, { subject: `${config.singular} này`, verb: "xóa" }).message);
  }

  return (
    <ConfirmDialog title={`Xóa ${config.singular}?`} confirmLabel="Xóa" pending={pending} error={error} onConfirm={() => void confirm()} onClose={onClose}>
      Bạn sắp xóa {config.singular} <strong>“{config.primary(row)}”</strong>. Thao tác này không thể hoàn tác.
    </ConfirmDialog>
  );
}
