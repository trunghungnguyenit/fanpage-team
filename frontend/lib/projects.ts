export type ProjectType = "web" | "mobile" | "ai";
export type Tint = "blue" | "green" | "purple";

/** Loại dự án kèm nhãn hiển thị trên các tab lọc. */
export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "ai", label: "AI" },
];

/** Dự án do backend trả về (đã chọn ngôn ngữ). Mỗi dự án là một website đang chạy. */
export interface Project {
  id: number;
  type: ProjectType;
  serviceKey: string;
  isFeatured: boolean;
  title: string;
  summary: string;
  /** Địa chỉ website đang chạy, `null` nếu chưa có. */
  url: string | null;
  tech: string[];
  /** Ảnh bìa: ảnh nhập tay hoặc og:image tự lấy từ website, `null` nếu chưa có. */
  image: string | null;
}

/** Tên miền để hiển thị, ví dụ "example.com" (bỏ "www."). */
export const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const TYPE_TINT: Record<ProjectType, Tint> = {
  web: "blue",
  mobile: "purple",
  ai: "green",
};

/** Viết đủ chuỗi class để Tailwind nhận diện được. */
export const TINT = {
  blue: {
    soft: "bg-tint-blue-soft",
    chip: "bg-tint-blue-chip",
    fg: "text-tint-blue-fg",
    dot: "bg-tint-blue-fg",
    cover: "cover-blue",
  },
  green: {
    soft: "bg-tint-green-soft",
    chip: "bg-tint-green-chip",
    fg: "text-tint-green-fg",
    dot: "bg-tint-green-fg",
    cover: "cover-green",
  },
  purple: {
    soft: "bg-tint-purple-soft",
    chip: "bg-tint-purple-chip",
    fg: "text-tint-purple-fg",
    dot: "bg-tint-purple-fg",
    cover: "cover-purple",
  },
} as const;

/** Thứ tự tông màu thiết kế dùng cho các mục lặp lại. */
export const TINT_CYCLE: Tint[] = ["blue", "green", "purple"];
export const TINT_STORY: Tint[] = ["purple", "blue", "green"];

export const byFeatured = (a: Project, b: Project) =>
  Number(b.isFeatured) - Number(a.isFeatured) || a.id - b.id;

export const PAGE_SIZE = 6;
export const HOME_LIMIT = 9;
