"use client";

import { useId, useState } from "react";
import Icon from "./Icon";

export const TITLE_MIN = 1;
export const TITLE_MAX = 120;

/** Trả về null khi tên hợp lệ, ngược lại là thông báo lỗi tiếng Việt. */
export function validateTitle(raw: string): string | null {
  const title = raw.trim();
  if (title.length < TITLE_MIN) {
    return "Tên công việc không được để trống.";
  }
  if (title.length > TITLE_MAX) {
    return `Tên công việc tối đa ${TITLE_MAX} ký tự (đang ${title.length}).`;
  }
  return null;
}

type TaskFormProps = {
  onAdd: (title: string) => Promise<boolean>;
  submitting: boolean;
};

export default function TaskForm({ onAdd, submitting }: TaskFormProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateTitle(title);
    setError(message);
    if (message) return;

    const added = await onAdd(title.trim());
    if (added) {
      setTitle("");
      setError(null);
    }
  }

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col items-stretch gap-space-sm sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <label htmlFor={inputId} className="sr-only">
            Tên công việc
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-space-md text-outline">
              <Icon name="edit" size={20} />
            </span>
            <input
              id={inputId}
              name="title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Nhập nhiệm vụ học tập cần làm..."
              className="h-[44px] w-full rounded-lg bg-surface-container-lowest py-space-sm pl-11 pr-space-md text-body-md text-on-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors placeholder:text-outline focus:bg-surface-container-low focus:outline-none"
            />
          </div>
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

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-[44px] shrink-0 items-center justify-center gap-space-xs rounded-lg bg-primary-container px-space-lg text-label-md text-on-primary shadow-sm transition-all hover:bg-primary active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          <Icon
            name={submitting ? "spinner" : "add"}
            size={20}
            className={submitting ? "animate-spin" : undefined}
          />
          <span>{submitting ? "Đang thêm..." : "Thêm công việc"}</span>
        </button>
      </form>
    </section>
  );
}
