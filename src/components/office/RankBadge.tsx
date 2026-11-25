"use client";

import { getMemberRank } from "@/lib/memberRank";

/**
 * Badge cấp bậc dùng chung cho thẻ tên 3D và bảng trạng thái.
 *
 * Hiệu ứng lấp lánh (theo ý Lex/Emma 2026-11-25): vệt sáng lướt ngang badge
 * + vài tia sáng nhỏ (hình thoi) nhấp nháy quanh viền. Vàng Chủ tịch có
 * 3 tia, lướt nhanh + sáng hơn + nhịp phát sáng; các cấp còn lại 2 tia,
 * chậm và mờ hơn. Chỉ animate transform/opacity (và box-shadow của nhịp
 * sáng vàng trên 1 badge) nên nhẹ, không làm chậm khung 3D trên điện thoại.
 * Tia lấp lánh là hình thoi CSS thuần (không dùng ký tự ✦) để không phụ
 * thuộc font chữ.
 */
export function RankBadge({
  memberId,
  className = "",
}: {
  memberId: string;
  className?: string;
}) {
  const rank = getMemberRank(memberId);
  const sparkCount = rank.prominent ? 3 : 2;

  return (
    <span
      className={`rank-badge inline-flex items-center whitespace-nowrap rounded-full font-extrabold tracking-wide shadow-sm ${
        rank.prominent
          ? "rank-badge--gold px-2.5 py-0.5 text-[10px]"
          : "px-2 py-0.5 text-[9px]"
      } ${className}`}
      style={{ backgroundColor: rank.color, color: rank.textColor }}
    >
      {rank.label}
      {Array.from({ length: sparkCount }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`rank-spark rank-spark-${i + 1}`}
        />
      ))}
    </span>
  );
}
