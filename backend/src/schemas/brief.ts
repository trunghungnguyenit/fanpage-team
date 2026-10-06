import { z } from "zod";
import { LOCALES } from "../i18n.js";

/** Khóa lựa chọn: chữ thường, số và dấu gạch ngang. Có tồn tại trong database hay không do repository kiểm tra. */
const optionKey = z.string().regex(/^[a-z0-9-]{1,60}$/);

/** Dữ liệu brief dự án gửi từ form của frontend. */
export const briefSchema = z.object({
  locale: z.enum(LOCALES),
  services: z.array(optionKey).min(1).max(20),
  // null nghĩa là khách chọn "chưa chắc"
  engagementModel: optionKey.nullable(),
  budget: optionKey,
  timeline: optionKey,
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).regex(/^\S+@\S+\.\S+$/),
  phone: z.string().trim().max(40),
  message: z.string().trim().max(4000),
});

export type Brief = z.infer<typeof briefSchema>;

/** Các trường có thể báo lỗi về cho frontend: `{ trường: true }`. */
export type FieldErrors = Partial<
  Record<"services" | "engagementModel" | "budget" | "timeline" | "name" | "email", true>
>;

const REPORTED_FIELDS = ["services", "name", "email"] as const;

/** Gom các trường sai định dạng thành object `{ trường: true }` để frontend hiển thị theo ngôn ngữ. */
export function collectFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = REPORTED_FIELDS.find((f) => f === issue.path[0]);
    if (field) errors[field] = true;
  }
  return errors;
}
