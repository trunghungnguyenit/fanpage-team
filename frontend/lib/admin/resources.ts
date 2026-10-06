import type { IconName } from "@/components/icons";
import { ROLE_LABEL, type AdminRole } from "@/lib/admin/roles";
import type { FieldDef, I18n, Row } from "@/lib/admin/types";
import { hostnameOf } from "@/lib/projects";

/** Bảng tra nhãn tiếng Việt theo khóa của các danh mục (dùng để hiển thị tên thay cho mã). */
export type Lookups = Record<string, Record<string, string>>;

type BadgeTone = "green" | "blue" | "purple" | "muted" | "amber";

export interface ResourceConfig {
  /** vừa là đường dẫn `/admin/<resource>` vừa là tên tài nguyên của API */
  resource: string;
  title: string;
  /** dùng trong câu như "Thêm dịch vụ", "Xóa dịch vụ này" */
  singular: string;
  description: string;
  icon: IconName;
  pk: "id" | "key";
  fields: FieldDef[];
  primary: (row: Row) => string;
  secondary?: (row: Row, lookups: Lookups) => string;
  badges?: (row: Row, me: { email: string }) => { label: string; tone: BadgeTone }[];
  /** chỉ vai trò Quản trị viên mới thấy và dùng được */
  adminOnly?: boolean;
  /** lưu ý hiện khi thêm mới */
  createNote?: string;
}

const vi = (value: unknown) => (value as I18n).vi;

const SORT_FIELD: FieldDef = {
  kind: "number",
  name: "sort_order",
  label: "Thứ tự hiển thị",
  min: 0,
  max: 1000,
  hint: "Số nhỏ hiện trước. Để trống khi thêm mới thì tự xếp xuống cuối.",
};

const KEY_NOTE = "Mã (key) tự sinh từ tên tiếng Việt khi tạo và không đổi được sau đó.";

/** Các icon dùng được cho dịch vụ. */
const ICON_OPTIONS = ["rocket", "monitor", "phone", "sparkles", "pen", "cloud", "wrench", "code", "users", "shield", "globe", "chat"].map((v) => ({
  value: v,
  label: v,
}));

const PROJECT_TYPES = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "ai", label: "AI" },
];

export const CHANNEL_KINDS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Điện thoại" },
  { value: "zalo", label: "Zalo" },
  { value: "messenger", label: "Messenger" },
  { value: "other", label: "Khác (Facebook, LinkedIn…)" },
];

export const RESOURCES: ResourceConfig[] = [
  {
    resource: "projects",
    title: "Dự án",
    singular: "dự án",
    description: "Các website đang chạy được giới thiệu ở mục Dự án trên trang chủ.",
    icon: "folder",
    pk: "id",
    fields: [
      { kind: "select", name: "type", label: "Loại dự án", required: true, options: PROJECT_TYPES },
      { kind: "select", name: "service_key", label: "Dịch vụ", required: true, optionsFrom: "services" },
      { kind: "i18n-text", name: "title", label: "Tên dự án", max: 120 },
      { kind: "i18n-text", name: "summary", label: "Mô tả ngắn", max: 300, multiline: true },
      {
        kind: "text",
        name: "url",
        label: "Địa chỉ website",
        max: 500,
        format: "web-url",
        placeholder: "https://tenmien.com",
        hint: "Có địa chỉ thì dự án hiện nút “Xem website”, và ảnh bìa được tự lấy từ website nếu bạn chưa tải ảnh.",
      },
      {
        kind: "images",
        name: "images",
        label: "Ảnh bìa",
        maxItems: 6,
        hint: "Ảnh đầu tiên là ảnh bìa. Để trống thì hệ thống tự lấy ảnh chia sẻ của website.",
      },
      { kind: "string-list", name: "tech", label: "Công nghệ sử dụng", maxItems: 12, itemMax: 40, placeholder: "Ví dụ: Next.js" },
      { kind: "boolean", name: "is_featured", label: "Dự án nổi bật", hint: "Hiện huy hiệu “Nổi bật” và xếp lên đầu danh sách." },
      { kind: "boolean", name: "is_published", label: "Hiển thị trên website", hint: "Tắt để ẩn tạm thời mà không xóa." },
    ],
    primary: (r) => vi(r.title),
    secondary: (r, l) =>
      [
        PROJECT_TYPES.find((t) => t.value === r.type)?.label,
        l.services?.[r.service_key as string],
        r.url ? hostnameOf(r.url as string) : "Chưa có website",
      ]
        .filter(Boolean)
        .join(" · "),
    badges: (r) => [
      ...(r.is_featured ? [{ label: "Nổi bật", tone: "blue" as const }] : []),
      ...(r.is_published ? [] : [{ label: "Đang ẩn", tone: "amber" as const }]),
    ],
  },
  {
    resource: "contact-channels",
    title: "Kênh liên hệ",
    singular: "kênh liên hệ",
    description: "Hiện ở khối “Liên hệ” trên trang chủ. Kênh chưa điền giá trị sẽ tự ẩn.",
    icon: "call",
    pk: "id",
    fields: [
      { kind: "select", name: "kind", label: "Loại kênh", required: true, options: CHANNEL_KINDS, hint: "Quyết định icon hiển thị." },
      { kind: "i18n-text", name: "label", label: "Tên hiển thị", max: 60 },
      { kind: "text", name: "value", label: "Thông tin hiển thị", max: 200, placeholder: "hello@tenmien.com", hint: "Chữ hiện trên thẻ, ví dụ email hoặc số điện thoại. Để trống thì kênh bị ẩn." },
      {
        kind: "text",
        name: "url",
        label: "Liên kết khi bấm",
        max: 500,
        format: "contact-url",
        placeholder: "mailto:hello@tenmien.com",
        hint: "Bắt đầu bằng https://, mailto: hoặc tel:. Để trống thì thẻ chỉ hiển thị, không bấm được.",
      },
      SORT_FIELD,
      { kind: "boolean", name: "is_published", label: "Hiển thị trên website" },
    ],
    primary: (r) => vi(r.label),
    secondary: (r) => (r.value ? (r.value as string) : "Chưa điền thông tin"),
    badges: (r) => [
      ...(!r.value ? [{ label: "Đang ẩn (chưa điền)", tone: "amber" as const }] : []),
      ...(r.value && !r.is_published ? [{ label: "Đang ẩn", tone: "amber" as const }] : []),
    ],
  },
  {
    resource: "services",
    title: "Dịch vụ",
    singular: "dịch vụ",
    description: "Danh sách dịch vụ ở trang chủ, trong form brief và khi lọc dự án.",
    icon: "sparkles",
    pk: "key",
    createNote: KEY_NOTE,
    fields: [
      { kind: "i18n-text", name: "title", label: "Tên dịch vụ", max: 80 },
      { kind: "i18n-text", name: "description", label: "Mô tả", max: 300, multiline: true },
      { kind: "select", name: "icon", label: "Icon", required: true, options: ICON_OPTIONS },
      SORT_FIELD,
    ],
    primary: (r) => vi(r.title),
    secondary: (r) => vi(r.description),
  },
  {
    resource: "engagement-models",
    title: "Hình thức hợp tác",
    singular: "hình thức hợp tác",
    description: "Các thẻ “Nghe giống chúng tôi” ở trang chủ và lựa chọn trong form brief.",
    icon: "users",
    pk: "key",
    createNote: KEY_NOTE,
    fields: [
      { kind: "i18n-text", name: "title", label: "Tên hình thức", max: 80 },
      { kind: "i18n-text", name: "situation", label: "Câu mô tả tình huống khách hàng", max: 200, multiline: true },
      { kind: "i18n-text", name: "description", label: "Mô tả", max: 300, multiline: true },
      { kind: "i18n-list", name: "points", label: "Điểm nổi bật", maxItems: 6, itemMax: 120, hint: "Mỗi ngôn ngữ cần ít nhất một dòng." },
      { kind: "select", name: "default_service_key", label: "Dịch vụ chọn sẵn trong form brief", optionsFrom: "services", emptyLabel: "Không chọn sẵn" },
      { kind: "boolean", name: "is_featured", label: "Gắn nhãn “Phù hợp nhất”", hint: "Thẻ được viền nổi bật." },
      SORT_FIELD,
    ],
    primary: (r) => vi(r.title),
    secondary: (r) => vi(r.situation),
    badges: (r) => (r.is_featured ? [{ label: "Nổi bật", tone: "blue" as const }] : []),
  },
  {
    resource: "process-steps",
    title: "Quy trình",
    singular: "bước quy trình",
    description: "Các bước ở mục Quy trình trên trang chủ.",
    icon: "list",
    pk: "key",
    createNote: KEY_NOTE,
    fields: [
      { kind: "i18n-text", name: "title", label: "Tên bước", max: 60 },
      { kind: "i18n-text", name: "duration", label: "Thời lượng", max: 40, hint: "Ví dụ “1–2 tuần”." },
      { kind: "i18n-text", name: "description", label: "Mô tả", max: 400, multiline: true },
      { kind: "i18n-text", name: "client_role", label: "Vai trò của khách hàng", max: 200, multiline: true },
      { kind: "i18n-list", name: "deliverables", label: "Khách nhận được", maxItems: 6, itemMax: 120 },
      SORT_FIELD,
    ],
    primary: (r) => vi(r.title),
    secondary: (r) => vi(r.duration),
  },
  {
    resource: "faqs",
    title: "Câu hỏi thường gặp",
    singular: "câu hỏi",
    description: "Mục FAQ ở trang chủ.",
    icon: "help",
    pk: "id",
    fields: [
      { kind: "i18n-text", name: "question", label: "Câu hỏi", max: 200 },
      { kind: "i18n-text", name: "answer", label: "Câu trả lời", max: 1000, multiline: true },
      SORT_FIELD,
    ],
    primary: (r) => vi(r.question),
    secondary: (r) => vi(r.answer),
  },
  {
    resource: "budget-ranges",
    title: "Ngân sách",
    singular: "mức ngân sách",
    description: "Các mức ngân sách khách chọn trong form brief.",
    icon: "tag",
    pk: "key",
    createNote: KEY_NOTE,
    fields: [{ kind: "i18n-text", name: "label", label: "Tên mức ngân sách", max: 60 }, SORT_FIELD],
    primary: (r) => vi(r.label),
    secondary: (r) => `Tiếng Anh: ${(r.label as I18n).en}`,
  },
  {
    resource: "timelines",
    title: "Thời gian bắt đầu",
    singular: "mốc thời gian",
    description: "Các mốc thời gian bắt đầu khách chọn trong form brief.",
    icon: "clock",
    pk: "key",
    createNote: KEY_NOTE,
    fields: [{ kind: "i18n-text", name: "label", label: "Tên mốc thời gian", max: 60 }, SORT_FIELD],
    primary: (r) => vi(r.label),
    secondary: (r) => `Tiếng Anh: ${(r.label as I18n).en}`,
  },
  {
    resource: "admin-users",
    title: "Tài khoản admin",
    singular: "tài khoản",
    description: "Những tài khoản Google được vào trang quản trị. Email không có trong danh sách này sẽ không vào được.",
    icon: "users",
    pk: "id",
    adminOnly: true,
    createNote: "Nhập đúng email của tài khoản Google. Người này đăng nhập bằng nút “Đăng nhập với Google” là vào được, không cần mật khẩu.",
    fields: [
      {
        kind: "text",
        name: "email",
        label: "Email Google",
        required: true,
        max: 254,
        format: "email",
        immutable: true,
        placeholder: "ten@gmail.com",
        hint: "Không đổi được sau khi tạo. Muốn đổi email thì thêm tài khoản mới rồi xóa tài khoản cũ.",
      },
      { kind: "text", name: "name", label: "Tên gọi", max: 80, placeholder: "Nguyễn Văn A", hint: "Không bắt buộc, giúp bạn nhận ra tài khoản này của ai." },
      {
        kind: "select",
        name: "role",
        label: "Vai trò",
        required: true,
        options: [
          { value: "admin", label: "Quản trị viên (toàn quyền)" },
          { value: "editor", label: "Biên tập viên (thêm/sửa, không xóa)" },
        ],
        hint: "Biên tập viên thêm và sửa nội dung, xem và xử lý brief nhưng không xóa được gì và không thấy mục này.",
      },
      { kind: "boolean", name: "is_active", label: "Cho phép đăng nhập", defaultValue: true, hint: "Tắt để khóa tạm thời mà vẫn giữ tài khoản trong danh sách." },
    ],
    primary: (r) => (r.name as string) || (r.email as string),
    secondary: (r) => `${r.email as string} · ${r.last_login_at ? `Đăng nhập gần nhất ${new Date(r.last_login_at as string).toLocaleString("vi-VN")}` : "Chưa đăng nhập lần nào"}`,
    badges: (r, me) => [
      { label: ROLE_LABEL[r.role as AdminRole], tone: r.role === "admin" ? "blue" : "muted" },
      ...(r.email === me.email ? [{ label: "Bạn", tone: "green" as const }] : []),
      ...(!r.is_active ? [{ label: "Đã khóa", tone: "amber" as const }] : []),
    ],
  },
];

export const resourceByName = (name: string) => RESOURCES.find((r) => r.resource === name);

/** Tài nguyên có thể làm nguồn lựa chọn và nhãn tiếng Việt (khóa -> tên). */
export const LOOKUP_LABEL: Record<string, (row: Row) => string> = {
  services: (r) => vi(r.title),
  "engagement-models": (r) => vi(r.title),
  "budget-ranges": (r) => vi(r.label),
  timelines: (r) => vi(r.label),
};
