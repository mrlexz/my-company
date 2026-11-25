"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useOfficeData } from "@/hooks/useOfficeData";
import {
  getStatusTone,
  getStatusToneByKey,
  type StatusToneKey,
} from "@/lib/statusTone";
import { getMemberRank } from "@/lib/memberRank";
import { useOfficeStore } from "@/store/useOfficeStore";

/** Chữ viết tắt trên vòng tròn avatar: lấy chữ đầu của tên tiếng Anh +
    chữ đầu của phần vai trò ("Orion - Alien" -> "OA"); tên không có
    dấu "-" thì lấy 2 chữ đầu ("Lex" -> "LE"). */
function getInitials(name: string): string {
  const parts = name.split(" - ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Bảng trạng thái công việc: liệt kê cả 10 người theo phòng ban để Lex
 * thấy ngay ai đang làm gì mà không cần bấm từng nhân vật 3D.
 * Dữ liệu thật từ useOfficeData (Redis qua /api/status, làm mới 5 phút).
 * Bấm vào một dòng thì mở thẻ nhân vật đó và đóng bảng.
 */
export function StatusBoard() {
  const { departments, companyStatusUpdatedAt } = useOfficeData();
  const isOpen = useOfficeStore((s) => s.isStatusBoardOpen);
  const companyStatusSource = useOfficeStore((s) => s.companyStatusSource);
  const setStatusBoardOpen = useOfficeStore((s) => s.setStatusBoardOpen);
  const setSelectedMember = useOfficeStore((s) => s.setSelectedMember);

  const totalMembers = departments.reduce(
    (n, dept) => n + dept.members.length,
    0,
  );

  const summary = useMemo(() => {
    const counts = new Map<StatusToneKey, number>();
    departments.forEach((dept) =>
      dept.members.forEach((member) => {
        const key = getStatusTone(member.status).key;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }),
    );
    return [...counts.entries()].filter(([, n]) => n > 0);
  }, [departments]);

  const updatedLabel = companyStatusUpdatedAt
    ? new Date(companyStatusUpdatedAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const sourceLabel =
    companyStatusSource === "redis"
      ? "Nguồn: Redis trực tiếp"
      : companyStatusSource === "bundled"
        ? "Nguồn: dữ liệu đóng gói lúc build"
        : "Đang tải dữ liệu thật…";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="status-board"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed bottom-6 right-5 top-32 z-30 flex w-80 max-w-[calc(100vw-2.5rem)] flex-col rounded-3xl border border-[#DFD6BE] bg-[#FCF9F2]/96 shadow-2xl backdrop-blur-md sm:top-20"
        >
          <div className="flex items-start justify-between gap-2 border-b border-[#ECE4D0] px-4 pb-3 pt-4">
            <div>
              <h2 className="text-base font-extrabold text-[#2A251D]">
                Trạng thái công việc
              </h2>
              <p className="mt-0.5 text-xs text-[#6B6253]">
                {totalMembers} người
                {updatedLabel ? ` • Cập nhật ${updatedLabel}` : ""}
              </p>
              <p className="text-[11px] text-[#7C715D]">{sourceLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatusBoardOpen(false)}
              aria-label="Đóng bảng trạng thái"
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#EFE7D4] text-xs font-bold text-[#5C5343] hover:bg-[#E2D6BC]"
            >
              ✕
            </button>
          </div>

          {summary.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-[#ECE4D0] px-4 py-2">
              {summary.map(([key, count]) => {
                const tone = getStatusToneByKey(key);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5C5343]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tone.dot }}
                    />
                    {tone.label}: {count}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-2">
            {departments.map((dept) => (
              <div key={dept.id} className="mb-2">
                <p className="flex items-center gap-1.5 px-1 pb-1.5 pt-2 text-[11px] font-extrabold uppercase tracking-wider text-[#7C715D]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  {dept.name} · {dept.members.length}
                </p>
                <div className="space-y-1.5">
                  {dept.members.map((member) => {
                    const tone = getStatusTone(member.status);
                    const rank = getMemberRank(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(member.id);
                          setStatusBoardOpen(false);
                        }}
                        className="w-full cursor-pointer rounded-2xl border border-[#E6DEC8] bg-white p-2.5 text-left transition-colors hover:border-[#D9C9A8] hover:bg-[#FFFDF7]"
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white shadow-inner"
                            style={{
                              backgroundColor:
                                member.avatarStyle.shirtColor,
                            }}
                          >
                            {getInitials(member.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-extrabold text-[#2A251D]">
                              {member.name}
                            </span>
                            <span
                              className="block truncate text-[11px] font-semibold"
                              style={{ color: dept.color }}
                            >
                              {member.role}
                            </span>
                            <span
                              className={`rank-badge mt-1 inline-flex items-center rounded-full font-extrabold tracking-wide ${
                                rank.prominent
                                  ? "rank-badge--gold px-2 py-0.5 text-[10px]"
                                  : "px-1.5 py-0.5 text-[9px]"
                              }`}
                              style={{
                                backgroundColor: rank.color,
                                color: rank.textColor,
                              }}
                            >
                              {rank.label}
                            </span>
                          </span>
                        </span>
                        {member.status && (
                          <span
                            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold"
                            style={{
                              backgroundColor: tone.chipBg,
                              color: tone.chipText,
                              borderColor: tone.chipBorder,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: tone.dot }}
                            />
                            {member.status}
                          </span>
                        )}
                        {member.progress && (
                          <span className="mt-1 block text-xs leading-snug text-[#4A4235]">
                            <b>Tiến độ: </b>
                            {member.progress}
                          </span>
                        )}
                        {member.focus && (
                          <span className="mt-0.5 block text-xs leading-snug text-[#6B6253]">
                            <b>Đang tập trung: </b>
                            <span className="line-clamp-2">
                              {member.focus}
                            </span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
