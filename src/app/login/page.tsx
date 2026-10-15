import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập · Việc học của tôi",
};

export default function LoginPage() {
  return (
    <main className="flex w-full flex-1 items-center justify-center p-gutter-mobile md:p-margin">
      <LoginForm />
    </main>
  );
}
