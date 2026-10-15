"use client";

import { useCallback, useMemo, useState } from "react";
import AppHeader from "./AppHeader";
import Icon from "./Icon";
import TaskFilters from "./TaskFilters";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import type { Task, TaskFilter } from "@/lib/types";

/*
  BÀI 1: dữ liệu nằm trong state của component, không gọi API và không
  lưu localStorage. Tải lại trang thì danh sách trở về mẫu ban đầu —
  đây là hành vi dự kiến, bài 2 sẽ thay bằng dữ liệu thật trong Supabase.
*/
const SAMPLE_TASKS: Task[] = [
  {
    id: "mau-1",
    title: "Ôn tập chương 3 Giải tích toán học",
    is_done: false,
    created_at: "2026-10-05T04:00:00.000Z",
  },
  {
    id: "mau-2",
    title: "Học 30 từ vựng tiếng Anh bài Đọc hiểu",
    is_done: false,
    created_at: "2026-10-05T03:00:00.000Z",
  },
  {
    id: "mau-3",
    title: "Soạn đề cương Lịch sử Việt Nam giai đoạn 1945 - 1954",
    is_done: false,
    created_at: "2026-10-05T02:00:00.000Z",
  },
  {
    id: "mau-4",
    title: "Đọc trước tài liệu môn Sinh học",
    is_done: true,
    created_at: "2026-10-05T01:00:00.000Z",
  },
];

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [filter, setFilter] = useState<TaskFilter>("all");

  const handleAdd = useCallback(async (title: string) => {
    setTasks((previous) => [
      {
        id: newId(),
        title,
        is_done: false,
        created_at: new Date().toISOString(),
      },
      ...previous,
    ]);
    return true;
  }, []);

  const handleToggle = useCallback(async (task: Task, nextDone: boolean) => {
    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id ? { ...item, is_done: nextDone } : item,
      ),
    );
  }, []);

  const handleRename = useCallback(async (task: Task, nextTitle: string) => {
    setTasks((previous) =>
      previous.map((item) =>
        item.id === task.id ? { ...item, title: nextTitle } : item,
      ),
    );
    return true;
  }, []);

  const handleDelete = useCallback(async (task: Task) => {
    const confirmed = window.confirm(`Xóa công việc "${task.title}"?`);
    if (!confirmed) return;
    setTasks((previous) => previous.filter((item) => item.id !== task.id));
  }, []);

  const counts = useMemo<Record<TaskFilter, number>>(() => {
    const done = tasks.filter((task) => task.is_done).length;
    return { all: tasks.length, pending: tasks.length - done, done };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((task) => !task.is_done);
    if (filter === "done") return tasks.filter((task) => task.is_done);
    return tasks;
  }, [tasks, filter]);

  return (
    <>
      <AppHeader />

      <main className="w-full flex-1 pt-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg px-gutter-mobile py-space-lg md:px-margin">
          <header className="flex flex-col items-start justify-between gap-space-md pb-space-xs sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-space-xs text-label-sm uppercase tracking-wide text-primary">
                <Icon name="school" size={16} />
                <span>Không gian học tập cá nhân</span>
              </div>
              <h1 className="mt-space-xs text-headline-lg-mobile tracking-tight text-on-surface sm:text-headline-lg">
                Quản lý bài vở học tập
              </h1>
            </div>
          </header>

          <p className="flex items-start gap-space-xs rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm text-on-surface-variant">
            <span className="mt-0.5 shrink-0 text-primary">
              <Icon name="error_outline" size={18} />
            </span>
            <span>
              Dữ liệu ở bài 1 là tạm trong bộ nhớ trình duyệt. Tải lại trang thì
              danh sách trở về mẫu ban đầu.
            </span>
          </p>

          <TaskForm onAdd={handleAdd} submitting={false} />

          <TaskFilters value={filter} counts={counts} onChange={setFilter} />

          <TaskList
            tasks={visibleTasks}
            filter={filter}
            busyIds={EMPTY_BUSY}
            onToggle={handleToggle}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <footer className="mt-auto w-full bg-surface-container-low py-space-lg">
        <div className="mx-auto max-w-7xl px-gutter-mobile text-body-sm text-on-surface-variant md:px-margin">
          © 2025 Việc học của tôi. Không gian tự học tối giản và hiệu quả.
        </div>
      </footer>
    </>
  );
}

// Bài 1 không có thao tác bất đồng bộ nên không dòng nào ở trạng thái chờ.
const EMPTY_BUSY: ReadonlySet<string> = new Set();
