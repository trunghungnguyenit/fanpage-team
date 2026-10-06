import type { AdminErrorInfo, FieldError } from "@/lib/admin/types";

/** Ngữ cảnh của một trường để câu báo lỗi nói đúng tên trường và đúng cách sửa. */
export interface FieldContext {
  label: string;
  /** cách nói "Vui lòng nhập/chọn/thêm…" */
  kind?: "text" | "select" | "list" | "images";
  /** gợi ý riêng khi địa chỉ sai định dạng */
  urlHint?: string;
}

export const URL_HINTS = {
  "web-url": "Địa chỉ website phải bắt đầu bằng http:// hoặc https:// (ví dụ https://tenmien.com).",
  "contact-url":
    "Liên kết phải bắt đầu bằng https://, mailto: hoặc tel: (ví dụ mailto:hello@abc.com hoặc tel:+84900000000). Có thể để trống.",
  email: "Email chưa đúng định dạng. Ví dụ: ten@gmail.com.",
  image: "Đường dẫn ảnh phải bắt đầu bằng https://.",
} as const;

const REQUIRED_VERB = { text: "nhập", select: "chọn", list: "thêm ít nhất một dòng cho", images: "thêm" } as const;

/** Câu báo lỗi cho một trường, bằng tiếng Việt, nêu rõ cách sửa. */
export function fieldMessage(error: FieldError, ctx: FieldContext): string {
  const { label } = ctx;
  const p = error.params ?? {};

  switch (error.code) {
    case "REQUIRED":
      return `Vui lòng ${REQUIRED_VERB[ctx.kind ?? "text"]} ${label}.`;
    case "TOO_LONG":
      return `${label} tối đa ${p.max} ký tự. Hãy rút gọn lại.`;
    case "TOO_MANY":
      return `${label} tối đa ${p.max} mục. Hãy xóa bớt.`;
    case "TOO_SMALL":
      return `${label} phải từ ${p.min} trở lên.`;
    case "TOO_BIG":
      return `${label} không được lớn hơn ${p.max}.`;
    case "INVALID_INTEGER":
      return `${label} phải là số nguyên (không có phần thập phân).`;
    case "INVALID_URL":
      return ctx.urlHint ?? "Địa chỉ không hợp lệ. Hãy nhập đầy đủ, bắt đầu bằng http:// hoặc https://.";
    case "INVALID_EMAIL":
      return ctx.urlHint ?? "Email chưa đúng định dạng. Ví dụ: ten@gmail.com.";
    case "DUPLICATE_EMAIL":
      return "Email này đã có trong danh sách tài khoản. Hãy sửa tài khoản đó thay vì thêm mới.";
    case "INVALID_CHOICE":
      return `Lựa chọn của ${label} không hợp lệ. Hãy chọn lại từ danh sách.`;
    case "INVALID_REFERENCE":
      return `${label} đã chọn không còn tồn tại (có thể vừa bị xóa). Hãy tải lại trang rồi chọn lại.`;
    case "MISSING_PLACEHOLDER":
      return `${label} phải giữ nguyên các ký hiệu ${p.tokens} vì hệ thống sẽ thay bằng dữ liệu thật.`;
    case "INVALID_TYPE":
    case "INVALID_VALUE":
    default:
      return `Giá trị của ${label} không hợp lệ. Hãy kiểm tra lại.`;
  }
}

const USAGE_KIND: Record<string, string> = {
  projects: "dự án",
  briefs: "brief",
  models: "hình thức hợp tác",
};

/** Ngữ cảnh của thao tác để câu báo lỗi chung nêu đúng việc đang làm. */
export interface ActionContext {
  /** ví dụ "dịch vụ này", "dự án này" */
  subject: string;
  /** ví dụ "lưu", "xóa", "tải danh sách" */
  verb: string;
}

export interface ErrorMessage {
  message: string;
  /** cần đăng nhập lại để tiếp tục */
  needsLogin?: boolean;
}

/** Câu báo lỗi cho cả thao tác (không phải lỗi từng trường). Không bao giờ chứa nội dung lỗi từ backend. */
export function describeError(error: AdminErrorInfo, ctx: ActionContext): ErrorMessage {
  switch (error.kind) {
    case "network":
      return {
        message: `Không kết nối được tới máy chủ nên chưa ${ctx.verb} được. Hãy kiểm tra mạng và chắc chắn backend đang chạy, rồi thử lại.`,
      };
    case "unauthenticated":
      return { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", needsLogin: true };
    case "forbidden":
      return { message: "Tài khoản này không có quyền vào trang quản trị (email chưa được thêm hoặc đã bị khóa). Hãy nhờ quản trị viên kiểm tra mục Tài khoản admin." };
    case "role-forbidden":
      return { message: `Tài khoản của bạn có quyền Biên tập viên nên chưa thể ${ctx.verb}. Chỉ Quản trị viên mới làm được việc này.` };
    case "self-action":
      return { message: "Bạn không thể tự xóa, tự khóa hoặc tự hạ quyền chính tài khoản đang đăng nhập. Hãy nhờ một quản trị viên khác thực hiện." };
    case "validation": {
      const n = Object.keys(error.fields).length;
      return {
        message: `Chưa ${ctx.verb} được vì có ${n} trường chưa hợp lệ. Hãy sửa các ô được đánh dấu đỏ rồi lưu lại.`,
      };
    }
    case "in-use": {
      const used = error.usage.map((u) => `${u.count} ${USAGE_KIND[u.kind] ?? u.kind}`).join(", ");
      return {
        message: `Không thể xóa ${ctx.subject} vì đang được dùng bởi ${used}. Hãy gỡ hoặc đổi các mục đó sang lựa chọn khác trước, rồi xóa lại.`,
      };
    }
    case "duplicate":
      return { message: "Giá trị này đã tồn tại. Hãy dùng giá trị khác." };
    case "not-found":
      return { message: `${capitalize(ctx.subject)} không còn tồn tại (có thể đã bị xóa ở nơi khác). Danh sách sẽ được tải lại.` };
    case "file-type":
      return { message: "Chỉ nhận ảnh định dạng PNG, JPG, WEBP hoặc GIF. File vừa chọn không đúng định dạng." };
    case "file-too-large":
      return { message: "Ảnh quá lớn. Dung lượng tối đa là 5 MB, hãy nén hoặc chọn ảnh nhỏ hơn." };
    case "storage-not-ready":
      return {
        message: "Kho lưu ảnh (Storage) chưa sẵn sàng. Hãy chạy migration admin_support trên Supabase để tạo bucket images, rồi thử lại.",
      };
    case "not-configured":
      return {
        message: "Backend chưa được cấu hình kết nối Supabase (thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong backend/.env).",
      };
    case "internal":
      return {
        message: `Hệ thống gặp lỗi không mong muốn khi ${ctx.verb}. Vui lòng thử lại.${
          error.requestId ? ` Nếu vẫn lỗi, hãy gửi mã ${error.requestId} cho người phụ trách kỹ thuật.` : ""
        }`,
      };
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
