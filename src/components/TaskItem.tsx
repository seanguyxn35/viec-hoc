"use client";

import { useId, useState } from "react";
import Icon from "./Icon";
import { validateTitle } from "./TaskForm";
import type { Task } from "@/lib/types";

type TaskItemProps = {
  task: Task;
  busy: boolean;
  onToggle: (task: Task, nextDone: boolean) => Promise<void>;
  onRename: (task: Task, nextTitle: string) => Promise<boolean>;
  onDelete: (task: Task) => Promise<void>;
};

export default function TaskItem({
  task,
  busy,
  onToggle,
  onRename,
  onDelete,
}: TaskItemProps) {
  const editInputId = useId();
  const errorId = `${editInputId}-error`;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setDraft(task.title);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setDraft(task.title);
    setError(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateTitle(draft);
    setError(message);
    if (message) return;

    const saved = await onRename(task, draft.trim());
    if (saved) {
      setEditing(false);
      setError(null);
    }
  }

  if (editing) {
    return (
      <article
        data-testid="task-item"
        data-task-id={task.id}
        className="rounded-xl bg-surface-container-low p-space-md shadow-sm"
      >
        <form
          onSubmit={handleSave}
          noValidate
          className="flex flex-col items-stretch justify-between gap-space-md sm:flex-row sm:items-start"
        >
          <div className="flex min-w-0 flex-1 items-start gap-space-md">
            <span className="mt-2.5 shrink-0 text-primary">
              <Icon name="edit" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor={editInputId} className="sr-only">
                Sửa tên công việc
              </label>
              <input
                id={editInputId}
                data-testid="task-edit-input"
                type="text"
                autoFocus
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") cancelEditing();
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="w-full rounded-lg bg-surface-container-lowest px-space-sm py-space-xs text-body-lg text-on-surface shadow-sm focus:outline-none"
              />
              {error ? (
                <p
                  id={errorId}
                  role="alert"
                  className="mt-space-xs flex items-center gap-1 text-body-sm text-error"
                >
                  <Icon name="error_outline" size={16} />
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-space-xs">
            <button
              type="submit"
              data-testid="task-save"
              disabled={busy}
              className="flex items-center gap-1 rounded-lg bg-primary px-space-md py-space-xs text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:cursor-wait disabled:opacity-70"
            >
              <Icon
                name={busy ? "spinner" : "check"}
                size={18}
                className={busy ? "animate-spin" : undefined}
              />
              <span>Lưu</span>
            </button>
            <button
              type="button"
              data-testid="task-cancel-edit"
              onClick={cancelEditing}
              disabled={busy}
              className="flex items-center gap-1 rounded-lg bg-surface-container px-space-md py-space-xs text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-60"
            >
              <Icon name="close" size={18} />
              <span>Hủy</span>
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      data-testid="task-item"
      data-task-id={task.id}
      data-done={task.is_done}
      className={
        task.is_done
          ? "group flex items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest/80 p-space-md shadow-sm transition-all"
          : "group flex items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md"
      }
    >
      <label className="flex flex-1 cursor-pointer select-none items-center gap-space-md">
        <input
          type="checkbox"
          data-testid="task-toggle"
          className="peer sr-only"
          checked={task.is_done}
          disabled={busy}
          onChange={(event) => {
            void onToggle(task, event.target.checked);
          }}
          aria-label={`Đánh dấu hoàn thành: ${task.title}`}
        />
        <div
          className={
            task.is_done
              ? "flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary text-on-secondary transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
              : "flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface-container-high text-transparent transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
          }
        >
          <Icon name="check" size={16} />
        </div>
        <span
          data-testid="task-title"
          className={
            task.is_done
              ? "text-body-lg text-outline line-through"
              : "text-body-lg text-on-surface transition-colors group-hover:text-primary"
          }
        >
          {task.title}
        </span>
      </label>

      <div className="flex shrink-0 items-center gap-space-xs">
        {busy ? (
          <span className="px-space-xs text-primary" role="status">
            <Icon name="spinner" size={18} className="animate-spin" />
            <span className="sr-only">Đang xử lý</span>
          </span>
        ) : null}
        <button
          type="button"
          data-testid="task-edit"
          onClick={startEditing}
          disabled={busy}
          className="flex items-center gap-1 rounded-lg p-space-xs text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary disabled:opacity-60"
        >
          <Icon name="edit" size={18} />
          <span className="hidden sm:inline">Sửa</span>
          <span className="sr-only sm:hidden">Sửa</span>
        </button>
        <button
          type="button"
          data-testid="task-delete"
          onClick={() => {
            void onDelete(task);
          }}
          disabled={busy}
          className="flex items-center gap-1 rounded-lg p-space-xs text-label-sm text-on-surface-variant transition-colors hover:bg-error-container/40 hover:text-error disabled:opacity-60"
        >
          <Icon name="delete" size={18} />
          <span className="hidden sm:inline">Xóa</span>
          <span className="sr-only sm:hidden">Xóa</span>
        </button>
      </div>
    </article>
  );
}
