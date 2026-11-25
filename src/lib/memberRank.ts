/**
 * Badge cấp bậc hiển thị cạnh/dưới tên nhân vật, riêng với màu trạng thái.
 * Màu trạng thái (chờ duyệt / đang làm / vừa nhận việc / đã xong) vẫn giữ
 * nguyên trên thẻ tên — badge này chỉ nói cấp bậc trong công ty.
 *
 * Cấp bậc theo id (không suy từ chữ trong role, vì role viết tự do):
 * - Cấp 1 — Chủ tịch (Lex): vàng gold #FFD700, nổi bật nhất, to hơn một chút
 * - Cấp 2 — CEO (Emma): tím #A855F7
 * - Cấp 3 — Giám đốc: xanh dương #3B82F6
 * - Cấp 4 — Chuyên viên: xanh ngọc teal #14B8A6; riêng IT-Lead là "TRƯỞNG ĐỘI IT"
 * Id lạ chưa có trong bảng thì mặc định là Chuyên viên (teal).
 */

export type RankTier = 1 | 2 | 3 | 4;

export interface MemberRank {
  tier: RankTier;
  /** Chữ in trên badge, ví dụ "★ CHỦ TỊCH", "CEO", "GIÁM ĐỐC". */
  label: string;
  /** Màu nền badge. */
  color: string;
  /** Màu chữ trên badge. */
  textColor: string;
  /** true thì badge to hơn các badge khác một chút (chỉ Lex). */
  prominent?: boolean;
}

const RANKS: Record<string, MemberRank> = {
  lex: {
    tier: 1,
    label: "★ CHỦ TỊCH",
    color: "#FFD700",
    textColor: "#3F3000",
    prominent: true,
  },
  emma: { tier: 2, label: "CEO", color: "#A855F7", textColor: "#FFFFFF" },
  alien: { tier: 3, label: "GIÁM ĐỐC", color: "#3B82F6", textColor: "#FFFFFF" },
  threads: {
    tier: 3,
    label: "GIÁM ĐỐC",
    color: "#3B82F6",
    textColor: "#FFFFFF",
  },
  "8bit-video": {
    tier: 3,
    label: "GIÁM ĐỐC",
    color: "#3B82F6",
    textColor: "#FFFFFF",
  },
  "8bit-fb": {
    tier: 3,
    label: "GIÁM ĐỐC",
    color: "#3B82F6",
    textColor: "#FFFFFF",
  },
  research: {
    tier: 4,
    label: "CHUYÊN VIÊN",
    color: "#14B8A6",
    textColor: "#FFFFFF",
  },
  video: {
    tier: 4,
    label: "CHUYÊN VIÊN",
    color: "#14B8A6",
    textColor: "#FFFFFF",
  },
  automation: {
    tier: 4,
    label: "CHUYÊN VIÊN",
    color: "#14B8A6",
    textColor: "#FFFFFF",
  },
  data: {
    tier: 4,
    label: "CHUYÊN VIÊN",
    color: "#14B8A6",
    textColor: "#FFFFFF",
  },
  dev: {
    tier: 4,
    label: "CHUYÊN VIÊN",
    color: "#14B8A6",
    textColor: "#FFFFFF",
  },
  "it-lead": {
    tier: 4,
    label: "TRƯỞNG ĐỘI IT",
    color: "#14B8A6",
    textColor: "#FFFFFF",
  },
};

export function getMemberRank(memberId: string): MemberRank {
  return (
    RANKS[memberId] ?? {
      tier: 4,
      label: "CHUYÊN VIÊN",
      color: "#14B8A6",
      textColor: "#FFFFFF",
    }
  );
}
