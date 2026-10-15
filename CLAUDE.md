@AGENTS.md

# Quy tắc dự án "Việc học của tôi"

Dự án thực hành IE104. Hiện đang ở **bài thực hành 1**: chỉ dựng giao diện,
dữ liệu là tạm trong state. Giữ nguyên các quy tắc dưới đây giữa các phiên.

## Kiến trúc

- Next.js App Router (`src/app`), TypeScript, Tailwind CSS v4. Dùng đúng
  dependency đã cài, không thêm thư viện mới mà không có lý do.
- Tailwind v4 khai báo design token bằng `@theme` trong `src/app/globals.css`.
  Không tạo `tailwind.config.js`.
- Component có tương tác phải khai báo `"use client"`.

## Phạm vi bài 1 (quan trọng)

- **Chưa có database, chưa có đăng nhập thật.** Dữ liệu nằm trong React state
  của `TaskDashboard`; tải lại trang thì về danh sách mẫu. Đây là hành vi dự kiến.
- **Không biến form login mẫu thành xác thực giả.** Nút Đăng nhập đang bị vô
  hiệu hóa và trang nói rõ điều đó. Không lưu hay gửi mật khẩu đi đâu.
- Không dùng `localStorage` và chưa gọi API ở bài này.
- Supabase, API `/api/tasks`, RLS và Playwright thuộc bài 2. Phần đã làm thử
  được giữ ở nhánh `bai-2-da-lam`, không trộn vào `master`.

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
- Chạy `npx eslint .`, `npx tsc --noEmit`, `npm run build` trước khi kết luận
  hoàn thành. Build thành công không thay thế kiểm tra thao tác trên trình duyệt.
