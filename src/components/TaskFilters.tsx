"use client";

import type { TaskFilter } from "@/lib/types";

const FILTERS: ReadonlyArray<{ value: TaskFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa xong" },
  { value: "done", label: "Đã xong" },
];

type TaskFiltersProps = {
  value: TaskFilter;
  counts: Record<TaskFilter, number>;
  onChange: (next: TaskFilter) => void;
};

export default function TaskFilters({
  value,
  counts,
  onChange,
}: TaskFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Bộ lọc công việc"
      className="flex w-fit items-center gap-space-xs rounded-xl bg-surface-container-low p-space-xs"
    >
      {FILTERS.map((filter) => {
        const active = filter.value === value;
        return (
          <button
            key={filter.value}
            type="button"
            data-testid={`filter-${filter.value}`}
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={
              active
                ? "rounded-lg bg-surface-container-lowest px-space-md py-space-xs text-label-md text-primary shadow-sm transition-all"
                : "rounded-lg px-space-md py-space-xs text-label-md text-on-surface-variant transition-all hover:text-on-surface"
            }
          >
            {filter.label}{" "}
            <span className="ml-1 text-label-sm opacity-75">
              ({counts[filter.value]})
            </span>
          </button>
        );
      })}
    </div>
  );
}
