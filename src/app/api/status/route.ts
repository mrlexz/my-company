import { connection, NextResponse } from "next/server";
import companyStatus from "@/data/company-status.json";

// Dữ liệu công ty thật (10 người, 3 phòng ban + Ban Điều hành).
// File src/data/company-status.json là bản chép của
// ~/workspace/dev/dashboard/company-data.json — Dev cập nhật mỗi khi Emma
// báo có thay đổi, Lex push lên GitHub, Vercel tự deploy lại.
// `await connection()` dừng prerender lúc build (theo docs Route Handlers
// của Next.js khi bật cacheComponents) để handler này luôn chạy lúc
// request: Dashboard gọi là nhận dữ liệu mới nhất đã deploy.
export async function GET() {
  await connection();
  return NextResponse.json(companyStatus, {
    headers: { "Cache-Control": "no-store" },
  });
}
