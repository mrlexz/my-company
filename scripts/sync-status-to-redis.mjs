#!/usr/bin/env node
/**
 * Đẩy dữ liệu công ty thật lên Upstash Redis (key "company-status") để
 * GET /api/status phục vụ Dashboard mà KHÔNG cần commit/push/deploy lại.
 *
 * Nguồn: ~/workspace/dev/dashboard/company-data.json (file thật duy nhất
 * do Emma/Dev duy trì; có thể truyền đường dẫn khác làm argv[2]).
 *
 * Biến môi trường (KHÔNG commit, để trong .env.local ở gốc repo hoặc
 * export trước khi chạy — token do Vercel chèn khi store Upstash Redis
 * được nối vào project):
 *   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 *
 * Cách chạy:
 *   node scripts/sync-status-to-redis.mjs
 *   node scripts/sync-status-to-redis.mjs ~/workspace/dev/dashboard/company-data.json
 *
 * Script chỉ in số người và một mẫu trạng thái để kiểm tra, KHÔNG in token.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Redis } from "@upstash/redis";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_SOURCE = "/home/hatch/workspace/dev/dashboard/company-data.json";
const KEY = "company-status";

// Nạp .env.local (nếu có) mà không cần thêm dependency.
function loadEnvLocal() {
  const path = resolve(REPO_ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

function fail(message) {
  console.error(`sync-status-to-redis: ${message}`);
  process.exit(1);
}

loadEnvLocal();
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  fail(
    "thieu UPSTASH_REDIS_REST_URL hoac UPSTASH_REDIS_REST_TOKEN — " +
      "dat trong .env.local (khong commit) hoac export truoc khi chay",
  );
}

const sourcePath = resolve(process.argv[2] ?? DEFAULT_SOURCE);
if (!existsSync(sourcePath)) fail(`khong tim thay file du lieu: ${sourcePath}`);
const data = JSON.parse(readFileSync(sourcePath, "utf-8"));
const people =
  (data.executive?.length ?? 0) +
  (data.departments ?? []).reduce((n, d) => n + (d.members?.length ?? 0), 0);
if (people === 0) fail("file du lieu khong co nguoi nao — kiem tra lai file");
if (!Array.isArray(data.executive) || !Array.isArray(data.departments)) {
  fail("file du lieu thieu executive/departments — kiem tra lai file");
}

const redis = new Redis({ url, token });
await redis.set(KEY, data);
const back = await redis.get(KEY);
if (!back || !Array.isArray(back.executive)) {
  fail("ghi xong nhung doc lai khong thay du lieu — kiem tra Redis");
}
const backPeople =
  back.executive.length +
  back.departments.reduce((n, d) => n + (d.members?.length ?? 0), 0);
console.log(`OK: da day ${backPeople} nguoi len Redis (key "${KEY}")`);
console.log(
  `Mau: 8bit-video = ${back.departments
    .flatMap((d) => d.members)
    .find((m) => m.id === "8bit-video")?.status}`,
);
