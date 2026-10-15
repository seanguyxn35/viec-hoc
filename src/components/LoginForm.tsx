"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";

/*
  BÀI 1: đây chỉ là GIAO DIỆN form đăng nhập.
  Không có xác thực thật, không lưu và không gửi mật khẩu đi đâu.
  Bài 2 sẽ thay phần này bằng Supabase Auth.
*/
export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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
          // Bài 1 chưa xử lý đăng nhập: chặn submit để trang không tải lại
          // và để không ai nhầm đây là xác thực thật.
          onSubmit={(event) => event.preventDefault()}
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
                autoComplete="off"
                placeholder="Nhập email của bạn"
                className="w-full rounded-lg bg-surface-container-low py-2.5 pl-11 pr-4 text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:bg-surface-container-lowest"
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
              {/* Không controlled, không state: giá trị không được giữ lại ở đâu cả. */}
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                placeholder="Không nhập mật khẩu thật ở bài 1"
                className="w-full rounded-lg bg-surface-container-low py-2.5 pl-11 pr-12 text-body-md text-on-surface outline-none transition-all duration-200 placeholder:text-outline focus:bg-surface-container-lowest"
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

          <p className="flex items-start gap-space-xs rounded-lg bg-surface-container-low px-space-md py-space-sm text-body-sm text-on-surface-variant">
            <span className="mt-0.5 shrink-0 text-primary">
              <Icon name="error_outline" size={18} />
            </span>
            <span>
              Bài 1 mới dựng giao diện. Nút Đăng nhập chưa hoạt động và chưa có
              tài khoản thật — Supabase Auth sẽ được thêm ở bài 2.
            </span>
          </p>

          <div className="pt-1">
            <button
              type="submit"
              disabled
              className="group flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-surface-container-highest text-label-md text-outline shadow-sm"
            >
              <span>Đăng nhập</span>
              <Icon name="arrow_forward" size={18} />
            </button>
          </div>

          <Link
            href="/tasks"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-label-md text-on-primary shadow-sm transition-all duration-150 hover:bg-primary-container active:scale-[0.99]"
          >
            <span>Xem giao diện công việc</span>
            <Icon name="arrow_forward" size={18} />
          </Link>
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
