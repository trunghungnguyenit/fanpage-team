"use server";

import type { BriefField, BriefInput, BriefResult } from "@/lib/brief";
import type { Locale } from "@/lib/i18n";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

/** Trường lỗi backend trả về (tên trường của API) ứng với trường của form. */
const ERROR_FIELDS: Record<string, BriefField> = { services: "svc", name: "name", email: "email" };

/**
 * Chuyển brief sang backend (server gọi server nên không cần CORS).
 * Backend kiểm tra dữ liệu và trả về các trường lỗi để giao diện hiển thị theo ngôn ngữ.
 * Mọi lỗi khác (backend không chạy, lỗi 5xx, khóa lựa chọn sai) trả về `errors` rỗng
 * để giao diện báo lỗi chung.
 */
export async function submitBrief(locale: Locale, input: BriefInput): Promise<BriefResult> {
  const payload = {
    locale,
    services: input.svc,
    engagementModel: input.model,
    budget: input.budget,
    timeline: input.timeline,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.msg,
  };

  try {
    const res = await fetch(`${API_URL}/api/brief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (res.ok) return { ok: true };
    if (res.status === 422) {
      const body: { errors?: Record<string, true> } = await res.json();
      const errors: Partial<Record<BriefField, true>> = {};
      for (const field of Object.keys(body.errors ?? {})) {
        if (field in ERROR_FIELDS) errors[ERROR_FIELDS[field]] = true;
      }
      return { ok: false, errors };
    }
  } catch {
    // Không kết nối được backend: xử lý như lỗi chung bên dưới.
  }
  return { ok: false, errors: {} };
}
