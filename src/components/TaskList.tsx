"use client";

import EmptyState from "./EmptyState";
import TaskItem from "./TaskItem";
import type { Task, TaskFilter } from "@/lib/types";

const EMPTY_TEXT: Record<TaskFilter, { title: string; description: string }> = {
  all: {
    title: "Chưa có công việc nào",
    description: "Thêm việc để bắt đầu ngày học hiệu quả.",
  },
  pending: {
    title: "Không còn việc chưa xong",
    description: "Bạn đã hoàn thành hết phần việc đang theo dõi.",
  },
  done: {
    title: "Chưa có việc nào hoàn thành",
    description: "Tích vào ô vuông khi học xong một việc.",
  },
};

type TaskListProps = {
  tasks: Task[];
  filter: TaskFilter;
  busyIds: ReadonlySet<string>;
  onToggle: (task: Task, nextDone: boolean) => Promise<void>;
  onRename: (task: Task, nextTitle: string) => Promise<boolean>;
  onDelete: (task: Task) => Promise<void>;
};

export default function TaskList({
  tasks,
  filter,
  busyIds,
  onToggle,
  onRename,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    const text = EMPTY_TEXT[filter];
    return <EmptyState title={text.title} description={text.description} />;
  }

  return (
    <section
      aria-label="Danh sách công việc"
      className="flex flex-col gap-space-sm"
    >
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          busy={busyIds.has(task.id)}
          onToggle={onToggle}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
