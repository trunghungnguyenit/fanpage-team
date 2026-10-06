import type { IconName } from "@/components/icons";

export const NAV_SECTIONS = ["services", "process", "work", "models", "faq"] as const;
export type NavSection = (typeof NAV_SECTIONS)[number];

/** Loại kênh liên hệ (cột `kind` của bảng `contact_channels`), quyết định icon. */
export type ChannelKind = "email" | "phone" | "zalo" | "messenger" | "other";

export const CHANNEL_ICONS: Record<ChannelKind, IconName> = {
  email: "mail",
  phone: "call",
  zalo: "chat",
  messenger: "msg",
  other: "globe",
};

/** Liên kết web mở ở tab mới; mailto: và tel: mở bằng ứng dụng tương ứng nên không cần. */
export const linkTarget = (url: string) =>
  /^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};
