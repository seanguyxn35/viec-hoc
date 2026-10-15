# Việc học của tôi

Website quản lý việc học: đăng nhập, thêm công việc, sửa tên, đánh dấu hoàn
thành, lọc và xóa. Giao diện dựng từ thiết kế Stitch (bài thực hành 1); dữ liệu
lưu thật ở Supabase, mỗi người chỉ truy cập công việc của mình (bài thực hành 2).

Công nghệ: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase
(PostgreSQL + Auth + RLS), Zod, Playwright, deploy trên Vercel.

## Trang và API

| Đường dẫn               | Nội dung                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| `/`                     | Chuyển hướng sang `/tasks`                                          |
| `/login`                | Đăng nhập email + mật khẩu bằng Supabase Auth                       |
| `/tasks`                | Danh sách công việc của người đăng nhập; chưa đăng nhập thì về `/login` |
| `GET /api/tasks`        | 200 `{ data: [...] }` — danh sách của người gọi                     |
| `POST /api/tasks`       | Body `{ "title": "Ôn React" }` → 201 `{ data: task }`               |
| `PATCH /api/tasks/:id`  | Body `{ "title": ... }` hoặc `{ "is_done": true }` → 200 `{ data: task }` |
| `DELETE /api/tasks/:id` | 200 `{ data: { id } }`                                              |

Mọi API yêu cầu header `Authorization: Bearer <access_token>`. Thiếu/sai token
→ 401; dữ liệu sai (tên ngoài 1–120 ký tự, field lạ, `user_id`, id không phải
UUID) → 400; không tìm thấy hoặc thuộc người khác → 404; lỗi xử lý → 500.

## Luồng xác thực và phân quyền

1. Trình duyệt đăng nhập bằng Supabase Auth (`signInWithPassword`) và giữ phiên.
2. Frontend gửi access token qua `Authorization: Bearer …` đến `/api/tasks`.
3. API xác minh token bằng `auth.getUser(token)` (`src/lib/auth-request.ts`) rồi
   truy vấn Supabase bằng chính token đó; chủ sở hữu lấy từ `user.id`, không từ form.
4. Bảng `tasks` bật Row Level Security: chỉ đọc/thêm/sửa/xóa được dòng có
   `user_id = auth.uid()`, kể cả khi gọi thẳng Supabase không qua API.

Web chỉ dùng publishable key; không dùng `service_role`/secret key.

## Cài đặt từ đầu

Yêu cầu Node.js 20.9 trở lên.

### 1. Tạo project Supabase

1. Vào <https://supabase.com/dashboard> → **New project** (gói Free). Đặt mật
   khẩu database mạnh và lưu riêng (không dùng trong code).
2. Lấy **Project URL** và **Publishable key** ở nút **Connect** hoặc
   **Project Settings → API Keys**. Project cũ chỉ có anon key thì dùng anon key.
   Không dùng secret key hay `service_role`.

### 2. Tạo bảng và chính sách RLS

Mở **SQL Editor → New query**, dán toàn bộ [supabase/schema.sql](supabase/schema.sql)
rồi **Run** (chạy một lần trên project mới). Kết quả: bảng `tasks` 5 cột, RLS bật,
4 chính sách đọc/thêm/sửa/xóa.

### 3. Tạo tài khoản thử

**Authentication → Users → Add user → Create new user**, tích **Auto Confirm User**.
Tạo hai tài khoản A và B (dữ liệu giả) để kiểm tra phân quyền. Không ghi mật
khẩu vào README hay source.

### 4. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env.local` (cùng cấp `package.json`) và điền:

| Biến                                   | Dùng cho                         |
| -------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | App (local và Vercel)            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | App (local và Vercel)            |
| `TEST_EMAIL_A`, `TEST_PASSWORD_A`      | Chỉ Playwright, chỉ trong `.env.local` |
| `TEST_EMAIL_B`, `TEST_PASSWORD_B`      | Chỉ Playwright, chỉ trong `.env.local` |

`.env.local` bị `.gitignore` chặn; không đưa lên GitHub và không khai báo biến
`TEST_*` trên Vercel.

### 5. Chạy ứng dụng

```bash
npm ci
npm run dev
```

Mở <http://localhost:3000> và đăng nhập bằng tài khoản A. Sau khi sửa `.env.local`
phải dừng (`Ctrl+C`) và chạy lại `npm run dev`.

## Kiểm tra và kiểm thử

```bash
npm run lint        # eslint
npm run typecheck   # next typegen + tsc --noEmit
npm run build       # next build
```

Kiểm thử tự động (đọc/ghi Supabase thật, không mock):

```bash
npx playwright install chromium   # lần đầu
npm run test:e2e                  # = npx playwright test --project=chromium
npx playwright show-report
```

Playwright tự chạy `npm run dev` nếu chưa có server ở cổng 3000. Test chỉ tạo
công việc có tiền tố `[e2e]` và tự dọn sau khi chạy, kể cả khi thất bại.

| Tệp                            | Nội dung                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| `tests/tasks.spec.ts`          | Giao diện: T01–T03, T05–T07, T12 (đăng nhập, CRUD + reload, 390 px, mất mạng, đăng xuất) |
| `tests/api.spec.ts`            | API: T04 (400), T08 (401), hợp đồng PATCH/DELETE                 |
| `tests/authorization.spec.ts`  | Phân quyền A/B: T09–T10 qua API, T11 RLS gọi thẳng Supabase      |

Kết quả thực tế ghi trong [docs/test-results.md](docs/test-results.md).

Chạy lại toàn bộ test trên bản online:

```bash
# PowerShell
$env:PLAYWRIGHT_BASE_URL="https://<ten-app>.vercel.app"; npx playwright test --project=chromium
```

## Deploy lên Vercel

1. Đưa source lên GitHub (repository `viec-hoc`). Kiểm tra `git status` không có
   `.env.local`, `node_modules`, `.next`, `playwright-report`, `test-results`.
2. Vercel → **Add New → Project** → import repository. Framework Preset:
   Next.js; Root Directory: thư mục có `package.json`; giữ Build Command
   `npm run build`, không đặt Output Directory.
3. **Environment Variables**: thêm `NEXT_PUBLIC_SUPABASE_URL` và
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Production, thêm Preview nếu cần).
4. **Deploy**, chờ trạng thái Ready rồi mở URL `*.vercel.app`.

Sau khi đổi biến môi trường trên Vercel phải **Redeploy**: biến `NEXT_PUBLIC_`
được gắn vào JavaScript lúc build. Bài dùng email/mật khẩu nên không cần cấu
hình OAuth callback. Supabase Free có thể tạm dừng project khi ít hoạt động;
kiểm tra dashboard trước buổi báo cáo.

## Cấu trúc chính

```
design/stitch/                 Thiết kế Stitch gốc (HTML, ảnh, DESIGN.md)
docs/screenshots/              Ảnh desktop/mobile của bài 1
docs/test-results.md           Kết quả B1 (bài 1) và T01–T12 (bài 2)
supabase/schema.sql            Bảng tasks, index, RLS và 4 chính sách
src/app/api/tasks/route.ts     GET, POST /api/tasks
src/app/api/tasks/[id]/route.ts PATCH, DELETE /api/tasks/:id
src/app/login/page.tsx         Trang /login
src/app/tasks/page.tsx         Trang /tasks
src/components/
  LoginForm.tsx                Đăng nhập Supabase Auth
  TaskDashboard.tsx            Kiểm tra phiên, gọi API, loading/error/empty
  AppHeader.tsx                Email người dùng và nút Đăng xuất
  TaskForm.tsx, TaskItem.tsx, TaskList.tsx, TaskFilters.tsx, EmptyState.tsx, Icon.tsx
src/lib/
  supabase-browser.ts          Supabase client dùng chung phía trình duyệt
  api-client.ts                apiFetch: gắn Bearer token, xử lý lỗi
  auth-request.ts              (server) xác minh token người gọi API
  api-response.ts              (server) JSON no-store, bắt exception trả 500
  types.ts                     Kiểu Task và TaskFilter
tests/                         Playwright (xem bảng ở trên)
playwright.config.ts           Project chromium, baseURL, webServer npm run dev
```

## Phiên bản khi làm bài

Ngày 15/10/2026: Node v24.20.0, npm 11.19.0, Claude Code 2.1.224, next 16.3.8,
react 19.2.8, tailwindcss 4.3.3, @supabase/supabase-js 2.117.3, zod 4.6.7,
@playwright/test 1.64.1. Kiểm tra lại bằng:

```bash
npm ls next react tailwindcss @supabase/supabase-js
```

Giữ `package-lock.json` và dùng `npm ci` khi cài lại từ source.

## Ghi chú khi chuyển thiết kế Stitch sang code

Một vài chỗ cố tình khác bản Stitch, lý do nêu rõ để đối chiếu khi chấm:

- **Không nhúng `cdn.tailwindcss.com` và script từ HTML Stitch.** Dự án dùng
  Tailwind v4 đã cài sẵn; token màu/chữ/khoảng cách trong `tailwind.config` của
  Stitch được chuyển thành `@theme` trong `globals.css`.
- **Biểu tượng vẽ bằng SVG inline** (`Icon.tsx`) thay cho font Material Symbols
  tải từ Google Fonts, để trang không phụ thuộc mạng ngoài.
- **Logo dùng tệp cục bộ** `public/images/logo.svg` thay cho ảnh
  `lh3.googleusercontent.com` trong bản xuất.
- **Bỏ các liên kết chưa có trang**: "Quên mật khẩu?", "Tạo tài khoản mới",
  "Ghi nhớ đăng nhập", và các mục điều hướng Tổng quan / Thời khóa biểu / Tài liệu.
  Bài học chỉ có đăng nhập, chưa xây đăng ký hay khôi phục mật khẩu.
- **Khối "Mô phỏng các trạng thái phụ"** trong bản Stitch là phần trình bày thiết
  kế; các trạng thái rỗng, đang tải và lỗi được dựng thành trạng thái thật.
- **Dòng đã hoàn thành vẫn giữ nút Sửa** (bản Stitch chỉ để nút Xóa), vì không
  có lý do chức năng để chặn đổi tên một việc đã xong.
