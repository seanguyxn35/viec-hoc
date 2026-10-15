import { z } from 'zod';
import { authRequest } from '@/lib/auth-request';
import { json, readJson, TASK_COLUMNS, withErrors } from '@/lib/api-response';

const idSchema = z.uuid();

// Chỉ cho sửa title hoặc is_done; cấm field lạ (kể cả user_id) và body rỗng.
const patchInput = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  is_done: z.boolean().optional()
}).strict().refine(
  (value) => value.title !== undefined || value.is_done !== undefined,
  { message: 'Cần title hoặc is_done' }
);

export const PATCH = withErrors(async (
  request: Request,
  ctx: RouteContext<'/api/tasks/[id]'>
) => {
  const auth = await authRequest(request);
  if (!auth) return json({ error: 'Chưa đăng nhập' }, 401);
  const id = idSchema.safeParse((await ctx.params).id);
  if (!id.success) return json({ error: 'Mã công việc không hợp lệ' }, 400);
  const parsed = patchInput.safeParse(await readJson(request));
  if (!parsed.success) {
    return json(
      { error: 'Chỉ được sửa tên (1–120 ký tự) hoặc trạng thái hoàn thành' },
      400
    );
  }
  const { data, error } = await auth.db.from('tasks')
    .update(parsed.data)
    .eq('id', id.data)
    .eq('user_id', auth.user.id)
    .select(TASK_COLUMNS)
    .maybeSingle();
  if (error) return json({ error: 'Không sửa được công việc' }, 500);
  if (!data) return json({ error: 'Không tìm thấy công việc' }, 404);
  return json({ data });
});

export const DELETE = withErrors(async (
  request: Request,
  ctx: RouteContext<'/api/tasks/[id]'>
) => {
  const auth = await authRequest(request);
  if (!auth) return json({ error: 'Chưa đăng nhập' }, 401);
  const id = idSchema.safeParse((await ctx.params).id);
  if (!id.success) return json({ error: 'Mã công việc không hợp lệ' }, 400);
  const { data, error } = await auth.db.from('tasks')
    .delete()
    .eq('id', id.data)
    .eq('user_id', auth.user.id)
    .select('id');
  if (error) return json({ error: 'Không xóa được công việc' }, 500);
  if (!data || data.length === 0)
    return json({ error: 'Không tìm thấy công việc' }, 404);
  return json({ data: { id: data[0].id } });
});
