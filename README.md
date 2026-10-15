# Việc học của tôi — Bài thực hành 1

Giao diện website quản lý việc học, dựng từ thiết kế Stitch bằng Next.js App
Router, TypeScript và Tailwind CSS v4.

> **Phạm vi bài 1:** chưa có database và chưa có đăng nhập thật. Mọi thao tác
> chạy trên dữ liệu tạm trong bộ nhớ trình duyệt. Tải lại trang thì danh sách
> trở về mẫu ban đầu — đây là hành vi dự kiến của bài 1, không phải lỗi.

## Trang trong dự án

| Đường dẫn | Nội dung                                                        |
| --------- | --------------------------------------------------------------- |
| `/`       | Chuyển hướng sang `/tasks`                                        |
| `/login`  | **Chỉ là giao diện** form đăng nhập. Nút Đăng nhập bị vô hiệu hóa, mật khẩu không được lưu hay gửi đi. Có liên kết "Xem giao diện công việc" sang `/tasks`. |
| `/tasks`  | Thêm, sửa, đánh dấu hoàn thành, lọc và xóa công việc bằng dữ liệu tạm |

## Chạy dự án

Yêu cầu Node.js 20.9 trở lên (bản dùng khi làm bài: Node v24.19.0, npm 11.17.0).

```bash
npm ci        # hoặc npm install nếu chưa có package-lock.json
npm run dev
```

Mở <http://localhost:3000>. Nếu cổng 3000 đang bận, dùng đúng URL mà Terminal in ra.

## Kiểm tra chất lượng

```bash
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # next build
```

Cả ba lệnh phải kết thúc không lỗi. Build thành công **không** thay thế việc
kiểm tra thao tác trên trình duyệt — xem bảng B1 trong
[docs/test-results.md](docs/test-results.md).

## Cấu trúc chính

```
design/stitch/            Thiết kế Stitch gốc (HTML, ảnh, DESIGN.md)
docs/screenshots/        Ảnh desktop/mobile của bài 1
src/app/globals.css      Design token Tailwind v4 (@theme) lấy từ DESIGN.md
src/app/layout.tsx       Font Be Vietnam Pro, metadata, lang="vi"
src/app/page.tsx         Chuyển hướng / -> /tasks
src/app/login/page.tsx   Trang /login
src/app/tasks/page.tsx   Trang /tasks
src/components/
  LoginForm.tsx          Form đăng nhập mẫu (không xác thực)
  TaskDashboard.tsx      State dữ liệu tạm + ghép các phần giao diện
  TaskForm.tsx           Ô nhập và nút Thêm, kèm kiểm tra tên 1-120 ký tự
  TaskFilters.tsx        Bộ lọc Tất cả / Chưa xong / Đã xong kèm bộ đếm
  TaskList.tsx           Danh sách, có trạng thái rỗng
  TaskItem.tsx           Một dòng công việc, có chế độ sửa nhanh tại chỗ
  AppHeader.tsx          Thanh trên cùng
  EmptyState.tsx         Trạng thái danh sách rỗng
  Icon.tsx               Biểu tượng SVG inline
src/lib/types.ts         Kiểu Task và TaskFilter
```

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
  Bài 1 chỉ có `/login` và `/tasks`; để lại liên kết chết sẽ gây hiểu nhầm.
- **Thanh trên cùng không hiển thị email người dùng** vì bài 1 chưa có đăng nhập;
  hiện email giả sẽ là thông tin bịa. Nút bên phải là liên kết về `/login`.
- **Khối "Mô phỏng các trạng thái phụ"** trong bản Stitch là phần trình bày thiết
  kế, không phải giao diện thật. Trạng thái rỗng đã được dựng thành trạng thái
  thật; trạng thái đang tải và lỗi thuộc bài 2 (khi có API).
- **Dòng đã hoàn thành vẫn giữ nút Sửa** (bản Stitch chỉ để nút Xóa), vì không
  có lý do chức năng để chặn đổi tên một việc đã xong.

## Phần bài 2

Thư mục này **chỉ gồm phạm vi bài 1**: không có Supabase, không có API và không
có kiểm thử tự động. Bản thử của bài 2 (Supabase Auth, API `/api/tasks`, RLS,
Playwright) được giữ riêng trong repository Git của dự án ở nhánh
`bai-2-da-lam`, không nằm trong bản nộp này.
