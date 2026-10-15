@AGENTS.md

# Quy tắc dự án "Việc học của tôi"

Dự án thực hành IE104. Bài 1 (giao diện, dữ liệu tạm) đã xong ở commit
"Finish lab 1 frontend". Hiện đang ở **bài thực hành 2**: lưu dữ liệu thật ở
Supabase, đăng nhập thật, API, kiểm thử và deploy Vercel trên cùng dự án này.
Giữ nguyên các quy tắc dưới đây giữa các phiên.

## Kiến trúc

- Next.js App Router (`src/app`), TypeScript, Tailwind CSS v4. Dùng đúng
  dependency đã cài, không thêm thư viện mới mà không có lý do.
- Tailwind v4 khai báo design token bằng `@theme` trong `src/app/globals.css`.
  Không tạo `tailwind.config.js`.
- Component có tương tác phải khai báo `"use client"`.

## Phạm vi bài 2 (quan trọng)

- **Luồng thống nhất:** Supabase Auth chạy ở trình duyệt; frontend gửi access
  token qua header `Authorization: Bearer <token>` đến API `/api/tasks`. Backend
  xác minh token bằng `auth.getUser(token)` rồi truy vấn Supabase bằng chính
  token đó để RLS có hiệu lực. Không trộn thêm cookie SSR.
- **Phân quyền:** bảng `tasks` bật RLS với 4 chính sách đọc/thêm/sửa/xóa theo
  `auth.uid() = user_id`. Không tắt RLS để vượt lỗi.
- **Không dùng `service_role`/secret key** trong code web. Chỉ dùng hai biến
  `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Không nhận `user_id` từ form** làm bằng chứng danh tính; chủ sở hữu luôn
  lấy từ `user.id` của token đã xác minh.
- **Không truy vấn bảng `tasks` trực tiếp ở frontend**; mọi CRUD đi qua API.
  Chỉ cập nhật giao diện là "đã lưu" sau khi API trả thành công; không giữ dữ
  liệu mock làm dự phòng khi API lỗi.
- Không dùng `localStorage` để lưu công việc.

## Tệp chính của bài 2

- `supabase/schema.sql`: bảng `tasks` + RLS (chạy trong SQL Editor, không xóa bảng để chạy lại).
- `src/lib/supabase-browser.ts` (client), `src/lib/api-client.ts` (`apiFetch`).
- `src/lib/auth-request.ts`, `src/lib/api-response.ts`: chỉ dùng phía server.
- `src/app/api/tasks/route.ts` (GET, POST), `src/app/api/tasks/[id]/route.ts` (PATCH, DELETE).
- `tests/*.spec.ts` + `playwright.config.ts`: chạy `npm run test:e2e`; không
  làm yếu assertion hay bỏ test để báo pass. Kết quả ghi ở `docs/test-results.md`.

## Bí mật và biến môi trường

- Không đọc, in hay sửa `.env.local`. Tên biến lấy từ `.env.example`.
- Không ghi mật khẩu, access token hay key vào log, README, test output hoặc
  commit. Biến test (`TEST_EMAIL_A`, `TEST_PASSWORD_A`, ...) chỉ nằm trong
  `.env.local`, không có tiền tố `NEXT_PUBLIC_`.

## Thiết kế

- Thiết kế gốc nằm trong `design/stitch/`; giữ nguyên thư mục này.
- Màu, cỡ chữ và khoảng cách lấy từ `DESIGN.md` của Stitch, đã chuyển thành
  token trong `globals.css`. Không nhúng CDN Tailwind hay script từ HTML Stitch.
- Biểu tượng dùng SVG inline trong `src/components/Icon.tsx`, không nạp font
  Material Symbols từ mạng ngoài.
- Mỗi dòng công việc giữ `data-testid="task-item"`; input phải có label;
  nút phải dùng được bằng bàn phím.

## Sau mỗi thay đổi

- Nêu rõ cách kiểm tra lại (lệnh nào, trang nào, thao tác nào).
- Chạy `npx eslint .`, `npm run typecheck`, `npm run build` trước khi kết luận
  hoàn thành. Build thành công không thay thế kiểm tra thao tác trên trình duyệt.
- Kiểm tra kiểu dùng `npm run typecheck` (chạy `next typegen` trước
  `tsc --noEmit`). Gọi thẳng `npx tsc --noEmit` khi chưa có `.next/types` sẽ báo
  lỗi giả `Cannot find name 'LayoutProps'`.
