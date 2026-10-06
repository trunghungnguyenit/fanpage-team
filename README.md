# fanpage-team

Monorepo (npm workspaces) gồm hai thư mục chính:

| Thư mục    | Chạy tại              | Vai trò                                                   |
| ---------- | --------------------- | --------------------------------------------------------- |
| `frontend` | http://localhost:3000 | Giao diện: Next.js 16 (App Router), React 19, Tailwind v4 |
| `backend`  | http://localhost:5000 | API, server: Express 5 + TypeScript                       |
| `design`   | —                     | Bản bàn giao thiết kế từ Claude Design (chỉ để tham khảo) |

## Chạy dự án

```bash
npm install          # cài đặt cho cả hai workspace, chạy ở thư mục gốc
npm run dev          # chạy frontend (3000) và backend (5000) cùng lúc
npm run build        # build backend rồi frontend
npm run lint         # lint cả hai
```

Chạy riêng từng phần: `npm run dev -w frontend` hoặc `npm run dev -w backend`.

## Biến môi trường

Chỉ cần tạo `.env` khi muốn đổi giá trị mặc định (xem `.env.example` trong từng thư mục):

- `backend`: `PORT` (5000), `CORS_ORIGIN` (http://localhost:3000), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (bắt buộc cho các API cần database)
- `frontend`: `API_URL` (http://localhost:5000), frontend gọi từ phía server
- `frontend` (trang quản trị `/admin`, chạy ở trình duyệt): `NEXT_PUBLIC_API_URL` (http://localhost:5000), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key, an toàn để công khai)

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở backend, không đưa vào frontend và không commit.

## Database (Supabase)

Toàn bộ nội dung trang nằm trong database. Frontend không giữ file nội dung nào, chỉ gọi backend (cache 60 giây). Schema và dữ liệu mẫu nằm trong `backend/supabase/`:

- `migrations/20261005000000_init_schema.sql` — bảng, ràng buộc, index, RLS và hàm `submit_brief`
- `migrations/20261005010000_site_texts_and_default_service.sql` — bảng `site_texts` và cột `engagement_models.default_service_key` (chạy lại nhiều lần được)
- `migrations/20261006000000_projects_live_url.sql` — dự án trở thành website đang chạy: thêm `projects.url`, **xóa** các cột `problem`, `solution`, `result`, `duration_weeks`, `team_size`, `kpis`, `testimonial`, `industry_key` và bảng `industries` (chạy lại nhiều lần được)
- `migrations/20261006010000_contact_channels.sql` — bảng `contact_channels` (kênh liên hệ) với 4 dòng trống để bạn điền; chạy lại không ghi đè dữ liệu đã điền
- `migrations/20261006020000_project_og_image.sql` — thêm 3 cột `og_image`, `og_image_checked_at`, `og_image_source` cho ảnh bìa tự lấy (backend tự điền, chạy lại được)
- `migrations/20261007000000_admin_support.sql` — cột `briefs.internal_note` (ghi chú nội bộ) và bucket Storage `images` (công khai) để tải ảnh dự án từ trang quản trị (chạy lại được)
- `migrations/20261008000000_admin_users.sql` — bảng `admin_users` (email Google được vào trang quản trị, cột `role`: `admin`/`editor`). **Điền email của bạn vào dòng `first_admin` trong file trước khi chạy** để có admin đầu tiên (chạy lại được)
- `seed.sql` — nội dung mẫu vi/en (placeholder `[...]` cần thay bằng nội dung thật)

Cách áp dụng: mở **SQL Editor** của project Supabase, chạy lần lượt các file trong `migrations/` rồi `seed.sql`. Sau đó điền `backend/.env` và xem dữ liệu bằng `npm run db:view -w backend`.

`seed.sql` chạy lại được: bảng có khóa chữ dùng upsert, còn `faqs` và `projects` bị xóa rồi nạp lại. **Chạy lại sẽ ghi đè nội dung đã sửa của hai bảng này**; `briefs` không bị đụng tới.

| Nhóm | Bảng |
| --- | --- |
| Chữ giao diện | `site_texts` (khóa -> `{"vi", "en"}`, giá trị có thể là chuỗi, mảng hoặc object) |
| Tra cứu (khóa chữ ổn định) | `services`, `engagement_models`, `budget_ranges`, `timelines` |
| Nội dung trang | `process_steps`, `faqs`, `contact_channels`, `projects` (`type`, `service_key`, `title`, `summary`, `url`, `tech`, `images`, `og_image*`) |
| Dữ liệu khách gửi | `briefs`, `brief_services` (dịch vụ khách chọn, quan hệ nhiều-nhiều) |
| Tài khoản quản trị | `admin_users` (`email`, `name`, `role` = `admin`\|`editor`, `is_active`, `last_login_at`) |

Nội dung hai ngôn ngữ lưu trong cột `jsonb` dạng `{"vi": ..., "en": ...}`. Mọi bảng bật RLS và không có policy nào, nên chỉ backend (service role) đọc ghi được; `anon` và `authenticated` bị chặn hoàn toàn.

Sửa chữ hoặc nội dung ngay trên Supabase (Table Editor); trang cập nhật sau tối đa 60 giây. Khi backend hoặc database lỗi, trang hiện thông báo lỗi kèm nút thử lại.

## Trang quản trị (`/admin`)

Quản lý toàn bộ nội dung và brief ngay trên giao diện, không cần mở Supabase. Địa chỉ: http://localhost:3000/admin.

**Thiết lập đăng nhập Google (một lần):**

1. Google Cloud Console > APIs & Services > Credentials > tạo **OAuth client ID** (loại Web). Thêm vào *Authorized redirect URIs*: `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Supabase > Authentication > Providers > **Google**: bật, dán Client ID và Client Secret.
3. Supabase > Authentication > URL Configuration: thêm `http://localhost:3000/admin/login` (và địa chỉ thật khi deploy) vào *Redirect URLs*.
4. Chạy migration `20261007000000_admin_support.sql` rồi `20261008000000_admin_users.sql`. Trước khi chạy file thứ hai, thay `EMAIL_CUA_BAN@gmail.com` bằng email Google của bạn để có admin đầu tiên.
5. (Khuyến nghị) Supabase > Authentication > Providers > **Email**: tắt, để Google là cách đăng nhập duy nhất.
6. Điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` vào `frontend/.env.local`, rồi đăng nhập lại.

Chỉ có đăng nhập bằng Google (không có tài khoản/mật khẩu riêng), qua Supabase Auth ở trình duyệt; token gửi kèm mỗi lần gọi `/api/admin/*`. Ở mỗi request backend kiểm tra: token hợp lệ, email Google đã xác minh, và email đó có trong bảng `admin_users` với `is_active = true`. Ai đăng nhập Google nhưng không có trong bảng (hoặc bị khóa) đều bị từ chối.

**Thêm người vào trang quản trị:** admin vào mục **Tài khoản admin** trong `/admin`, bấm "Thêm tài khoản", nhập email Google và chọn vai trò. Không cần chạy SQL nữa.

| Vai trò | Quyền |
| --- | --- |
| `admin` (Quản trị viên) | Toàn quyền: thêm, sửa, **xóa**, quản lý mục Tài khoản admin |
| `editor` (Biên tập viên) | Thêm/sửa nội dung, xem brief, đổi trạng thái và ghi chú brief, tải ảnh. **Không xóa** được gì và không thấy mục Tài khoản admin |

Ràng buộc an toàn: email không đổi được sau khi tạo; không tự xóa, tự khóa hay tự hạ quyền chính mình. Lỡ mất hết admin thì khôi phục bằng SQL Editor: `update admin_users set role = 'admin', is_active = true where email = 'ban@gmail.com';` (hoặc `insert` nếu chưa có dòng).

| Mục | Làm được gì |
| --- | --- |
| Tổng quan | Số liệu chính, việc nên làm (brief mới, chưa có dự án/kênh liên hệ) |
| Brief khách gửi | Tìm theo tên/email, lọc trạng thái, đổi trạng thái, ghi chú nội bộ, xóa, xuất CSV |
| Dự án | Thêm/sửa/xóa, tải ảnh lên Storage (PNG/JPG/WEBP/GIF ≤ 5 MB), địa chỉ website, nổi bật, ẩn |
| Kênh liên hệ | Điền giá trị và liên kết, ẩn/hiện |
| Chữ giao diện | Sửa chữ vi/en theo nhóm; kiểm tra giữ nguyên ký hiệu `{name}` |
| Tài khoản admin | (chỉ admin) thêm email Google, đổi vai trò, khóa tạm thời, xóa |
| Dịch vụ, Hình thức hợp tác, Quy trình, FAQ, Ngân sách, Thời gian | Thêm/sửa/xóa; mã (key) tự sinh từ tên tiếng Việt và không đổi được sau khi tạo |

Quy tắc xử lý lỗi: backend chỉ trả **mã lỗi** (`VALIDATION`, `IN_USE`, `FORBIDDEN`…), giao diện đổi thành câu tiếng Việt cụ thể gắn đúng trường (`frontend/lib/admin/messages.ts`); lỗi hệ thống chỉ hiện mã tham chiếu để tra log. Form kiểm tra trước ở trình duyệt theo đúng luật của backend (`frontend/lib/admin/validate.ts`). Xóa mục đang được dùng (vd. dịch vụ đã gắn dự án/brief) bị chặn và báo rõ số lượng đang dùng.

## Ảnh bìa dự án

Mỗi dự án hiện một ảnh bìa trên thẻ và trong sheet chi tiết, theo thứ tự ưu tiên:

1. Ảnh nhập tay: đường dẫn https đầu tiên trong cột `projects.images` (ví dụ ảnh tải lên Supabase Storage).
2. Ảnh tự lấy: backend đọc thẻ `og:image` (rồi `twitter:image`) của website trong `projects.url` và lưu vào `og_image`. Việc này chạy nền khi có người xem, nên phản hồi API không phải chờ; ảnh xuất hiện từ lần tải kế tiếp. Lấy lại sau 24 giờ, hoặc sau 1 giờ nếu lần trước không thấy ảnh, hoặc ngay khi bạn đổi `url`.
3. Chưa có ảnh nào hoặc ảnh lỗi: hiện khung minh họa.

Để an toàn, backend chỉ tải trang http(s) ở máy chủ công cộng (chặn localhost, mạng nội bộ, metadata cloud), tối đa 5 giây và 256 KB mỗi trang, chỉ nhận ảnh https. Muốn dùng ảnh khác với ảnh chia sẻ của website thì nhập tay vào `images`.

## Điền thông tin liên hệ

Khối "Liên hệ" của trang chủ đọc từ bảng `contact_channels` (Table Editor trên Supabase). Mỗi dòng là một kênh:

| Cột | Ý nghĩa |
| --- | --- |
| `kind` | `email`, `phone`, `zalo`, `messenger` hoặc `other` (quyết định icon) |
| `label` | Tên kênh theo ngôn ngữ, dạng `{"vi": "Điện thoại", "en": "Phone"}` |
| `value` | Chữ hiển thị trên thẻ, ví dụ `hello@abc.com` |
| `url` | Liên kết khi bấm: `https://...`, `mailto:...` hoặc `tel:...`. Để trống thì thẻ chỉ hiển thị, không bấm được |
| `sort_order`, `is_published` | Thứ tự và bật/tắt |

Kênh có `value` trống hoặc `is_published = false` bị ẩn. Chưa điền kênh nào thì cả cột "Hoặc liên hệ trực tiếp" ẩn đi. Muốn thêm kênh khác (Facebook, LinkedIn…), thêm dòng mới với `kind = other`. Menu mobile chỉ hiện các kênh có `url`.

## API

| Method | Đường dẫn | Mô tả |
| --- | --- | --- |
| GET | `/api/health` | Kiểm tra server còn hoạt động |
| POST | `/api/brief` | Lưu brief vào database. `201 {ok, id}`, `422 {ok:false, errors}` khi dữ liệu hoặc khóa lựa chọn sai |
| GET | `/api/content?lang=vi\|en` | Chữ giao diện (`texts`), dịch vụ, hình thức hợp tác, ngân sách, thời gian, quy trình, FAQ, kênh liên hệ (`contactChannels`) |
| GET | `/api/projects?lang=&type=web\|mobile\|ai` | Danh sách dự án đã xuất bản (kèm `url` website đang chạy), nổi bật xếp trước |
| GET | `/api/projects/:id?lang=` | Chi tiết một dự án |

Chưa cấu hình Supabase thì các API cần database trả `503`.

API quản trị `/api/admin/*` (cần header `Authorization: Bearer <access_token>` của admin): `GET /me` (email, tên, vai trò), `GET /overview`, `/admin-users` (chỉ admin), CRUD `/:resource` (`projects`, `contact-channels`, `services`, `engagement-models`, `budget-ranges`, `timelines`, `process-steps`, `faqs`), `/briefs` (+ `/briefs/export.csv`), `/texts`, `POST /uploads` (ảnh).

## Quy ước

- Ghi chú, chú thích trong code viết bằng tiếng Việt.
- Giữ code gọn, sạch; chạy `npm run lint` trước khi bàn giao.
- Không commit, không thao tác git khi chưa có yêu cầu.
