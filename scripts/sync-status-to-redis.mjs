#!/usr/bin/env node
/**
 * Đẩy dữ liệu công ty thật lên Upstash Redis (key "company-status") để
 * GET /api/status phục vụ Dashboard mà KHÔNG cần commit/push/deploy lại.
 *
 * Nguồn: ~/workspace/dev/dashboard/company-data.json (file thật duy nhất
 * do Emma/Dev duy trì; có thể truyền đường dẫn khác làm argv[2]).
 *
 * Xác thực qua kết nối custom.upstash đã đăng ký (token nằm trong Secure
 * Vault, không có trong file hay biến môi trường) — script này chỉ gọi
 * helper Python, không tự cầm token.
 *
 * Cách chạy:
 *   npm run sync:status
 *   node scripts/sync-status-to-redis.mjs ~/workspace/dev/dashboard/company-data.json
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_SOURCE = "/home/hatch/workspace/dev/dashboard/company-data.json";
const HELPER =
  "/home/hatch/workspace/custom-connectors/custom.upstash/bin/upstash-redis.py";

const sourcePath = resolve(process.argv[2] ?? DEFAULT_SOURCE);
if (!existsSync(sourcePath)) {
  console.error(`sync-status-to-redis: khong tim thay file du lieu: ${sourcePath}`);
  process.exit(1);
}
if (!existsSync(HELPER)) {
  console.error(`sync-status-to-redis: khong tim thay helper: ${HELPER}`);
  process.exit(1);
}

const result = spawnSync("python3", [HELPER, "set", "--file", sourcePath], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
