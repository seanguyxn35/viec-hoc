import { createClient } from '@supabase/supabase-js';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

/*
  Tiện ích cho kiểm thử. Đọc cấu hình từ .env.local (đã nạp trong playwright.config.ts).
  Không in mật khẩu hay token ra log.
*/
export const TEST_PREFIX = '[e2e]';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu biến ${name} trong .env.local (xem .env.example).`);
  }
  return value;
}

export type Account = { email: string; password: string };

export const accountA = (): Account => ({
  email: requireEnv('TEST_EMAIL_A'),
  password: requireEnv('TEST_PASSWORD_A'),
});

export const accountB = (): Account => ({
  email: requireEnv('TEST_EMAIL_B'),
  password: requireEnv('TEST_PASSWORD_B'),
});

/** Supabase client như trình duyệt: publishable key, có thể gắn token người dùng. */
export function supabaseAs(token?: string) {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    },
  );
}

export type Session = { token: string; userId: string };

/**
  Đăng nhập lấy token cho bước chuẩn bị test. Chỉ thử lại khi lỗi mạng
  (không có HTTP status); sai mật khẩu hay lỗi khác thì báo ngay.
*/
export async function signIn(account: Account, attempts = 3): Promise<Session> {
  let lastError = 'không có phiên';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const { data, error } = await supabaseAs().auth.signInWithPassword(account);
    if (!error && data.session) {
      return { token: data.session.access_token, userId: data.user.id };
    }
    lastError = error ? `${error.name}${error.code ? `/${error.code}` : ''}` : lastError;
    if (error?.status) break;
  }
  throw new Error(`Không đăng nhập được tài khoản thử ${account.email} (${lastError}).`);
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export function uniqueTitle(label: string): string {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${TEST_PREFIX} ${label} ${suffix}`;
}

export type ApiTask = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
};

export async function listTasks(
  request: APIRequestContext,
  token: string,
): Promise<ApiTask[]> {
  const response = await request.get('/api/tasks', { headers: bearer(token) });
  expect(response.status()).toBe(200);
  return (await response.json()).data;
}

export async function createTask(
  request: APIRequestContext,
  token: string,
  title: string,
): Promise<ApiTask> {
  const response = await request.post('/api/tasks', {
    headers: bearer(token),
    data: { title },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data;
}

/** Chỉ dọn dữ liệu do test tạo (tiêu đề bắt đầu bằng TEST_PREFIX). */
export async function cleanupTestTasks(
  request: APIRequestContext,
  token: string,
): Promise<void> {
  const tasks = await listTasks(request, token);
  for (const task of tasks) {
    if (task.title.startsWith(TEST_PREFIX)) {
      await request.delete(`/api/tasks/${task.id}`, { headers: bearer(token) });
    }
  }
}

export async function loginViaUi(page: Page, account: Account): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Địa chỉ Email').fill(account.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(
    page.getByRole('heading', { name: 'Quản lý bài vở học tập' }),
  ).toBeVisible();
  // Chờ danh sách tải xong (hết trạng thái "Đang tải công việc...").
  await expect(page.getByText('Đang tải công việc...')).toHaveCount(0);
}

export function taskRow(page: Page, title: string) {
  return page.getByTestId('task-item').filter({ hasText: title });
}
