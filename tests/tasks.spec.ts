import { expect, test } from '@playwright/test';
import {
  accountA,
  cleanupTestTasks,
  createTask,
  listTasks,
  loginViaUi,
  signIn,
  taskRow,
  uniqueTitle,
  type Session,
} from './helpers';

/*
  Kiểm thử giao diện với dữ liệu thật (tài khoản A). Không mock database.
  Mỗi test chỉ tạo công việc có tiền tố [e2e] và được dọn trong afterEach,
  kể cả khi test thất bại.
*/
let sessionA: Session;

test.beforeAll(async () => {
  sessionA = await signIn(accountA());
});

test.afterEach(async ({ request }) => {
  await cleanupTestTasks(request, sessionA.token);
});

test('T01 mở /tasks khi chưa đăng nhập thì về /login, không có dữ liệu', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('task-item')).toHaveCount(0);
});

test('T02 đăng nhập sai báo lỗi, đúng thì vào danh sách', async ({ page }) => {
  const account = accountA();
  await page.goto('/login');
  await page.getByLabel('Địa chỉ Email').fill(account.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(`${account.password}-sai`);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  // Next.js dev có sẵn một role="alert" (route announcer) nên lọc theo nội dung.
  await expect(
    page.getByRole('alert').filter({ hasText: 'Email hoặc mật khẩu không đúng.' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Mật khẩu', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole('heading', { name: 'Quản lý bài vở học tập' })).toBeVisible();
});

test('T03 thêm, sửa, hoàn thành, xóa và dữ liệu giữ đúng sau reload', async ({ page }) => {
  await loginViaUi(page, accountA());
  const title = uniqueTitle('Ôn React');
  const renamed = uniqueTitle('Ôn Next.js');

  // Thêm
  await page.getByLabel('Tên công việc').fill(title);
  await page.getByRole('button', { name: 'Thêm công việc' }).click();
  await expect(taskRow(page, title)).toHaveCount(1);
  await expect(page.getByLabel('Tên công việc')).toHaveValue('');
  await page.reload();
  await expect(taskRow(page, title)).toHaveCount(1);

  // Sửa
  await taskRow(page, title).getByRole('button', { name: 'Sửa', exact: true }).click();
  await page.getByLabel('Sửa tên công việc').fill(renamed);
  await page.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(taskRow(page, renamed)).toHaveCount(1);
  await expect(taskRow(page, title)).toHaveCount(0);

  // Hoàn thành
  const row = taskRow(page, renamed);
  await row.getByTestId('task-title').click();
  await expect(row.getByRole('checkbox')).toBeChecked();
  await page.reload();
  await expect(taskRow(page, renamed).getByRole('checkbox')).toBeChecked();
  await expect(taskRow(page, renamed)).toHaveAttribute('data-done', 'true');

  // Xóa có xác nhận
  page.once('dialog', (dialog) => dialog.accept());
  await taskRow(page, renamed).getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(taskRow(page, renamed)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Quản lý bài vở học tập' })).toBeVisible();
  await expect(page.getByText('Đang tải công việc...')).toHaveCount(0);
  await expect(taskRow(page, renamed)).toHaveCount(0);
});

test('T05 bấm Xóa rồi Hủy thì công việc vẫn còn', async ({ page, request }) => {
  const title = uniqueTitle('Không xóa');
  const task = await createTask(request, sessionA.token, title);
  await loginViaUi(page, accountA());

  page.once('dialog', (dialog) => dialog.dismiss());
  await taskRow(page, title).getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(taskRow(page, title)).toHaveCount(1);
  await page.reload();
  await expect(taskRow(page, title)).toHaveCount(1);

  const tasks = await listTasks(request, sessionA.token);
  expect(tasks.some((item) => item.id === task.id)).toBe(true);
});

test('T06 màn hình 390 px không tràn ngang và thao tác được bằng bàn phím', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginViaUi(page, accountA());

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);

  // Dùng Tab để tới ô "Tên công việc", gõ tên và nhấn Enter.
  const input = page.getByLabel('Tên công việc');
  let reached = false;
  for (let i = 0; i < 15 && !reached; i += 1) {
    await page.keyboard.press('Tab');
    reached = await input.evaluate((element) => element === document.activeElement);
  }
  expect(reached).toBe(true);

  const title = uniqueTitle('Bàn phím');
  await page.keyboard.type(title);
  await page.keyboard.press('Enter');
  await expect(taskRow(page, title)).toHaveCount(1);

  // Tab tiếp theo là nút "Thêm công việc".
  await input.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Thêm công việc' })).toBeFocused();
});

test('T07 mất mạng khi thêm việc thì báo lỗi, không báo lưu giả', async ({ page, context, request }) => {
  await loginViaUi(page, accountA());
  const title = uniqueTitle('Mất mạng');

  await context.setOffline(true);
  await page.getByLabel('Tên công việc').fill(title);
  await page.getByRole('button', { name: 'Thêm công việc' }).click();
  await expect(page.getByTestId('action-error')).toContainText('Không kết nối được máy chủ');
  await expect(taskRow(page, title)).toHaveCount(0);
  // Tên vẫn còn trong ô để người dùng thử lại.
  await expect(page.getByLabel('Tên công việc')).toHaveValue(title);
  await context.setOffline(false);

  const tasks = await listTasks(request, sessionA.token);
  expect(tasks.some((item) => item.title === title)).toBe(false);
});

test('T12 đăng xuất rồi Back/reload không hiện lại dữ liệu', async ({ page, request }) => {
  const title = uniqueTitle('Sau đăng xuất');
  await createTask(request, sessionA.token, title);
  await loginViaUi(page, accountA());
  // Thêm một mục /tasks vào lịch sử để nút Back có chỗ quay lại (app dùng
  // router.replace khi đăng nhập/đăng xuất; goto cùng URL sẽ bị trình duyệt thay thế).
  await page.goto('/tasks?from=test');
  await expect(taskRow(page, title)).toHaveCount(1);

  await page.getByRole('button', { name: 'Đăng xuất' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(title)).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(title)).toHaveCount(0);

  await page.goto('/tasks');
  await expect(page).toHaveURL(/\/login$/);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(title)).toHaveCount(0);
});
