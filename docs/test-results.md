# Kết quả tự kiểm tra — Bài thực hành 1

Phần bài 2 (T01–T12, Playwright) nằm ở [cuối tệp](#kết-quả-kiểm-thử--bài-thực-hành-2).

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

---

# Kết quả kiểm thử — Bài thực hành 2

- Ngày chạy: 15/10/2026
- Môi trường: Windows 11, Node v24.20.0, npm 11.19.0, Next.js 16.3.8,
  React 19.2.8, Tailwind CSS 4.3.3, @supabase/supabase-js 2.117.3, Zod 4.6.7,
  Playwright 1.64.1 (Chromium)
- Database: project Supabase thử nghiệm, bảng `tasks` tạo từ `supabase/schema.sql`
  (RLS bật, 4 chính sách). Hai tài khoản thử A và B, dữ liệu giả.
- Cách chạy: `npx playwright test --project=chromium` (tự chạy `npm run dev` tại
  `http://localhost:3000`). Không mock database: mọi test đọc/ghi Supabase thật.

## Kiểm tra code

| Lệnh                 | Kết quả                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| `npx eslint .`       | Đạt, exit 0                                                                  |
| `npm run typecheck`  | Đạt (`next typegen` + `tsc --noEmit`)                                        |
| `npm run build`      | Đạt. `/login`, `/tasks` tĩnh; `/api/tasks`, `/api/tasks/[id]` động           |
| Playwright           | **16 passed, 0 failed** (3,5 phút). Báo cáo: `npx playwright show-report`    |

## Bảng T01–T12 (bản local)

| Mã  | Thử điều gì                              | Kết quả phải đạt                    | Kết quả thực tế | Bằng chứng (test Playwright)                                                                 |
| --- | ---------------------------------------- | ----------------------------------- | --------------- | -------------------------------------------------------------------------------------------- |
| T01 | Mở `/tasks` chưa đăng nhập               | Không có dữ liệu; về `/login`       | Đạt             | `tasks.spec.ts` › T01: URL về `/login`, 0 dòng `task-item`                                   |
| T02 | Đăng nhập sai rồi đúng                   | Sai báo lỗi, đúng vào danh sách     | Đạt             | `tasks.spec.ts` › T02: hiện "Email hoặc mật khẩu không đúng.", sau đó vào `/tasks`           |
| T03 | CRUD và reload                           | Dữ liệu giữ đúng sau reload         | Đạt             | `tasks.spec.ts` › T03: thêm → reload còn → sửa → hoàn thành → reload vẫn tích → xóa → reload mất |
| T04 | Tên rỗng, dấu cách, 121 ký tự            | API trả 400, không tạo dòng         | Đạt             | `api.spec.ts` › T04: 7 body sai (kể cả JSON hỏng, có `user_id`) đều 400, số dòng không đổi; 120 ký tự → 201 |
| T05 | Xóa rồi Hủy                              | Dòng vẫn còn                        | Đạt             | `tasks.spec.ts` › T05: dismiss hộp xác nhận, dòng còn sau reload và còn trong API            |
| T06 | 390 px và phím Tab                       | Không tràn; thao tác được           | Đạt             | `tasks.spec.ts` › T06: `scrollWidth - clientWidth = 0`; Tab tới ô nhập, Enter thêm được việc, Tab tiếp tới nút Thêm |
| T07 | Tắt mạng và thêm việc                    | Báo lỗi; không báo lưu giả          | Đạt             | `tasks.spec.ts` › T07: `setOffline(true)` → "Không kết nối được máy chủ…", không có dòng mới, tên vẫn trong ô; API xác nhận không có dòng |
| T08 | API thiếu token hoặc token sai           | 401                                 | Đạt             | `api.spec.ts` › T08: không token / `Bearer` sai / `Basic` → 401 cho GET, POST, PATCH, DELETE |
| T09 | A tạo việc, B đọc danh sách              | B không thấy việc của A             | Đạt             | `authorization.spec.ts` › T09                                                                |
| T10 | B sửa/xóa id thuộc A qua API             | 404 và dữ liệu A không đổi          | Đạt             | `authorization.spec.ts` › T10: PATCH title, PATCH is_done, DELETE → 404; A đọc lại y nguyên  |
| T11 | B ghi `user_id=A` trực tiếp vào Supabase | RLS chặn; không tạo được dòng       | Đạt             | `authorization.spec.ts` › T11: dùng publishable key + token B, SELECT/UPDATE/DELETE dòng A trả 0 dòng; INSERT `user_id=A` lỗi `42501`; khách không token đọc 0 dòng |
| T12 | Đăng xuất rồi Back/reload                | Không hiện lại dữ liệu đã đăng xuất | Đạt             | `tasks.spec.ts` › T12: sau Đăng xuất, Back / mở `/tasks` / reload đều về `/login`, không thấy tên việc |

Kiểm thử bổ sung ngoài bảng: PATCH body rỗng, field lạ, `user_id`, `is_done`
không phải boolean và id không phải UUID đều 400; id không tồn tại 404;
PATCH/DELETE hợp lệ trả 200 đúng hợp đồng, có `Cache-Control: no-store`;
B không chuyển được dòng của chính mình sang `user_id` của A (`42501`).

Sau khi chạy test, kiểm tra lại bằng tài khoản A và B: không còn dòng nào có tiền
tố `[e2e]` (test chỉ dọn dữ liệu do test tạo, kể cả khi thất bại).

## Lỗi tìm thấy khi kiểm thử và cách sửa

| Hiện tượng | Nguyên nhân | Sửa |
| ---------- | ----------- | --- |
| Khi mạng tới Supabase lỗi, API trả 401 "Chưa đăng nhập" dù token đúng, frontend đá người dùng về `/login` | `authRequest` coi mọi lỗi của `getUser` là token sai | Chỉ trả `null` (401) khi Supabase từ chối token (`isAuthApiError`); lỗi kết nối ném ra để route trả 500 |
| `signOut()` đăng xuất mọi thiết bị của tài khoản | Mặc định của supabase-js là `scope: "global"` | Dùng `signOut({ scope: "local" })`: chỉ đăng xuất phiên trên thiết bị đang dùng |

## Ghi chú môi trường

Mạng từ máy chạy test tới Supabase chậm và chập chờn (mỗi request 2–15 giây,
khoảng 3/10 request bị timeout khi đo bằng curl). Vì vậy `playwright.config.ts`
đặt thời gian chờ dài hơn mặc định và bước đăng nhập chuẩn bị của test được thử
lại khi gặp lỗi mạng. Không có assertion nào bị nới lỏng; lần chạy cuối 16/16 đạt
mà không cần chạy lại test.

## Bản online (Vercel)

Chưa kiểm tra — điền sau khi deploy: URL, ngày kiểm thử, kết quả chạy lại
`PLAYWRIGHT_BASE_URL=<url> npx playwright test --project=chromium`.

## Câu hỏi chứng minh hiểu bài

1. **Dữ liệu nằm ở đâu sau khi tắt máy phát triển?**
   Trong bảng `public.tasks` của PostgreSQL trên Supabase. Máy dev chỉ chạy
   Next.js; tắt máy thì localhost ngừng nhưng dữ liệu vẫn còn ở Supabase, và
   bản Vercel đọc cùng database đó.

2. **Vì sao backend không nhận `user_id` từ form để xác định chủ sở hữu?**
   Body request do trình duyệt gửi, ai cũng sửa được bằng DevTools hoặc curl.
   Nếu tin `user_id` từ form, B chỉ cần gửi `user_id` của A để ghi vào dữ liệu
   của A. Backend lấy `user.id` từ token đã được Supabase xác minh, và Zod
   `.strict()` từ chối luôn body có `user_id`.

3. **RLS khác ẩn nút Sửa như thế nào?**
   Ẩn nút chỉ là giao diện; người dùng vẫn tự gửi request được. RLS là quy tắc
   trong database, kiểm tra `auth.uid() = user_id` cho từng dòng ở mọi truy vấn,
   kể cả khi gọi thẳng Supabase không qua API (T11).

4. **Vì sao `getSession` phía trình duyệt chưa đủ để API tin người dùng?**
   `getSession` chỉ đọc phiên đang lưu trong trình duyệt, không hỏi lại máy chủ;
   dữ liệu đó có thể bị sửa hoặc đã hết hạn/bị thu hồi. API nhận token từ bên
   ngoài nên phải gọi `getUser(token)` để Supabase xác minh token còn hợp lệ.

5. **Vì sao `npm run build` thành công chưa chứng minh phân quyền đúng?**
   Build chỉ kiểm tra code biên dịch và đóng gói được. Phân quyền phụ thuộc lúc
   chạy: token, chính sách RLS trong database, điều kiện `.eq("user_id", …)`.
   Chỉ kiểm thử với hai tài khoản thật (T08–T11) mới chứng minh được.

6. **Sau khi đổi env trên Vercel cần làm gì?**
   Redeploy. Biến `NEXT_PUBLIC_` được gắn cứng vào JavaScript lúc build, nên bản
   đang chạy không tự nhận giá trị mới.
