/*
  Tiện ích dùng chung cho các route /api/tasks (chỉ chạy phía server).
*/
export const TASK_COLUMNS = "id,title,is_done,created_at";

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Đọc JSON body; body hỏng hoặc trống trả về null để route báo 400. */
export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

/**
  Bọc route handler: mọi exception chưa xử lý trả JSON 500 chung,
  không lộ chi tiết lỗi nội bộ hay token ra ngoài.
*/
export function withErrors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch {
      return json({ error: "Lỗi máy chủ, vui lòng thử lại" }, 500);
    }
  };
}
