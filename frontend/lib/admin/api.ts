import { supabase } from "@/lib/admin/supabase";
import type { AdminErrorInfo, ApiResult, FieldErrors } from "@/lib/admin/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ErrorBody {
  code?: string;
  fields?: FieldErrors;
  usage?: { kind: string; count: number }[];
  requestId?: string;
}

/** Đọc JSON an toàn: phản hồi không phải JSON thì trả `null`. */
async function readJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Chuyển mã lỗi của backend thành nhóm lỗi giao diện hiểu; không giữ lại câu chữ nào từ backend. */
function toErrorInfo(status: number, body: ErrorBody | null): AdminErrorInfo {
  switch (body?.code) {
    case "UNAUTHENTICATED":
      return { kind: "unauthenticated" };
    case "FORBIDDEN":
      return { kind: "forbidden" };
    case "FORBIDDEN_ROLE":
      return { kind: "role-forbidden" };
    case "SELF_ACTION":
      return { kind: "self-action" };
    case "VALIDATION":
      return { kind: "validation", fields: body.fields ?? {} };
    case "IN_USE":
      return { kind: "in-use", usage: body.usage ?? [] };
    case "DUPLICATE":
      return { kind: "duplicate" };
    case "NOT_FOUND":
      return { kind: "not-found" };
    case "FILE_TYPE":
      return { kind: "file-type" };
    case "FILE_TOO_LARGE":
      return { kind: "file-too-large" };
    case "STORAGE_NOT_READY":
      return { kind: "storage-not-ready" };
    case "NOT_CONFIGURED":
      return { kind: "not-configured" };
    default:
      return { kind: "internal", requestId: status >= 500 ? body?.requestId : undefined };
  }
}

/** Gọi API admin kèm token đăng nhập. Mọi lỗi được chuẩn hóa thành `AdminErrorInfo`. */
async function send<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return { ok: false, error: { kind: "unauthenticated" } };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/admin${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }

  if (res.ok) return { ok: true, data: (res.status === 204 ? null : await readJson<T>(res)) as T };

  const error = toErrorInfo(res.status, await readJson<ErrorBody>(res));
  // Token hết hạn hoặc bị thu hồi: đăng xuất để giao diện chuyển về trang đăng nhập.
  if (error.kind === "unauthenticated") await supabase.auth.signOut();
  return { ok: false, error };
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const adminApi = {
  get: <T>(path: string) => send<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) => send<T>(path, json("POST", body)),
  put: <T>(path: string, body: unknown) => send<T>(path, json("PUT", body)),
  delete: (path: string) => send<null>(path, { method: "DELETE" }),
  /** Tải ảnh lên Storage, trả về địa chỉ công khai. */
  uploadImage: (file: File) =>
    send<{ url: string }>("/uploads", { method: "POST", headers: { "Content-Type": file.type }, body: file }),
};

/** Tải một file từ API admin (ví dụ CSV) về máy. */
export async function downloadFile(path: string, filename: string): Promise<ApiResult<null>> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) return { ok: false, error: { kind: "unauthenticated" } };

  try {
    const res = await fetch(`${API_URL}/api/admin${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { ok: false, error: toErrorInfo(res.status, await readJson<ErrorBody>(res)) };

    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: { kind: "network" } };
  }
}
