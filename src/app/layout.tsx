import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Văn Phòng Công Ty — Sơ đồ Phòng ban & Nhân sự",
  description:
    "Danh sách phòng ban, nhân vật, vai trò và kỹ năng của văn phòng công ty.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5EFE0] text-[#2A251D] font-sans">
        {children}
      </body>
    </html>
  );
}
