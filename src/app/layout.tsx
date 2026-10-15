import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Việc học của tôi",
  description:
    "Theo dõi và hoàn thành việc học mỗi ngày: thêm, sửa, lọc và xóa công việc.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans text-body-md antialiased">
        {children}
      </body>
    </html>
  );
}
