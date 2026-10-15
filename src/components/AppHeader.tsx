import Image from "next/image";
import Icon from "./Icon";

type AppHeaderProps = {
  email: string | null;
  signingOut: boolean;
  onSignOut: () => void;
};

export default function AppHeader({
  email,
  signingOut,
  onSignOut,
}: AppHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-gutter-mobile md:px-margin">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Logo Việc học của tôi"
            width={32}
            height={32}
            unoptimized
            priority
            className="h-8 w-8 shrink-0 object-contain"
          />
          <span className="select-none truncate text-title-lg tracking-tight text-on-surface">
            Việc học của tôi
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-space-sm">
          {email ? (
            <span
              data-testid="user-email"
              className="hidden max-w-[220px] items-center gap-1 truncate text-label-md text-on-surface-variant md:flex"
            >
              <Icon name="person" size={18} className="shrink-0" />
              <span className="truncate">{email}</span>
            </span>
          ) : null}
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="flex items-center gap-1 rounded-lg px-space-sm py-space-xs text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-wait disabled:opacity-60 md:px-space-md"
          >
            <Icon
              name={signingOut ? "spinner" : "logout"}
              size={20}
              className={signingOut ? "animate-spin" : undefined}
            />
            <span className="hidden sm:inline">Đăng xuất</span>
            <span className="sr-only sm:hidden">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
