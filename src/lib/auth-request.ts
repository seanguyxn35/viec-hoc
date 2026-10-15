import { createClient, isAuthApiError } from '@supabase/supabase-js';

/*
  Tệp phía server: không import vào component chạy trên trình duyệt.
  Xác minh access token của người gọi API rồi trả về Supabase client gắn token đó,
  để mọi truy vấn vẫn chịu RLS. Không dùng service_role, không log token.
*/
export async function authRequest(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
  const { data, error } = await db.auth.getUser(token);
  // Supabase từ chối token (sai/hết hạn) -> null (401). Lỗi kết nối tới Supabase
  // không có nghĩa là token sai: ném lỗi để route trả 500, không đá người dùng ra.
  if (error && !isAuthApiError(error)) throw error;
  if (error || !data.user) return null;
  return { db, user: data.user };
}
