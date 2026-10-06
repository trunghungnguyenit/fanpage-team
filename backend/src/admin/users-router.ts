import { Router } from "express";
import { z } from "zod";
import { getSupabase } from "../db/supabase.js";
import { requireAdminRole, sessionOf } from "./auth.js";
import { AdminError, notFound, unwrapAdmin, validationError } from "./errors.js";
import { optionalText, parseBody } from "./validation.js";

type Row = Record<string, unknown>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const role = z.enum(["admin", "editor"]);

/** Email Google: chữ thường, đúng định dạng. */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "REQUIRED")
  .max(254, "TOO_LONG|254")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "INVALID_EMAIL");

const createSchema = z.object({
  email,
  name: optionalText(80),
  role,
  is_active: z.boolean(),
});

/** Email không đổi được sau khi tạo nên khi sửa chỉ nhận các trường còn lại. */
const updateSchema = createSchema.omit({ email: true });

const COLUMNS = "id, email, name, role, is_active, last_login_at, created_at";

function parseId(raw: string): string {
  if (!UUID.test(raw)) throw notFound();
  return raw;
}

async function findById(id: string): Promise<Row> {
  const [row] = unwrapAdmin(
    await getSupabase().from("admin_users").select(COLUMNS).eq("id", id).limit(1).overrideTypes<Row[], { merge: false }>(),
  );
  if (!row) throw notFound();
  return row;
}

/** Quản lý danh sách tài khoản được vào trang quản trị. Chỉ `admin` được dùng. */
export const usersRouter = Router();

usersRouter.use(requireAdminRole);

usersRouter.get("/", async (_req, res) => {
  const items = unwrapAdmin(
    await getSupabase()
      .from("admin_users")
      .select(COLUMNS)
      .order("created_at")
      .order("id")
      .overrideTypes<Row[], { merge: false }>(),
  );
  res.json({ items });
});

usersRouter.post("/", async (req, res) => {
  const body = parseBody(createSchema, req.body);

  const existing = unwrapAdmin(
    await getSupabase().from("admin_users").select("id").eq("email", body.email).limit(1).overrideTypes<Row[], { merge: false }>(),
  );
  if (existing.length > 0) throw validationError({ email: { code: "DUPLICATE_EMAIL" } });

  const [item] = unwrapAdmin(
    await getSupabase().from("admin_users").insert(body).select(COLUMNS).overrideTypes<Row[], { merge: false }>(),
  );
  res.status(201).json({ item });
});

usersRouter.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const body = parseBody(updateSchema, req.body);
  await findById(id);

  // Tự hạ quyền hoặc tự khóa mình sẽ làm mất quyền vào trang quản trị ngay lập tức.
  if (id === sessionOf(res).id && (body.role !== "admin" || !body.is_active)) {
    throw new AdminError(409, "SELF_ACTION");
  }

  const [item] = unwrapAdmin(
    await getSupabase().from("admin_users").update(body).eq("id", id).select(COLUMNS).overrideTypes<Row[], { merge: false }>(),
  );
  if (!item) throw notFound();
  res.json({ item });
});

usersRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === sessionOf(res).id) throw new AdminError(409, "SELF_ACTION");

  const deleted = unwrapAdmin(
    await getSupabase().from("admin_users").delete().eq("id", id).select("id").overrideTypes<Row[], { merge: false }>(),
  );
  if (deleted.length === 0) throw notFound();
  res.status(204).end();
});
