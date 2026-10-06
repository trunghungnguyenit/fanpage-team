import { Router } from "express";
import { getSupabase } from "../db/supabase.js";
import { notFound, unwrapAdmin, validationError, type FieldErrors } from "./errors.js";

const MAX_TEXT = 2000;
const MAX_ITEMS = 30;

interface TextRow {
  key: string;
  value: { vi: unknown; en: unknown };
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Kiểm tra `value` có cùng cấu trúc với `template` (giá trị hiện có) và trả về bản đã làm sạch.
 * Nhờ vậy admin không thể làm hỏng cấu trúc chữ giao diện (ví dụ biến một danh sách thành chuỗi).
 */
function conform(template: unknown, value: unknown, path: string, errors: FieldErrors): unknown {
  const fail = (code: string, params?: Record<string, number | string>) => {
    errors[path] ??= params ? { code, params } : { code };
    return value;
  };

  if (typeof template === "string") {
    if (value === undefined) return fail("REQUIRED");
    if (typeof value !== "string") return fail("INVALID_TYPE");
    const trimmed = value.trim();
    if (trimmed === "") return fail("REQUIRED");
    if (trimmed.length > MAX_TEXT) return fail("TOO_LONG", { max: MAX_TEXT });
    // Chuỗi mẫu có chỗ trống như {n}, {name} thì bản mới phải giữ nguyên các ký hiệu đó.
    const missing = (template.match(/\{\w+\}/g) ?? []).filter((token) => !trimmed.includes(token));
    if (missing.length > 0) return fail("MISSING_PLACEHOLDER", { tokens: missing.join(" ") });
    return trimmed;
  }

  if (Array.isArray(template)) {
    if (value === undefined) return fail("REQUIRED");
    if (!Array.isArray(value)) return fail("INVALID_TYPE");
    if (value.length === 0) return fail("REQUIRED");
    if (value.length > MAX_ITEMS) return fail("TOO_MANY", { max: MAX_ITEMS });
    const itemTemplate = template.length > 0 ? template[0] : "";
    return value.map((item, i) => conform(itemTemplate, item, `${path}.${i}`, errors));
  }

  if (isObject(template)) {
    if (value === undefined) return fail("REQUIRED");
    if (!isObject(value)) return fail("INVALID_TYPE");
    return Object.fromEntries(
      Object.keys(template).map((k) => [k, conform(template[k], value[k], `${path}.${k}`, errors)]),
    );
  }

  return typeof value === typeof template ? value : fail("INVALID_TYPE");
}

export const textsRouter = Router();

textsRouter.get("/", async (_req, res) => {
  const items = unwrapAdmin(
    await getSupabase()
      .from("site_texts")
      .select("*")
      .order("key")
      .overrideTypes<TextRow[], { merge: false }>(),
  );
  res.json({ items });
});

textsRouter.put("/:key", async (req, res) => {
  if (!/^[A-Za-z0-9]{1,60}$/.test(req.params.key)) throw notFound();

  const [current] = unwrapAdmin(
    await getSupabase()
      .from("site_texts")
      .select("*")
      .eq("key", req.params.key)
      .limit(1)
      .overrideTypes<TextRow[], { merge: false }>(),
  );
  if (!current) throw notFound();

  const body: unknown = req.body;
  const errors: FieldErrors = {};
  const value = {
    vi: conform(current.value.vi, isObject(body) ? body.vi : undefined, "vi", errors),
    en: conform(current.value.en, isObject(body) ? body.en : undefined, "en", errors),
  };
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const [item] = unwrapAdmin(
    await getSupabase()
      .from("site_texts")
      .update({ value })
      .eq("key", req.params.key)
      .select()
      .overrideTypes<TextRow[], { merge: false }>(),
  );
  res.json({ item });
});
