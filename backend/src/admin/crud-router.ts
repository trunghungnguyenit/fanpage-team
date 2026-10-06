import { randomBytes } from "node:crypto";
import { Router } from "express";
import { getSupabase } from "../db/supabase.js";
import { AdminError, notFound, unwrapAdmin } from "./errors.js";
import { RESOURCES, type ResourceDef } from "./resources.js";
import { parseBody, slugify } from "./validation.js";

type Row = Record<string, unknown>;

/** Lấy định nghĩa tài nguyên từ đường dẫn, không có thì trả 404. */
function resourceOf(name: string): ResourceDef {
  const def = RESOURCES[name];
  if (!def) throw notFound();
  return def;
}

/** Giá trị khóa chính hợp lệ từ đường dẫn: số nguyên dương hoặc khóa chữ. */
function parseId(def: ResourceDef, raw: string): string | number {
  if (def.pk === "id") {
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) throw notFound();
    return id;
  }
  if (!/^[a-z0-9-]{1,60}$/.test(raw)) throw notFound();
  return raw;
}

/** Số thứ tự kế tiếp (lớn nhất hiện có + 1) cho dòng mới. */
async function nextSortOrder(table: string): Promise<number> {
  const rows = unwrapAdmin(
    await getSupabase()
      .from(table)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .overrideTypes<{ sort_order: number }[], { merge: false }>(),
  );
  return (rows[0]?.sort_order ?? 0) + 1;
}

/** Sinh khóa từ tên tiếng Việt, thêm hậu tố -2, -3… nếu trùng. */
async function uniqueKey(def: ResourceDef, body: Row): Promise<string> {
  const rows = unwrapAdmin(
    await getSupabase().from(def.table).select("key").overrideTypes<{ key: string }[], { merge: false }>(),
  );
  const taken = new Set(rows.map((r) => r.key));
  const base = slugify(def.keySource!(body)) || `muc-${randomBytes(2).toString("hex")}`;
  let key = base;
  for (let n = 2; taken.has(key); n++) key = `${base}-${n}`;
  return key;
}

/** Số nơi đang dùng dòng này; có thì không được xóa. */
async function findUsage(def: ResourceDef, id: string | number) {
  const used: { kind: string; count: number }[] = [];
  for (const rule of def.usage ?? []) {
    const { count, error } = await getSupabase()
      .from(rule.table)
      .select("*", { count: "exact", head: true })
      .eq(rule.column, id);
    if (error) throw new Error(`Không đếm được ${rule.table}: ${error.message}`);
    if (count) used.push({ kind: rule.kind, count });
  }
  return used;
}

/** CRUD dùng chung cho các bảng nội dung, cấu hình trong `resources.ts`. */
export const crudRouter = Router();

crudRouter.get("/:resource", async (req, res) => {
  const def = resourceOf(req.params.resource);
  const items = unwrapAdmin(
    await getSupabase()
      .from(def.table)
      .select("*")
      .order(def.orderBy)
      .order(def.pk)
      .overrideTypes<Row[], { merge: false }>(),
  );
  res.json({ items });
});

crudRouter.get("/:resource/:id", async (req, res) => {
  const def = resourceOf(req.params.resource);
  const [item] = unwrapAdmin(
    await getSupabase()
      .from(def.table)
      .select("*")
      .eq(def.pk, parseId(def, req.params.id))
      .limit(1)
      .overrideTypes<Row[], { merge: false }>(),
  );
  if (!item) throw notFound();
  res.json({ item });
});

crudRouter.post("/:resource", async (req, res) => {
  const def = resourceOf(req.params.resource);
  const body: Row = parseBody(def.schema, req.body);

  const row: Row = { ...body };
  if ("sort_order" in def.schema.shape && row.sort_order === undefined) {
    row.sort_order = await nextSortOrder(def.table);
  }
  if (def.pk === "key") row.key = await uniqueKey(def, body);

  const [item] = unwrapAdmin(
    await getSupabase().from(def.table).insert(row).select().overrideTypes<Row[], { merge: false }>(),
  );
  res.status(201).json({ item });
});

crudRouter.put("/:resource/:id", async (req, res) => {
  const def = resourceOf(req.params.resource);
  const id = parseId(def, req.params.id);
  const body: Row = parseBody(def.schema, req.body);

  // Chưa nhập thứ tự thì giữ nguyên thứ tự cũ.
  if (body.sort_order === undefined) delete body.sort_order;

  const items = unwrapAdmin(
    await getSupabase()
      .from(def.table)
      .update(body)
      .eq(def.pk, id)
      .select()
      .overrideTypes<Row[], { merge: false }>(),
  );
  if (items.length === 0) throw notFound();
  res.json({ item: items[0] });
});

crudRouter.delete("/:resource/:id", async (req, res) => {
  const def = resourceOf(req.params.resource);
  const id = parseId(def, req.params.id);

  const usage = await findUsage(def, id);
  if (usage.length > 0) throw new AdminError(409, "IN_USE", { usage });

  const deleted = unwrapAdmin(
    await getSupabase().from(def.table).delete().eq(def.pk, id).select().overrideTypes<Row[], { merge: false }>(),
  );
  if (deleted.length === 0) throw notFound();
  res.status(204).end();
});
