/**
 * Ngoại cảnh (môi trường) của Dashboard 3D.
 *
 * Có 7 cảnh, xoay tự động mỗi ngày theo ngày trong năm (vòng 7 ngày):
 * Đảo xanh (hiện tại) -> Không gian -> Sở thú -> Rừng xanh -> Tuyết
 * -> Sa mạc -> Đại dương -> lại Đảo xanh.
 * Văn phòng công ty không đổi theo cảnh — chỉ thay đĩa đất ngoài trời,
 * đồ trang trí, màu nền/trời và tông ánh sáng.
 */

export type EnvironmentId =
  | "island"
  | "space"
  | "zoo"
  | "forest"
  | "snow"
  | "desert"
  | "ocean";

export interface EnvironmentLighting {
  /** Đèn ambient: màu + độ sáng (giữ nguyên giá trị hiện tại cho Đảo xanh). */
  ambientColor: string;
  ambientIntensity: number;
  /** Đèn hemisphere: màu trời / màu đất / độ sáng. */
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  /** Đèn mặt trời chính: màu + độ sáng. */
  sunColor: string;
  sunIntensity: number;
  /** Đèn fill ngược hướng: màu + độ sáng. */
  fillColor: string;
  fillIntensity: number;
}

export interface EnvironmentConfig {
  id: EnvironmentId;
  /** Nhãn tiếng Việt hiển thị (cho bộ chọn cảnh sau này). */
  label: string;
  /**
   * Màu nền trời của khung 3D. null = trong suốt, để nền kem của trang
   * hiện ra như bây giờ (chỉ Đảo xanh dùng null để giữ nguyên giao diện).
   */
  background: string | null;
  /** Màu sương mù xa (nên trùng màu nền để vật xa chìm vào trời). */
  fog: string;
  lighting: EnvironmentLighting;
}

export const ENVIRONMENT_ORDER: EnvironmentId[] = [
  "island",
  "space",
  "zoo",
  "forest",
  "snow",
  "desert",
  "ocean",
];

const ISLAND_LIGHTING: EnvironmentLighting = {
  ambientColor: "#FFF6E5",
  ambientIntensity: 0.44,
  hemiSky: "#FFF8EB",
  hemiGround: "#C9B08A",
  hemiIntensity: 0.62,
  sunColor: "#FFF0D6",
  sunIntensity: 1.45,
  fillColor: "#DCEAF8",
  fillIntensity: 0.35,
};

export const ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  island: {
    id: "island",
    label: "Đảo xanh",
    background: null,
    fog: "#F3ECDD",
    lighting: ISLAND_LIGHTING,
  },
  space: {
    id: "space",
    label: "Không gian",
    background: "#0B1026",
    fog: "#0B1026",
    lighting: {
      ambientColor: "#B9C8FF",
      ambientIntensity: 0.32,
      hemiSky: "#8FA8FF",
      hemiGround: "#2A3350",
      hemiIntensity: 0.5,
      sunColor: "#CFE0FF",
      sunIntensity: 1.1,
      fillColor: "#5A6FA8",
      fillIntensity: 0.3,
    },
  },
  zoo: {
    id: "zoo",
    label: "Sở thú",
    background: "#BFE3F0",
    fog: "#BFE3F0",
    lighting: {
      ambientColor: "#FFF6E5",
      ambientIntensity: 0.46,
      hemiSky: "#FFF8EB",
      hemiGround: "#B8C98A",
      hemiIntensity: 0.62,
      sunColor: "#FFF0D6",
      sunIntensity: 1.5,
      fillColor: "#DCEAF8",
      fillIntensity: 0.35,
    },
  },
  forest: {
    id: "forest",
    label: "Rừng xanh",
    background: "#CFE0C2",
    fog: "#CFE0C2",
    lighting: {
      ambientColor: "#F2F7E8",
      ambientIntensity: 0.42,
      hemiSky: "#EAF5E0",
      hemiGround: "#8A9A6A",
      hemiIntensity: 0.6,
      sunColor: "#FFF2CC",
      sunIntensity: 1.3,
      fillColor: "#C8D8B8",
      fillIntensity: 0.3,
    },
  },
  snow: {
    id: "snow",
    label: "Mùa đông tuyết",
    background: "#E8F1F8",
    fog: "#E8F1F8",
    lighting: {
      ambientColor: "#FFFFFF",
      ambientIntensity: 0.55,
      hemiSky: "#FFFFFF",
      hemiGround: "#B8C8DC",
      hemiIntensity: 0.7,
      sunColor: "#FFF8E8",
      sunIntensity: 1.6,
      fillColor: "#D8E4F5",
      fillIntensity: 0.4,
    },
  },
  desert: {
    id: "desert",
    label: "Sa mạc",
    background: "#F6DFB0",
    fog: "#F6DFB0",
    lighting: {
      ambientColor: "#FFF3D6",
      ambientIntensity: 0.5,
      hemiSky: "#FFF6DC",
      hemiGround: "#C8A06A",
      hemiIntensity: 0.62,
      sunColor: "#FFE9B0",
      sunIntensity: 1.7,
      fillColor: "#F0D8A8",
      fillIntensity: 0.3,
    },
  },
  ocean: {
    id: "ocean",
    label: "Đại dương",
    background: "#14608A",
    fog: "#14608A",
    lighting: {
      ambientColor: "#C8E8F5",
      ambientIntensity: 0.45,
      hemiSky: "#BFE0F0",
      hemiGround: "#2A5A6A",
      hemiIntensity: 0.6,
      sunColor: "#D8F0FF",
      sunIntensity: 1.2,
      fillColor: "#6AA8C8",
      fillIntensity: 0.35,
    },
  },
};

export function getEnvironmentConfig(id: EnvironmentId): EnvironmentConfig {
  return ENVIRONMENTS[id];
}

export function isEnvironmentId(value: string): value is EnvironmentId {
  return (ENVIRONMENT_ORDER as string[]).includes(value);
}

/**
 * Ngày thứ mấy trong năm (1..366), tính bằng lịch địa phương nhưng quy về
 * UTC để tránh lệch ngày khi đổi giờ mùa hè (DST).
 */
export function getDayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const day = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return Math.floor((day - start) / 86400000) + 1;
}

/** Cảnh của một ngày: xoay vòng 7 cảnh theo ngày trong năm. */
export function getEnvironmentIdForDate(date: Date): EnvironmentId {
  return ENVIRONMENT_ORDER[getDayOfYear(date) % ENVIRONMENT_ORDER.length];
}
