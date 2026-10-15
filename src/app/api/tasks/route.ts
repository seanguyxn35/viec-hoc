import { z } from 'zod';
import { authRequest } from '@/lib/auth-request';
import { json, readJson, TASK_COLUMNS, withErrors } from '@/lib/api-response';

const input = z.object({
  title: z.string().trim().min(1).max(120)
}).strict();

export const GET = withErrors(async (request: Request) => {
  const auth = await authRequest(request);
  if (!auth) return json({ error: 'Chưa đăng nhập' }, 401);
  const { data, error } = await auth.db.from('tasks')
    .select(TASK_COLUMNS)
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) return json({ error: 'Không tải được dữ liệu' }, 500);
  return json({ data });
});

export const POST = withErrors(async (request: Request) => {
  const auth = await authRequest(request);
  if (!auth) return json({ error: 'Chưa đăng nhập' }, 401);
  const parsed = input.safeParse(await readJson(request));
  if (!parsed.success)
    return json({ error: 'Tên phải có 1–120 ký tự' }, 400);
  const { data, error } = await auth.db.from('tasks')
    .insert({ title: parsed.data.title, user_id: auth.user.id })
    .select(TASK_COLUMNS).single();
  if (error) return json({ error: 'Không thêm được công việc' }, 500);
  return json({ data }, 201);
});
