"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "./AppHeader";
import Icon from "./Icon";
import TaskFilters from "./TaskFilters";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { ApiError, apiFetch } from "@/lib/api-client";
import { getSupabase } from "@/lib/supabase-browser";
import type { Task, TaskFilter } from "@/lib/types";

/*
  BÀI 2: dữ liệu lấy từ API /api/tasks (lưu ở Supabase).
  State chỉ dùng để hiển thị; giao diện chỉ đổi sau khi API xác nhận thành công,
  và sau mỗi thay đổi thành công thì tải lại danh sách từ API.
*/
type AuthState =
  | { status: "checking" }
  | { status: "signed-in"; email: string | null }
  | { status: "config-error" };

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

export default function TaskDashboard() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [signingOut, setSigningOut] = useState(false);

  const clearData = useCallback(() => {
    setTasks([]);
    setLoadError(null);
    setActionError(null);
  }, []);

  /** Lỗi 401: phiên không còn hợp lệ, xóa dữ liệu và về trang đăng nhập. */
  const handleApiError = useCallback(
    (error: unknown, show: (message: string) => void) => {
      show(errorMessage(error));
      if (error instanceof ApiError && error.status === 401) {
        clearData();
        router.replace("/login");
      }
    },
    [clearData, router],
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Task[]>("/api/tasks");
      setTasks(data);
      setLoadError(null);
    } catch (error) {
      handleApiError(error, setLoadError);
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  // Kiểm tra phiên đăng nhập; chưa có phiên thì về /login và không hiện dữ liệu.
  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      queueMicrotask(() => setAuth({ status: "config-error" }));
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setAuth({ status: "signed-in", email: data.session.user.email ?? null });
      void loadTasks();
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;
        if (!session) {
          clearData();
          setAuth({ status: "checking" });
          router.replace("/login");
        }
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [clearData, loadTasks, router]);

  const setBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((previous) => {
      const next = new Set(previous);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(
    async (title: string) => {
      if (submitting) return false;
      setSubmitting(true);
      setActionError(null);
      try {
        await apiFetch<Task>("/api/tasks", { method: "POST", body: { title } });
      } catch (error) {
        handleApiError(error, setActionError);
        return false;
      } finally {
        setSubmitting(false);
      }
      await loadTasks();
      return true;
    },
    [handleApiError, loadTasks, submitting],
  );

  const handleToggle = useCallback(
    async (task: Task, nextDone: boolean) => {
      if (busyIds.has(task.id)) return;
      setBusy(task.id, true);
      setActionError(null);
      try {
        await apiFetch<Task>(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: { is_done: nextDone },
        });
        await loadTasks();
      } catch (error) {
        handleApiError(error, setActionError);
      } finally {
        setBusy(task.id, false);
      }
    },
    [busyIds, handleApiError, loadTasks, setBusy],
  );

  const handleRename = useCallback(
    async (task: Task, nextTitle: string) => {
      if (busyIds.has(task.id)) return false;
      setBusy(task.id, true);
      setActionError(null);
      try {
        await apiFetch<Task>(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: { title: nextTitle },
        });
      } catch (error) {
        handleApiError(error, setActionError);
        return false;
      } finally {
        setBusy(task.id, false);
      }
      await loadTasks();
      return true;
    },
    [busyIds, handleApiError, loadTasks, setBusy],
  );

  const handleDelete = useCallback(
    async (task: Task) => {
      if (busyIds.has(task.id)) return;
      const confirmed = window.confirm(`Xóa công việc "${task.title}"?`);
      if (!confirmed) return;
      setBusy(task.id, true);
      setActionError(null);
      try {
        await apiFetch<{ id: string }>(`/api/tasks/${task.id}`, {
          method: "DELETE",
        });
        await loadTasks();
      } catch (error) {
        handleApiError(error, setActionError);
      } finally {
        setBusy(task.id, false);
      }
    },
    [busyIds, handleApiError, loadTasks, setBusy],
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    // scope "local": chỉ đăng xuất phiên trên thiết bị này, không đăng xuất mọi thiết bị.
    const { error } = await getSupabase().auth.signOut({ scope: "local" });
    if (error) {
      setActionError("Đăng xuất không thành công. Vui lòng thử lại.");
      setSigningOut(false);
      return;
    }
    clearData();
    router.replace("/login");
  }, [clearData, router]);

  const counts = useMemo<Record<TaskFilter, number>>(() => {
    const done = tasks.filter((task) => task.is_done).length;
    return { all: tasks.length, pending: tasks.length - done, done };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((task) => !task.is_done);
    if (filter === "done") return tasks.filter((task) => task.is_done);
    return tasks;
  }, [tasks, filter]);

  if (auth.status === "config-error") {
    return (
      <main className="flex w-full flex-1 items-center justify-center p-gutter-mobile">
        <p
          role="alert"
          className="flex max-w-md items-start gap-space-xs rounded-lg bg-error-container px-space-md py-space-sm text-body-sm text-on-error-container"
        >
          <Icon name="error_outline" size={18} className="mt-0.5 shrink-0" />
          Website chưa được cấu hình kết nối Supabase. Kiểm tra biến môi trường
          NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
        </p>
      </main>
    );
  }

  if (auth.status === "checking") {
    return (
      <main className="flex w-full flex-1 items-center justify-center p-gutter-mobile">
        <p
          role="status"
          className="flex items-center gap-space-xs text-body-md text-on-surface-variant"
        >
          <Icon name="spinner" size={20} className="animate-spin text-primary" />
          Đang kiểm tra đăng nhập...
        </p>
      </main>
    );
  }

  const firstLoad = loading && tasks.length === 0 && !loadError;

  return (
    <>
      <AppHeader
        email={auth.email}
        signingOut={signingOut}
        onSignOut={() => {
          void handleSignOut();
        }}
      />

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

          <TaskForm onAdd={handleAdd} submitting={submitting} />

          {actionError ? (
            <p
              role="alert"
              data-testid="action-error"
              className="flex items-start gap-space-xs rounded-lg bg-error-container px-space-md py-space-sm text-body-sm text-on-error-container"
            >
              <Icon name="error_outline" size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1">{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                aria-label="Đóng thông báo lỗi"
                className="shrink-0 rounded p-0.5 hover:bg-error/10"
              >
                <Icon name="close" size={16} />
              </button>
            </p>
          ) : null}

          <TaskFilters value={filter} counts={counts} onChange={setFilter} />

          {firstLoad ? (
            <section
              role="status"
              className="flex min-h-[220px] items-center justify-center gap-space-xs rounded-xl bg-surface-container-lowest p-space-lg text-body-md text-on-surface-variant shadow-sm"
            >
              <Icon name="spinner" size={20} className="animate-spin text-primary" />
              Đang tải công việc...
            </section>
          ) : loadError ? (
            <section
              role="alert"
              data-testid="load-error"
              className="flex min-h-[220px] flex-col items-center justify-center gap-space-sm rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-error">
                <Icon name="error_outline" size={28} />
              </div>
              <p className="text-title-md text-on-surface">{loadError}</p>
              <button
                type="button"
                onClick={() => {
                  void loadTasks();
                }}
                disabled={loading}
                className="inline-flex items-center gap-space-xs rounded-lg bg-primary px-space-md py-space-xs text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:cursor-wait disabled:opacity-70"
              >
                <Icon
                  name={loading ? "spinner" : "refresh"}
                  size={18}
                  className={loading ? "animate-spin" : undefined}
                />
                Thử lại
              </button>
            </section>
          ) : (
            <TaskList
              tasks={visibleTasks}
              filter={filter}
              busyIds={busyIds}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
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
