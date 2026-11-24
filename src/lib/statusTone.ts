/**
 * Màu chip trạng thái suy ra từ từ khóa trong câu trạng thái thật.
 * Chỉ dùng để hiển thị cho dễ quét nhanh, không đổi nội dung trạng thái.
 * Thứ tự kiểm tra quan trọng: "chờ duyệt" đứng trước "xong" vì một việc
 * vừa xong vừa chờ duyệt thì điều Lex cần thấy là nó đang chờ mình.
 *
 * Lưu ý dữ liệu: company-data.json dùng chữ không dấu ("Cho duyet",
 * "Dang lam", "Vua nhan viec"), nên phải chuẩn hóa bỏ dấu trước khi so
 * từ khóa thì mới khớp cả hai dạng có dấu và không dấu.
 */
export type StatusToneKey = "waiting" | "working" | "new" | "done" | "neutral";

export interface StatusTone {
  key: StatusToneKey;
  /** Nhãn nhóm ngắn gọn để đếm tóm tắt, ví dụ "Chờ duyệt". */
  label: string;
  dot: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
}

const TONES: Record<StatusToneKey, StatusTone> = {
  waiting: {
    key: "waiting",
    label: "Chờ duyệt",
    dot: "#D97706",
    chipBg: "#FEF3C7",
    chipText: "#92400E",
    chipBorder: "#F59E0B55",
  },
  working: {
    key: "working",
    label: "Đang làm",
    dot: "#059669",
    chipBg: "#D1FAE5",
    chipText: "#065F46",
    chipBorder: "#10B98155",
  },
  new: {
    key: "new",
    label: "Vừa nhận việc",
    dot: "#2563EB",
    chipBg: "#DBEAFE",
    chipText: "#1E40AF",
    chipBorder: "#3B82F655",
  },
  done: {
    key: "done",
    label: "Đã xong",
    dot: "#0D9488",
    chipBg: "#CCFBF1",
    chipText: "#115E59",
    chipBorder: "#14B8A655",
  },
  neutral: {
    key: "neutral",
    label: "Khác",
    dot: "#6B6253",
    chipBg: "#F5EFE0",
    chipText: "#5C5343",
    chipBorder: "#DFD6BE",
  },
};

/** Hạ chữ thường và bỏ dấu tiếng Việt để so từ khóa khớp cả hai dạng. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function getStatusTone(status?: string): StatusTone {
  const text = normalize(status ?? "");
  // "đã duyệt" (đã xong việc chờ) đứng trước "duyệt" chung chung, nếu
  // không một tập đã duyệt vẫn bị tô màu chờ duyệt.
  if (text.includes("da duyet")) return TONES.done;
  if (
    text.includes("cho duyet") ||
    text.includes("cho lex") ||
    text.includes("duyet")
  )
    return TONES.waiting;
  if (text.includes("dang lam")) return TONES.working;
  if (text.includes("vua nhan viec")) return TONES.new;
  if (text.includes("xong") || text.includes("hoan thanh")) return TONES.done;
  return TONES.neutral;
}

/** Lấy màu của một nhóm trạng thái khi đã biết key, ví dụ để đếm tóm tắt. */
export function getStatusToneByKey(key: StatusToneKey): StatusTone {
  return TONES[key];
}
