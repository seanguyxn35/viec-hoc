import { getSupabase } from "./supabase-browser";

/*
  Gọi API cùng origin (/api/...) kèm access token của phiên hiện tại.
  Không truy vấn bảng tasks trực tiếp từ trình duyệt: mọi CRUD đi qua API.
*/
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body }: ApiOptions = {},
): Promise<T> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  if (!session) {
    throw new ApiError(401, "Phiên đăng nhập đã hết, vui lòng đăng nhập lại.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Không kết nối được máy chủ. Kiểm tra mạng và thử lại.");
  }

  const payload: { data?: T; error?: string } | null = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(401, "Phiên đăng nhập đã hết, vui lòng đăng nhập lại.");
    }
    throw new ApiError(
      response.status,
      payload?.error ?? "Có lỗi xảy ra, vui lòng thử lại.",
    );
  }
  if (!payload || !("data" in payload)) {
    throw new ApiError(response.status, "Máy chủ trả dữ liệu không hợp lệ.");
  }
  return payload.data as T;
}
