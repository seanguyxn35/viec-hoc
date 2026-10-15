import { expect, test } from '@playwright/test';
import {
  accountA,
  bearer,
  cleanupTestTasks,
  createTask,
  listTasks,
  signIn,
  uniqueTitle,
  type ApiTask,
  type Session,
} from './helpers';

/*
  Kiểm thử API trực tiếp (không qua giao diện): xác thực và kiểm tra đầu vào.
*/
const SOME_UUID = '00000000-0000-4000-8000-000000000000';
let sessionA: Session;
let task: ApiTask;

test.beforeAll(async ({ request }) => {
  sessionA = await signIn(accountA());
  task = await createTask(request, sessionA.token, uniqueTitle('API'));
});

test.afterAll(async ({ request }) => {
  await cleanupTestTasks(request, sessionA.token);
});

test('T08 thiếu token hoặc token sai trả 401 cho cả 4 phương thức', async ({ request }) => {
  const badHeaders: Record<string, string>[] = [
    {},
    { Authorization: 'Bearer token-khong-hop-le' },
    { Authorization: 'Basic abc' },
  ];
  for (const headers of badHeaders) {
    const responses = await Promise.all([
      request.get('/api/tasks', { headers }),
      request.post('/api/tasks', { headers, data: { title: 'x' } }),
      request.patch(`/api/tasks/${task.id}`, { headers, data: { is_done: true } }),
      request.delete(`/api/tasks/${task.id}`, { headers }),
    ]);
    for (const response of responses) {
      expect(response.status()).toBe(401);
      expect(await response.json()).toEqual({ error: 'Chưa đăng nhập' });
    }
  }
  // Các request không hợp lệ không làm đổi dữ liệu.
  const after = (await listTasks(request, sessionA.token)).find((item) => item.id === task.id);
  expect(after).toEqual(task);
});

test('T04 tên rỗng, chỉ dấu cách hoặc 121 ký tự trả 400 và không tạo dòng', async ({ request }) => {
  const before = await listTasks(request, sessionA.token);
  const invalidBodies: unknown[] = [
    { title: '' },
    { title: '     ' },
    { title: 'a'.repeat(121) },
    { title: 123 },
    {},
    { title: 'Hợp lệ', user_id: SOME_UUID },
  ];
  for (const data of invalidBodies) {
    const response = await request.post('/api/tasks', { headers: bearer(sessionA.token), data });
    expect(response.status(), JSON.stringify(data)).toBe(400);
  }
  const malformed = await request.post('/api/tasks', {
    headers: { ...bearer(sessionA.token), 'Content-Type': 'application/json' },
    data: '{"title":',
  });
  expect(malformed.status()).toBe(400);

  const after = await listTasks(request, sessionA.token);
  expect(after.length).toBe(before.length);
});

test('POST đúng 120 ký tự sau trim thì tạo được, trả 201', async ({ request }) => {
  const title = `${uniqueTitle('Biên')} `.padEnd(120, 'x');
  expect(title.length).toBe(120);
  const response = await request.post('/api/tasks', {
    headers: bearer(sessionA.token),
    data: { title: `  ${title}  ` },
  });
  expect(response.status()).toBe(201);
  expect((await response.json()).data.title).toBe(title);
});

test('PATCH chặn body rỗng, field lạ, user_id và id sai định dạng', async ({ request }) => {
  const headers = bearer(sessionA.token);
  const invalidBodies: unknown[] = [
    {},
    { foo: 1 },
    { user_id: SOME_UUID },
    { is_done: true, user_id: SOME_UUID },
    { title: '   ' },
    { title: 'a'.repeat(121) },
    { is_done: 'true' },
  ];
  for (const data of invalidBodies) {
    const response = await request.patch(`/api/tasks/${task.id}`, { headers, data });
    expect(response.status(), JSON.stringify(data)).toBe(400);
  }

  const badId = await request.patch('/api/tasks/khong-phai-uuid', {
    headers,
    data: { is_done: true },
  });
  expect(badId.status()).toBe(400);
  const badIdDelete = await request.delete('/api/tasks/khong-phai-uuid', { headers });
  expect(badIdDelete.status()).toBe(400);

  const missing = await request.patch(`/api/tasks/${SOME_UUID}`, {
    headers,
    data: { is_done: true },
  });
  expect(missing.status()).toBe(404);

  const after = (await listTasks(request, sessionA.token)).find((item) => item.id === task.id);
  expect(after).toEqual(task);
});

test('PATCH/DELETE hợp lệ trả 200 theo hợp đồng API', async ({ request }) => {
  const headers = bearer(sessionA.token);
  const own = await createTask(request, sessionA.token, uniqueTitle('Hợp đồng'));

  const patched = await request.patch(`/api/tasks/${own.id}`, {
    headers,
    data: { is_done: true },
  });
  expect(patched.status()).toBe(200);
  expect((await patched.json()).data).toMatchObject({ id: own.id, is_done: true });
  expect(patched.headers()['cache-control']).toBe('no-store');

  const deleted = await request.delete(`/api/tasks/${own.id}`, { headers });
  expect(deleted.status()).toBe(200);
  expect(await deleted.json()).toEqual({ data: { id: own.id } });

  const again = await request.delete(`/api/tasks/${own.id}`, { headers });
  expect(again.status()).toBe(404);
});
