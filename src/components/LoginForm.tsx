"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAuthError } from "@supabase/supabase-js";
import Icon from "./Icon";
import {
  getSupabase,
  MissingSupabaseConfigError,
} from "@/lib/supabase-browser";

/*
  Đăng nhập thật bằng Supabase Auth (email + mật khẩu).
  Mật khẩu chỉ gửi tới Supabase qua signInWithPassword, không lưu hay ghi log ở đâu khác.
*/
function loginErrorMessage(error: unknown): string {
  if (error instanceof MissingSupabaseConfigError) {
    return "Website chưa được cấu hình kết nối Supabase. Kiểm tra biến môi trường.";
  }
  if (isAuthError(error)) {
    if (error.code === "invalid_credentials") {
      return "Email hoặc mật khẩu không đúng.";
    }
    if (error.code === "email_not_confirmed") {
      return "Tài khoản chưa xác nhận email.";
    }
    if (error.status === 429 || error.code === "over_request_rate_limit") {
      return "Bạn thử đăng nhập quá nhiều lần. Vui lòng đợi một lát.";
    }
    if (!error.status) {
      return "Không kết nối được máy chủ. Kiểm tra mạng và thử lại.";
    }
  }
  return "Đăng nhập không thành công. Vui lòng thử lại.";
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Đã có phiên đăng nhập thì không cần đăng nhập lại.
  useEffect(() => {
    let cancelled = false;
    try {
      getSupabase()
        .auth.getSession()
        .then(({ data }) => {
          if (!cancelled && data.session) router.replace("/tasks");
        });
    } catch {
      // Thiếu cấu hình: lỗi sẽ hiện khi người dùng bấm Đăng nhập.
    }
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { error: signInError } = await getSupabase().auth.signInWithPassword(
        { email: email.trim(), password },
      );
      if (signInError) throw signInError;
      setPassword("");
      router.replace("/tasks");
    } catch (caught) {
      setError(loginErrorMessage(caught));
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {/* Hai vệt màu mờ phía sau thẻ, theo thiết kế Stitch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute -top-24 -left-32 h-[640px] w-[640px] rounded-full bg-surface-container-high/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-24 h-[520px] w-[520px] rounded-full bg-secondary-fixed/30 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-[460px] flex-col rounded-xl bg-surface-container-lowest p-space-xl shadow-xl shadow-primary/5">
        <div className="flex flex-col items-center text-center">
          <div className="mb-space-md flex h-16 w-16 items-center justify-center rounded-xl bg-surface-container-low p-2 shadow-sm">
            <Image
              src="/images/logo.svg"
              alt="Logo Việc học của tôi"
              width={48}
              height={48}
              unoptimized
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div className="mb-space-xs inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-label-xs uppercase tracking-wider text-primary">
            <Icon name="menu_book" size={14} />
            <span>Học tập thông minh</span>
          </div>
          <h1 className="mt-1 text-headline-md tracking-tight text-on-surface">
            Việc học của tôi
          </h1>
          <p className="mt-1.5 max-w-[340px] text-body-sm text-on-surface-variant">
            Đăng nhập để theo dõi và hoàn thành bài tập mỗi ngày
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-space-lg flex flex-col gap-space-md"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="flex items-center justify-between text-label-md text-on-surface"
            >
              <span>Địa chỉ Email</span>
              <span className="text-label-xs text-outline">Bắt buộc</span>
            </label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3.5 select-none text-outline">
                <Icon name="mail" size={20} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full rounded-lg bg-surface-container-low py-2.5 pl-11 pr-4 text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:bg-surface-container-lowest disabled:opacity-70"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-label-md text-on-surface">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3.5 select-none text-outline">
                <Icon name="lock" size={20} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError(null);
                }}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full rounded-lg bg-surface-container-low py-2.5 pl-11 pr-12 text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:bg-surface-container-lowest disabled:opacity-70"
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2 flex items-center justify-center rounded p-1.5 text-outline transition-colors hover:text-on-surface"
              >
                <Icon
                  name={showPassword ? "visibility_off" : "visibility"}
                  size={20}
                />
              </button>
            </div>
          </div>

          {error ? (
            <p
              id="login-error"
              role="alert"
              className="flex items-start gap-space-xs rounded-lg bg-error-container px-space-md py-space-sm text-body-sm text-on-error-container"
            >
              <span className="mt-0.5 shrink-0">
                <Icon name="error_outline" size={18} />
              </span>
              <span>{error}</span>
            </p>
          ) : null}

          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-label-md text-on-primary shadow-sm transition-all duration-150 hover:bg-primary-container active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
            >
              <span>{submitting ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              <Icon
                name={submitting ? "spinner" : "arrow_forward"}
                size={18}
                className={submitting ? "animate-spin" : undefined}
              />
            </button>
          </div>
        </form>

        <div className="mt-space-lg flex flex-col items-center gap-space-xs pt-space-md text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-outline">
            <span className="flex items-center gap-1 text-label-xs">
              <Icon name="timer" size={14} />
              Thời khóa biểu
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-outline-variant" />
            <span className="flex items-center gap-1 text-label-xs">
              <Icon name="checklist" size={14} />
              Nhắc bài tập
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-outline-variant" />
            <span className="flex items-center gap-1 text-label-xs">
              <Icon name="trending_up" size={14} />
              Tiến độ môn học
            </span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-label-xs text-outline">
        Không gian số tập trung, chuẩn mực &amp; không sao nhãng
      </p>
    </div>
  );
}
