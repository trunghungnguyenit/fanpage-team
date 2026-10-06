import { Router } from "express";
import { getSupabase } from "../db/supabase.js";
import { deleteNeedsAdmin, requireAdmin, sessionOf } from "./auth.js";
import { briefsRouter } from "./briefs-router.js";
import { crudRouter } from "./crud-router.js";
import { adminErrorHandler } from "./errors.js";
import { textsRouter } from "./texts-router.js";
import { uploadsRouter } from "./uploads-router.js";
import { usersRouter } from "./users-router.js";

/** Số dòng của một bảng, có thể kèm điều kiện lọc. */
async function countRows(table: string, filter?: { column: string; value: string | boolean }) {
  let query = getSupabase().from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count, error } = await query;
  if (error) throw new Error(`Không đếm được ${table}: ${error.message}`);
  return count ?? 0;
}

/** API quản trị: mọi đường dẫn đều yêu cầu tài khoản admin. */
export const adminRouter = Router();

adminRouter.use(requireAdmin);
// editor chỉ thêm/sửa; mọi thao tác xóa cần quyền admin.
adminRouter.use(deleteNeedsAdmin);

adminRouter.get("/me", async (_req, res) => {
  const { id, email, name, role } = sessionOf(res);
  // Ghi lại lần đăng nhập gần nhất để admin biết tài khoản nào còn dùng; lỗi ở đây không được chặn việc vào trang.
  await getSupabase().from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", id);
  res.json({ email, name, role });
});

adminRouter.get("/overview", async (_req, res) => {
  const [briefsNew, briefsTotal, projectsPublished, projectsHidden, faqs, contactFilled] = await Promise.all([
    countRows("briefs", { column: "status", value: "new" }),
    countRows("briefs"),
    countRows("projects", { column: "is_published", value: true }),
    countRows("projects", { column: "is_published", value: false }),
    countRows("faqs"),
    countRows("contact_channels", { column: "is_published", value: true }),
  ]);
  res.json({ briefsNew, briefsTotal, projectsPublished, projectsHidden, faqs, contactFilled });
});

adminRouter.use("/briefs", briefsRouter);
adminRouter.use("/texts", textsRouter);
adminRouter.use("/uploads", uploadsRouter);
adminRouter.use("/admin-users", usersRouter);
// Phải đặt sau cùng vì `/:resource` khớp mọi đường dẫn còn lại.
adminRouter.use(crudRouter);

adminRouter.use(adminErrorHandler);
