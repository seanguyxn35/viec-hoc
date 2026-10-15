export type Task = {
  id: string;
  title: string;
  is_done: boolean;
  created_at: string;
};

export type TaskFilter = "all" | "pending" | "done";
