import { connection, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import companyStatusFallback from "@/data/company-status.json";
import type { CompanyStatus } from "@/types/office";

// Dữ liệu công ty thật (10 người, 3 phòng ban + Ban Điều hành).
//
// Nguồn chính: Upstash Redis (Vercel KV đã ngừng từ 12/2024, Vercel
// chuyển sang Upstash Redis qua Marketplace) — key "company-status".
// Dev cập nhật bằng script scripts/sync-status-to-redis.mjs, không cần
// commit/push/deploy lại. Biến môi trường UPSTASH_REDIS_REST_URL và
// UPSTASH_REDIS_REST_TOKEN do Vercel tự chèn khi store được nối vào
// project (local: đặt trong .env.local, file này không commit).
//
// Dự phòng: src/data/company-status.json (bản chép của
// ~/workspace/dev/dashboard/company-data.json) — dùng khi Redis chưa có,
// chưa cấu hình, hoặc lỗi mạng. Header X-Company-Status-Source cho biết
// response lấy từ "redis" hay "bundled".
// `await connection()` dừng prerender lúc build (theo docs Route Handlers
// của Next.js khi bật cacheComponents) để handler này luôn chạy lúc
// request: Dashboard gọi là nhận dữ liệu mới nhất.
export async function GET() {
  await connection();
  const fallback = companyStatusFallback as unknown as CompanyStatus;
  let status: CompanyStatus = fallback;
  let source: "redis" | "bundled" = "bundled";
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      // retry: false + timeout 3s: Redis lỗi/chậm thì rơi về dữ liệu
      // đóng gói ngay, không để Dashboard chờ treo.
      const redis = new Redis({ url, token, retry: false });
      const data = await Promise.race([
        redis.get<CompanyStatus>("company-status"),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 3000),
        ),
      ]);
      if (
        data &&
        Array.isArray(data.executive) &&
        Array.isArray(data.departments)
      ) {
        status = data;
        source = "redis";
      }
    }
  } catch {
    // Redis chưa có / lỗi mạng: giữ dữ liệu đóng gói lúc build.
  }
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
      "X-Company-Status-Source": source,
    },
  });
}
