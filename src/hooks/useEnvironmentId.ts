"use client";

import { useEffect, useState } from "react";
import {
  getEnvironmentIdForDate,
  isEnvironmentId,
  type EnvironmentId,
} from "@/lib/environments";

/**
 * Cảnh ngoại cảnh đang hiển thị.
 *
 * Mặc định: xoay tự động mỗi ngày theo ngày trong năm (xem
 * getEnvironmentIdForDate). Xem trước một cảnh bất kỳ bằng tham số URL
 * `?env=<id>` (vd: `?env=zoo`) — chỉ để xem trước, không đổi chu kỳ xoay.
 * Đọc `?env=` trong useEffect để lần render đầu khớp với server.
 */
export function useEnvironmentId(): EnvironmentId {
  const [id, setId] = useState<EnvironmentId>(() =>
    getEnvironmentIdForDate(new Date()),
  );

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("env");
    if (param && isEnvironmentId(param)) {
      setId(param);
    }
  }, []);

  return id;
}
