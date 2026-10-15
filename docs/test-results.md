# Kết quả tự kiểm tra — Bài thực hành 1

- Ngày chạy: 05/10/2026
- Môi trường: Windows 11, Node v24.19.0, npm 11.17.0, Next.js 16.3.8,
  React 19.2.8, Tailwind CSS 4.3.3
- Cách chạy: `npm run dev`, kiểm tra bằng Chromium ở 1280×900 và 390×844

## Bảng B1

| Mã    | Việc tự kiểm tra            | Đạt khi                                        | Kết quả thực tế                                                                                     |
| ----- | --------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| B1 01 | Mở `/login` và `/tasks`     | Không có lỗi trang, ảnh và chữ hiển thị đúng   | Đạt. Hai trang mở bình thường, không có lỗi JavaScript trên console. Liên kết "Xem giao diện công việc" sang `/tasks` chạy đúng. |
| B1 02 | So sánh với Stitch          | Bố cục, màu, font và khoảng cách hợp lý        | Đạt. Font `Be Vietnam Pro`; nền `#faf8ff`; nút Thêm `#2563eb`; tiêu đề `headline-lg` 32px. Không nạp tài nguyên từ CDN ngoài. |
| B1 03 | Thêm, sửa, lọc, hoàn thành, xóa | Từng thao tác thay đổi đúng giao diện      | Đạt. Thêm "Đọc bài React" → sửa thành "Ôn Next.js" → tích hoàn thành (bộ đếm 5/3/2) → lọc Chưa xong ẩn, Đã xong hiện → Xóa rồi Hủy giữ nguyên dòng, Xóa và xác nhận thì dòng biến mất. |
| B1 04 | Tên rỗng và chỉ dấu cách    | Báo lỗi, không thêm dòng                       | Đạt. `"   "` → "Tên công việc không được để trống."; 121 ký tự → "Tên công việc tối đa 120 ký tự (đang 121)." Số dòng không đổi. |
| B1 05 | Màn hình 390 px và phím Tab | Không tràn ngang, thấy vị trí focus            | Đạt. `scrollWidth - clientWidth = 0px` ở 390 px. Tab từ ô nhập tới nút "Thêm công việc", Enter thêm được việc. Viền focus dùng `outline 2px` màu primary. |
| B1 06 | Lint, typecheck và build    | Cả ba lệnh kết thúc không lỗi                  | Đạt. `npx eslint .` exit 0; `npx tsc --noEmit` exit 0; `npm run build` thành công (`/`, `/login`, `/tasks` đều prerender tĩnh). |

## Kiểm tra thêm ngoài bảng

| Nội dung                                                     | Kết quả                                                                 |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Nút Đăng nhập không tạo xác thực giả                          | Đạt. Nút ở trạng thái `disabled`, trang ghi rõ bài 1 chưa có tài khoản thật. |
| Mật khẩu không bị lưu lại                                     | Đạt. Gõ mật khẩu, rời trang rồi quay lại: ô mật khẩu trống (input không controlled, không có state). |
| Tải lại trang thì dữ liệu về mẫu                              | Đạt, đúng giới hạn đã biết của bài 1 (4 việc mẫu).                       |
| Trạng thái danh sách rỗng                                     | Đạt. Xóa hết việc thì hiện "Chưa có công việc nào".                       |

## Ảnh chụp màn hình

| Tệp                                  | Nội dung                        |
| ------------------------------------ | ------------------------------- |
| `screenshots/login-desktop.png`      | `/login` ở 1280 px              |
| `screenshots/login-mobile.png`       | `/login` ở 390 px               |
| `screenshots/tasks-desktop.png`      | `/tasks` ở 1280 px              |
| `screenshots/tasks-mobile.png`       | `/tasks` ở 390 px               |
| `screenshots/tasks-empty.png`        | Trạng thái danh sách rỗng       |

## Giới hạn đã biết của bài 1

- Chưa có database: dữ liệu không tồn tại sau khi tải lại trang.
- Chưa có đăng nhập thật: `/tasks` mở được mà không cần xác thực.
- Chưa có trạng thái "đang tải" và "lỗi" thật vì chưa gọi API.

Ba điểm trên thuộc phạm vi bài 2.

## Câu hỏi kiểm tra hiểu bài

1. **Vì sao reload làm mất thay đổi ở bài 1?**
   Danh sách được giữ trong React state của `TaskDashboard`, tức là bộ nhớ của
   trang đang mở. Reload dựng lại cây component từ đầu nên state quay về giá trị
   khởi tạo `SAMPLE_TASKS`. Không có nơi nào lưu lâu dài (không database, không
   `localStorage`).

2. **`page.tsx` khác `TaskItem` như thế nào?**
   `page.tsx` là một route: Next.js dựa vào vị trí tệp trong `src/app` để quyết
   định URL nào hiển thị nó (`src/app/tasks/page.tsx` → `/tasks`). `TaskItem` là
   một component thường, không gắn với URL nào, dùng để hiển thị **một** dòng
   công việc và được `TaskList` lặp lại nhiều lần.

3. **Tại sao form đăng nhập hiện tại chưa phải đăng nhập thật?**
   Form chỉ vẽ ra ô nhập. Không có bước nào kiểm tra email/mật khẩu với một hệ
   thống tài khoản, không cấp token, và `/tasks` không hề kiểm tra xem người dùng
   đã đăng nhập hay chưa — ai mở thẳng `/tasks` cũng vào được. Vì vậy nút Đăng
   nhập được để `disabled` thay vì cho bấm rồi chuyển trang, tránh tạo cảm giác
   đã xác thực. Bài 2 sẽ thay bằng Supabase Auth.
