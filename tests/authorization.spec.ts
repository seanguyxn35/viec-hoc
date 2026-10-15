import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  accountA,
  accountB,
  bearer,
  cleanupTestTasks,
  createTask,
  listTasks,
  signIn,
  supabaseAs,
  uniqueTitle,
  type ApiTask,
  type Session,
} from './helpers';

/*
  Phân quyền giữa hai tài khoản thử A và B.
  T09–T10 đi qua API; T11 gọi thẳng Supabase bằng publishable key + token B
  để chứng minh RLS chặn ở tầng database (không dùng service_role hay SQL Editor).
*/
let sessionA: Session;
let sessionB: Session;
let taskA: ApiTask;

test.beforeAll(async ({ request }) => {
  sessionA = await signIn(accountA());
  sessionB = await signIn(accountB());
  expect(sessionA.userId).not.toBe(sessionB.userId);
  taskA = await createTask(request, sessionA.token, uniqueTitle('Của A'));
});

test.afterAll(async ({ request }) => {
  await cleanupTestTasks(request, sessionA.token);
  await cleanupTestTasks(request, sessionB.token);
});

async function expectTaskAUnchanged(request: APIRequestContext) {
  const current = (await listTasks(request, sessionA.token)).find(
    (item) => item.id === taskA.id,
  );
  expect(current).toEqual(taskA);
}

test('T09 A tạo việc, B đọc danh sách không thấy việc của A', async ({ request }) => {
  const tasksB = await listTasks(request, sessionB.token);
  expect(tasksB.some((item) => item.id === taskA.id)).toBe(false);
  expect(tasksB.some((item) => item.title === taskA.title)).toBe(false);
});

test('T10 B sửa/xóa id thuộc A qua API thì nhận 404 và dữ liệu A không đổi', async ({ request }) => {
  const headers = bearer(sessionB.token);
  const rename = await request.patch(`/api/tasks/${taskA.id}`, {
    headers,
    data: { title: 'B đã sửa' },
  });
  expect(rename.status()).toBe(404);

  const toggle = await request.patch(`/api/tasks/${taskA.id}`, {
    headers,
    data: { is_done: true },
  });
  expect(toggle.status()).toBe(404);

  const remove = await request.delete(`/api/tasks/${taskA.id}`, { headers });
  expect(remove.status()).toBe(404);

  await expectTaskAUnchanged(request);
});

test('T11 B gọi thẳng Supabase: RLS chặn đọc/sửa/xóa dòng A và chặn giả chủ sở hữu', async ({ request }) => {
  const dbB = supabaseAs(sessionB.token);

  const read = await dbB.from('tasks').select('id').eq('id', taskA.id);
  expect(read.error).toBeNull();
  expect(read.data).toEqual([]);

  const update = await dbB
    .from('tasks')
    .update({ title: 'B sửa trực tiếp', is_done: true })
    .eq('id', taskA.id)
    .select('id');
  expect(update.error).toBeNull();
  expect(update.data).toEqual([]);

  const remove = await dbB.from('tasks').delete().eq('id', taskA.id).select('id');
  expect(remove.error).toBeNull();
  expect(remove.data).toEqual([]);

  const forgedTitle = uniqueTitle('B giả A');
  const insert = await dbB
    .from('tasks')
    .insert({ title: forgedTitle, user_id: sessionA.userId })
    .select('id');
  expect(insert.error?.code).toBe('42501');
  expect(insert.data).toBeNull();

  // Không có dòng nào được tạo dưới tên A, dòng của A còn nguyên.
  const tasksA = await listTasks(request, sessionA.token);
  expect(tasksA.some((item) => item.title === forgedTitle)).toBe(false);
  await expectTaskAUnchanged(request);

  // Khách chưa đăng nhập (chỉ có publishable key) cũng không đọc được.
  const anon = await supabaseAs().from('tasks').select('id').eq('id', taskA.id);
  expect(anon.data ?? []).toEqual([]);
});

test('B không chuyển được dòng của chính B sang user_id của A', async ({ request }) => {
  const own = await createTask(request, sessionB.token, uniqueTitle('Của B'));
  const moved = await supabaseAs(sessionB.token)
    .from('tasks')
    .update({ user_id: sessionA.userId })
    .eq('id', own.id)
    .select('id');
  expect(moved.error?.code).toBe('42501');

  const tasksA = await listTasks(request, sessionA.token);
  expect(tasksA.some((item) => item.id === own.id)).toBe(false);
});
