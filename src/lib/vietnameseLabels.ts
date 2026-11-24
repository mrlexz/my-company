/**
 * Nhãn tiếng Việt cho các mã trạng thái/cảm xúc/hoạt động nội bộ.
 * Mã (ví dụ "working", "idle") là định danh code, không bao giờ hiện
 * trực tiếp ra giao diện — mọi chỗ hiển thị đều đi qua các nhãn này.
 */
import type {
  CharacterState,
  EmotionType,
  LifeActivity,
} from "@/types/office";

export const CHARACTER_STATE_LABELS: Record<CharacterState, string> = {
  idle: "Đứng yên",
  walking: "Đi bộ",
  working: "Làm việc",
  handover: "Bàn giao",
  celebrating: "Ăn mừng",
};

export const EMOTION_LABELS: Record<EmotionType, string> = {
  idle: "Đứng yên",
  happy: "Vui vẻ",
  focused: "Tập trung",
  surprised: "Ngạc nhiên",
  celebrating: "Ăn mừng",
};

export const LIFE_ACTIVITY_LABELS: Record<LifeActivity, string> = {
  working: "Làm việc",
  wander: "Đi dạo",
  coffee: "Pha cà phê",
  visit: "Thăm phòng",
  meeting: "Họp",
  chat: "Trò chuyện",
};

/** Nhãn trạng thái nhân vật, mặc định "Làm việc" khi chưa có dữ liệu. */
export function stateLabel(value?: string | null): string {
  if (!value) return CHARACTER_STATE_LABELS.working;
  return (
    (CHARACTER_STATE_LABELS as Record<string, string>)[value] ?? value
  );
}

/** Nhãn hoạt động đời sống văn phòng, mặc định "Làm việc". */
export function activityLabel(value?: string | null): string {
  if (!value) return LIFE_ACTIVITY_LABELS.working;
  return (LIFE_ACTIVITY_LABELS as Record<string, string>)[value] ?? value;
}

/** Nhãn cảm xúc, trả về chuỗi gốc khi không khớp bảng. */
export function emotionLabel(value?: string | null): string {
  if (!value) return "";
  return (EMOTION_LABELS as Record<string, string>)[value] ?? value;
}
