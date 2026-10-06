import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 256 * 1024;
const MAX_REDIRECTS = 3;

/** Thẻ meta chứa ảnh chia sẻ, theo thứ tự ưu tiên. */
const IMAGE_META_KEYS = ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"];

const ATTRIBUTE = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

/** Địa chỉ IP nội bộ (loopback, mạng riêng, link-local, metadata cloud) không được phép truy cập. */
export function isPrivateIp(ip: string): boolean {
  const mapped = ip.toLowerCase().replace(/^::ffff:/, "");
  if (isIP(mapped) === 4) {
    const [a, b] = mapped.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  return mapped === "::1" || mapped === "::" || /^f[cd]/.test(mapped) || /^fe[89ab]/.test(mapped);
}

/** Chỉ cho phép http(s) tới máy chủ công cộng, tránh bị lợi dụng để truy cập mạng nội bộ (SSRF). */
async function assertPublicUrl(url: URL): Promise<void> {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Giao thức không hợp lệ");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error("Địa chỉ nội bộ không được phép");
  }
}

/** Đọc tối đa MAX_HTML_BYTES đầu của phản hồi, đủ để chứa phần <head>. */
async function readLimitedText(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  await reader.cancel().catch(() => undefined);
  return Buffer.concat(chunks).toString("utf8");
}

/** Tải HTML của trang, tự theo chuyển hướng nhưng kiểm tra lại từng bước. */
async function fetchHtml(startUrl: string): Promise<{ html: string; finalUrl: string } | null> {
  let url = new URL(startUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url);
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "CodeDevStudioBot/1.0 (+link preview)", Accept: "text/html" },
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return null;
      url = new URL(location, url);
      continue;
    }
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
    return { html: await readLimitedText(res), finalUrl: url.toString() };
  }
  return null;
}

const decodeEntities = (value: string) =>
  value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");

/** Lấy đường dẫn ảnh chia sẻ từ HTML, trả về đường dẫn https tuyệt đối hoặc null. */
export function extractOgImage(html: string, baseUrl: string): string | null {
  const found = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\s[^>]*>/gi)) {
    const attrs = new Map<string, string>();
    for (const m of tag.matchAll(ATTRIBUTE)) attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? "");
    const key = (attrs.get("property") ?? attrs.get("name") ?? "").toLowerCase();
    const content = attrs.get("content");
    if (content && IMAGE_META_KEYS.includes(key) && !found.has(key)) found.set(key, decodeEntities(content.trim()));
  }

  for (const key of IMAGE_META_KEYS) {
    const raw = found.get(key);
    if (!raw) continue;
    try {
      const image = new URL(raw, baseUrl);
      if (image.protocol === "https:") return image.toString();
    } catch {
      // Đường dẫn hỏng: thử thẻ tiếp theo.
    }
  }
  return null;
}

/** Lấy ảnh og:image của website, trả về null khi không có hoặc không truy cập được. */
export async function fetchOgImage(siteUrl: string): Promise<string | null> {
  try {
    const page = await fetchHtml(siteUrl);
    return page ? extractOgImage(page.html, page.finalUrl) : null;
  } catch {
    return null;
  }
}
