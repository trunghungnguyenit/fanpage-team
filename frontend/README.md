# HTCode — frontend

Next.js 16 (App Router), React 19, Tailwind CSS v4. Chuyển từ bản thiết kế Claude Design trong `../design`.
Cài đặt và chạy xem README ở thư mục gốc; frontend chạy tại http://localhost:3000.

## Cấu trúc

- `proxy.ts` — chuyển hướng đường dẫn thiếu ngôn ngữ về `/vi`.
- `app/[lang]/` — root theo ngôn ngữ (`vi`, `en`), chứa root layout và trang chủ.
  - `projects`, `projects/[id]`, `brief` — route thật (chia sẻ được, refresh vẫn đúng).
  - `@overlay/` — parallel slot dùng intercepting routes: cùng các URL trên mở dạng overlay khi điều hướng từ trang chủ (`router.back()` để đóng).
- `lib/content.ts` — lấy nội dung từ backend (`/api/content`, `/api/projects`, cache 60 giây) và ghép thành `Dictionary`. Frontend không giữ file nội dung nào, nguồn duy nhất là database.
- `lib/dictionary.ts` — kiểu của `Dictionary` (phải khớp các khóa trong bảng `site_texts`).
- `lib/actions/brief.ts` — Server Action chuyển brief sang backend (`API_URL`).
- `app/[lang]/error.tsx` — trang lỗi song ngữ khi không lấy được nội dung (chữ cố định trong code vì lúc đó không đọc được database).
- `lib/site.ts` — mục điều hướng và icon theo loại kênh liên hệ.
- `app/globals.css` — design token. Màu giao diện sáng lấy từ thiết kế, giao diện tối suy ra từ xanh thương hiệu `#2b5be8`.

## Theme

`data-theme="light|dark"` trên `<html>`, được script inline gán trước lần paint đầu tiên (mặc định giao diện sáng; chỉ dùng giao diện tối khi người dùng đã tự chọn, lưu trong `localStorage`).
Đổi ngôn ngữ dùng thẻ `<a>` (tải lại toàn trang) vì thao tác này thay cả root layout.

## Nội dung giữ chỗ và dữ liệu thật

Giao diện tự ẩn các mục chỉ chứa giá trị giữ chỗ dạng `[...]` (xem `lib/placeholder.ts`) và hiện ra khi database có nội dung thật:

- `site_texts.stats`: mỗi dòng có dạng `<số> <nhãn>`, ví dụ `25+ sản phẩm đã ra mắt`. Dòng bắt đầu bằng `[Placeholder]` bị ẩn.
- `projects.url`: địa chỉ website đang chạy (http/https). Có `url` thì thẻ hiện tên miền và sheet chi tiết có nút "Xem website" mở tab mới; chưa có thì không hiện nút.
- `projects.tech`: bỏ qua các giá trị còn dạng `[...]`.
- `projects.images`: ảnh trên Supabase Storage (`https://<project>.supabase.co/...`); chưa có ảnh thì hiện khung minh họa.
- Kênh liên hệ lấy từ bảng `contact_channels` (xem README gốc): kênh chưa điền `value` bị ẩn.

## SEO

Đặt `SITE_URL` (xem `.env.example`) thành địa chỉ thật khi triển khai. Từ đó sinh canonical, hreflang, Open Graph, `sitemap.xml`, `robots.txt` và JSON-LD.
