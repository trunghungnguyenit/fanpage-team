"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Banner, FieldShell, adminBtn, inputClass } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import { URL_HINTS, describeError, fieldMessage, type FieldContext } from "@/lib/admin/messages";
import type { FieldDef, FieldErrors, FormValues, I18n } from "@/lib/admin/types";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldsProps {
  fields: FieldDef[];
  values: FormValues;
  errors: FieldErrors;
  onChange: (name: string, value: unknown) => void;
  /** danh sách lựa chọn tải từ API cho các trường `select` có `optionsFrom` */
  options: Record<string, SelectOption[]>;
  /** đang sửa dòng có sẵn: các trường `immutable` bị khóa */
  editing?: boolean;
}

const LANG_LABEL = { vi: "Tiếng Việt", en: "English" } as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** id của ô nhập, dùng để nối nhãn, thông báo lỗi và để đưa focus tới ô lỗi đầu tiên. */
const fieldId = (base: string, path: string) => `${base}-${path.replace(/\./g, "-")}`;

/** Ngữ cảnh báo lỗi cho một trường, kèm gợi ý riêng về địa chỉ nếu có. */
function contextOf(def: FieldDef, suffix = ""): FieldContext {
  const kind = def.kind === "select" ? "select" : def.kind === "i18n-list" || def.kind === "string-list" ? "list" : def.kind === "images" ? "images" : "text";
  const urlHint =
    def.kind === "images" ? URL_HINTS.image : def.kind === "text" && def.format ? URL_HINTS[def.format] : undefined;
  return { label: `${def.label.toLowerCase()}${suffix}`, kind, urlHint };
}

/** Vẽ toàn bộ các trường của một form theo định nghĩa. */
export function FormFields({ fields, values, errors, onChange, options, editing }: FormFieldsProps) {
  const base = useId().replace(/:/g, "");

  return (
    <div className="flex flex-col gap-5">
      {fields.map((def) => (
        <Field key={def.name} def={def} base={base} values={values} errors={errors} onChange={onChange} options={options} editing={editing} />
      ))}
    </div>
  );
}

function Field({ def, base, values, errors, onChange, options, editing }: Omit<FormFieldsProps, "fields"> & { def: FieldDef; base: string }) {
  const value = values[def.name];
  const msg = (path: string, suffix = "") => {
    const err = errors[path];
    return err ? fieldMessage(err, contextOf(def, suffix)) : undefined;
  };

  switch (def.kind) {
    case "text":
    case "textarea": {
      const id = fieldId(base, def.name);
      const error = msg(def.name);
      const text = (value as string) ?? "";
      const common = {
        id,
        value: text,
        placeholder: def.placeholder,
        disabled: editing && def.immutable,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
        onChange: (e: { target: { value: string } }) => onChange(def.name, e.target.value),
      };
      return (
        <FieldShell label={def.label} required={def.required} hint={def.hint} error={error} htmlFor={id} errorId={`${id}-error`}>
          {def.kind === "textarea" ? (
            <>
              <textarea {...common} rows={4} className={`${inputClass(!!error)} resize-y py-3 leading-relaxed`} />
              <span className={`text-right text-xs ${text.length > def.max ? "text-danger" : "text-fg-4"}`}>
                {text.length}/{def.max}
              </span>
            </>
          ) : (
            <input {...common} type="text" className={`${inputClass(!!error)} h-11`} />
          )}
        </FieldShell>
      );
    }

    case "number": {
      const id = fieldId(base, def.name);
      const error = msg(def.name);
      return (
        <FieldShell label={def.label} required={def.required} hint={def.hint} error={error} htmlFor={id} errorId={`${id}-error`}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={def.min}
            max={def.max}
            value={(value as string) ?? ""}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(def.name, e.target.value)}
            className={`${inputClass(!!error)} h-11 max-w-40`}
          />
        </FieldShell>
      );
    }

    case "boolean": {
      const id = fieldId(base, def.name);
      const on = Boolean(value);
      return (
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => onChange(def.name, !on)}
            className={`relative mt-0.5 h-6 w-11 flex-none cursor-pointer rounded-full transition-colors ${on ? "bg-brand" : "bg-line-strong"}`}
          >
            <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
          </button>
          <label htmlFor={id} className="cursor-pointer text-sm leading-snug">
            <span className="font-bold">{def.label}</span>
            {def.hint && <span className="block text-[13px] text-fg-3">{def.hint}</span>}
          </label>
        </div>
      );
    }

    case "select": {
      const id = fieldId(base, def.name);
      const error = msg(def.name);
      const list = def.options ?? (def.optionsFrom ? (options[def.optionsFrom] ?? []) : []);
      return (
        <FieldShell label={def.label} required={def.required} hint={def.hint} error={error} htmlFor={id} errorId={`${id}-error`}>
          <span className="relative block">
            <select
              id={id}
              value={(value as string) ?? ""}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(e) => onChange(def.name, e.target.value)}
              className={`${inputClass(!!error)} h-11 cursor-pointer appearance-none pr-10`}
            >
              <option value="">{def.emptyLabel ?? "— Chọn —"}</option>
              {list.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-fg-4" />
          </span>
        </FieldShell>
      );
    }

    case "i18n-text": {
      const v = (value ?? { vi: "", en: "" }) as I18n;
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-bold">
            {def.label}
            {def.required !== false && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
          </legend>
          {def.hint && <p className="-mt-1 mb-1 text-[13px] text-fg-3">{def.hint}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {(["vi", "en"] as const).map((lang) => {
              const path = `${def.name}.${lang}`;
              const id = fieldId(base, path);
              const error = msg(path, ` (${LANG_LABEL[lang]})`);
              const props = {
                id,
                value: v[lang] ?? "",
                "aria-invalid": error ? true : undefined,
                "aria-describedby": error ? `${id}-error` : undefined,
                onChange: (e: { target: { value: string } }) => onChange(def.name, { ...v, [lang]: e.target.value }),
              };
              return (
                <FieldShell key={lang} label={LANG_LABEL[lang]} error={error} htmlFor={id} errorId={`${id}-error`}>
                  {def.multiline ? (
                    <>
                      <textarea {...props} rows={4} className={`${inputClass(!!error)} resize-y py-3 leading-relaxed`} />
                      <span className={`text-right text-xs ${(v[lang] ?? "").length > def.max ? "text-danger" : "text-fg-4"}`}>
                        {(v[lang] ?? "").length}/{def.max}
                      </span>
                    </>
                  ) : (
                    <input {...props} type="text" className={`${inputClass(!!error)} h-11`} />
                  )}
                </FieldShell>
              );
            })}
          </div>
        </fieldset>
      );
    }

    case "i18n-list": {
      const v = (value ?? { vi: [""], en: [""] }) as I18n<string[]>;
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-bold">
            {def.label}
            <span className="ml-0.5 text-danger" aria-hidden="true">*</span>
          </legend>
          {def.hint && <p className="-mt-1 mb-1 text-[13px] text-fg-3">{def.hint}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {(["vi", "en"] as const).map((lang) => (
              <ListEditor
                key={lang}
                title={LANG_LABEL[lang]}
                idBase={fieldId(base, `${def.name}.${lang}`)}
                items={v[lang] ?? []}
                maxItems={def.maxItems}
                errors={errors}
                path={`${def.name}.${lang}`}
                makeMessage={(err) => fieldMessage(err, contextOf(def, ` (${LANG_LABEL[lang]})`))}
                onChange={(items) => onChange(def.name, { ...v, [lang]: items })}
              />
            ))}
          </div>
        </fieldset>
      );
    }

    case "string-list":
      return (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-bold">{def.label}</legend>
          {def.hint && <p className="-mt-1 mb-1 text-[13px] text-fg-3">{def.hint}</p>}
          <ListEditor
            idBase={fieldId(base, def.name)}
            items={(value as string[]) ?? []}
            maxItems={def.maxItems}
            placeholder={def.placeholder}
            errors={errors}
            path={def.name}
            makeMessage={(err) => fieldMessage(err, contextOf(def))}
            onChange={(items) => onChange(def.name, items)}
          />
        </fieldset>
      );

    case "images":
      return (
        <ImagesField
          def={def}
          urls={(value as string[]) ?? []}
          errors={errors}
          onChange={(urls) => onChange(def.name, urls)}
          idBase={fieldId(base, def.name)}
        />
      );
  }
}

/** Danh sách các dòng nhập, thêm/xóa từng dòng; lỗi hiển thị ngay dưới dòng bị lỗi. */
function ListEditor({
  title,
  idBase,
  items,
  maxItems,
  placeholder,
  errors,
  path,
  makeMessage,
  onChange,
}: {
  title?: string;
  idBase: string;
  items: string[];
  maxItems: number;
  placeholder?: string;
  errors: FieldErrors;
  path: string;
  makeMessage: (error: NonNullable<FieldErrors[string]>) => string;
  onChange: (items: string[]) => void;
}) {
  const listError = errors[path] ? makeMessage(errors[path]) : undefined;
  const update = (i: number, text: string) => onChange(items.map((item, idx) => (idx === i ? text : item)));

  return (
    <div className="flex flex-col gap-2">
      {title && <span className="text-[13px] font-bold text-fg-3">{title}</span>}
      {items.length === 0 && <p className="text-[13px] text-fg-4">Chưa có dòng nào.</p>}
      {items.map((item, i) => {
        const itemPath = `${path}.${i}`;
        const id = `${idBase}-${i}`;
        const itemError = errors[itemPath] ? makeMessage(errors[itemPath]) : undefined;
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                id={id}
                type="text"
                value={item}
                placeholder={placeholder ?? `Dòng ${i + 1}`}
                aria-label={`${title ?? "Dòng"} ${i + 1}`}
                aria-invalid={itemError ? true : undefined}
                aria-describedby={itemError ? `${id}-error` : undefined}
                onChange={(e) => update(i, e.target.value)}
                className={`${inputClass(!!itemError)} h-11`}
              />
              <button type="button" aria-label={`Xóa dòng ${i + 1}`} onClick={() => onChange(items.filter((_, idx) => idx !== i))} className={adminBtn.icon("flex-none")}>
                <Icon name="trash" size={16} />
              </button>
            </div>
            {itemError && (
              <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug font-medium text-danger">
                <Icon name="alert" size={15} className="mt-px flex-none" />
                {itemError}
              </p>
            )}
          </div>
        );
      })}
      {listError && (
        <p role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug font-medium text-danger">
          <Icon name="alert" size={15} className="mt-px flex-none" />
          {listError}
        </p>
      )}
      <button
        type="button"
        disabled={items.length >= maxItems}
        onClick={() => onChange([...items, ""])}
        className={adminBtn.outline("h-11 w-fit px-3.5 text-sm")}
      >
        <Icon name="plus" size={16} />
        Thêm dòng
        <span className="text-xs font-medium text-fg-4">
          ({items.length}/{maxItems})
        </span>
      </button>
    </div>
  );
}

/** Danh sách ảnh: tải ảnh lên Storage, xem trước, xóa và chọn ảnh bìa (ảnh đầu tiên). */
function ImagesField({
  def,
  urls,
  errors,
  onChange,
  idBase,
}: {
  def: Extract<FieldDef, { kind: "images" }>;
  urls: string[];
  errors: FieldErrors;
  onChange: (urls: string[]) => void;
  idBase: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const listError = errors[def.name] ? fieldMessage(errors[def.name], contextOf(def)) : undefined;

  async function upload(files: File[]) {
    setProblem(null);
    const added: string[] = [];
    setUploading(true);
    for (const file of files) {
      if (urls.length + added.length >= def.maxItems) {
        setProblem(`Tối đa ${def.maxItems} ảnh. Hãy xóa bớt ảnh cũ trước khi thêm.`);
        break;
      }
      if (!IMAGE_TYPES.includes(file.type)) {
        setProblem(`"${file.name}": ${describeError({ kind: "file-type" }, { subject: "ảnh", verb: "tải ảnh" }).message}`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setProblem(`"${file.name}": ${describeError({ kind: "file-too-large" }, { subject: "ảnh", verb: "tải ảnh" }).message}`);
        continue;
      }
      const result = await adminApi.uploadImage(file);
      if (result.ok) added.push(result.data.url);
      else {
        setProblem(`"${file.name}": ${describeError(result.error, { subject: "ảnh", verb: "tải ảnh lên" }).message}`);
        break;
      }
    }
    setUploading(false);
    if (added.length > 0) onChange([...urls, ...added]);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-bold">{def.label}</legend>
      {def.hint && <p className="-mt-1 mb-1 text-[13px] text-fg-3">{def.hint}</p>}

      {urls.length > 0 && (
        <ul className="grid gap-2">
          {urls.map((url, i) => {
            const itemError = errors[`${def.name}.${i}`] ? fieldMessage(errors[`${def.name}.${i}`], contextOf(def)) : undefined;
            return (
              <li key={`${url}-${i}`} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-24 flex-none items-center justify-center overflow-hidden rounded-xl bg-muted">
                    {/* Ảnh xem trước có địa chỉ bất kỳ nên không dùng next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Ảnh ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{i === 0 ? "Ảnh bìa" : `Ảnh ${i + 1}`}</p>
                    <input
                      id={`${idBase}-${i}`}
                      type="text"
                      value={url}
                      aria-label={`Đường dẫn ảnh ${i + 1}`}
                      aria-invalid={itemError ? true : undefined}
                      onChange={(e) => onChange(urls.map((u, idx) => (idx === i ? e.target.value : u)))}
                      className={`${inputClass(!!itemError)} mt-1 h-11 text-base sm:text-sm`}
                    />
                  </div>
                  <div className="flex flex-none flex-col gap-1.5">
                    {i > 0 && (
                      <button type="button" onClick={() => onChange([url, ...urls.filter((_, idx) => idx !== i)])} className={adminBtn.outline("h-11 px-3 text-xs")}>
                        Đặt làm ảnh bìa
                      </button>
                    )}
                    <button type="button" onClick={() => onChange(urls.filter((_, idx) => idx !== i))} className={adminBtn.outline("h-11 px-3 text-xs")}>
                      <Icon name="trash" size={14} />
                      Xóa ảnh
                    </button>
                  </div>
                </div>
                {itemError && (
                  <p role="alert" className="flex items-start gap-1.5 text-[13px] leading-snug font-medium text-danger">
                    <Icon name="alert" size={15} className="mt-px flex-none" />
                    {itemError}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {listError && <Banner>{listError}</Banner>}
      {problem && <Banner>{problem}</Banner>}

      <input
        ref={input}
        type="file"
        multiple
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length > 0) void upload(files);
        }}
      />
      <button
        type="button"
        disabled={uploading || urls.length >= def.maxItems}
        onClick={() => input.current?.click()}
        className={adminBtn.outline("w-fit")}
      >
        <Icon name="upload" size={16} />
        {uploading ? "Đang tải ảnh lên…" : "Tải ảnh lên"}
        <span className="text-xs font-medium text-fg-4">
          ({urls.length}/{def.maxItems})
        </span>
      </button>
      <p className="text-xs text-fg-4">Định dạng PNG, JPG, WEBP hoặc GIF, tối đa 5 MB mỗi ảnh.</p>
    </fieldset>
  );
}
