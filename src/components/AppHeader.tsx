import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";

/*
  BÀI 1: chưa có đăng nhập nên header không hiển thị người dùng.
  Liên kết bên phải chỉ là điều hướng về trang đăng nhập mẫu,
  không phải thao tác đăng xuất thật.
*/
export default function AppHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-gutter-mobile md:px-margin">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Logo Việc học của tôi"
            width={32}
            height={32}
            unoptimized
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="select-none text-title-lg tracking-tight text-on-surface">
            Việc học của tôi
          </span>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-1 rounded-lg px-space-sm py-space-xs text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface md:px-space-md"
        >
          <Icon name="logout" size={20} />
          <span className="hidden sm:inline">Về trang đăng nhập</span>
          <span className="sr-only sm:hidden">Về trang đăng nhập</span>
        </Link>
      </div>
    </header>
  );
}
