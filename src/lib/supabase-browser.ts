import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Supabase client dùng chung phía trình duyệt.
  Chỉ dùng publishable key (giá trị công khai); dữ liệu được bảo vệ bằng Auth + RLS.
  Phải viết đầy đủ process.env.NEXT_PUBLIC_... để Next.js thay giá trị lúc build.
*/
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export class MissingSupabaseConfigError extends Error {
  constructor() {
    super(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
    this.name = "MissingSupabaseConfigError";
  }
}

let client: SupabaseClient | null = null;

/** Tạo client ở lần gọi đầu tiên để trang vẫn build được khi chưa khai báo biến. */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new MissingSupabaseConfigError();
  }
  client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
