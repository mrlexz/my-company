import type { Department } from "@/types/office";

// Single-story 2x2 floor dimensions
export const BUILDING_WIDTH = 14.0;
export const BUILDING_DEPTH = 12.0;
export const OUTER_WALL_HEIGHT = 2.65;
export const LOW_PARTITION_HEIGHT = 0.62; // ~40% of chibi character height
export const WALL_THICKNESS = 0.2;

// Camera presets: ~45° diagonal top-down view
export const INTRO_CAMERA_POSITION: [number, number, number] = [22, 29, 22];
export const INTRO_CAMERA_TARGET: [number, number, number] = [0, 0.4, 0];

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [13.5, 19.0, 13.5];
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0.6, 0];

// Mobile portrait framing: a portrait phone sees a much narrower horizontal
// slice of the office (horizontal FOV shrinks with aspect ratio), so the
// camera opens up and pulls back to keep the building in frame. Desktop
// framing is unchanged (aspect >= 1 keeps FOV 38 and scale 1).
export const DESKTOP_FOV = 38;
export const PORTRAIT_FOV = 52;

/** Vertical FOV for the current viewport aspect: wider on portrait phones. */
export function cameraFovForAspect(aspect: number): number {
  return aspect < 1 ? PORTRAIT_FOV : DESKTOP_FOV;
}

/**
 * Factor by which a camera offset (position - target) must be scaled so a
 * subject of `halfWidth` world units fits horizontally at the given aspect
 * and vertical FOV. Visible half-width at distance d is
 * d * tan(vfov/2) * aspect, so the distance must be at least
 * halfWidth / (tan(vfov/2) * aspect). Never below 1.
 */
export function fitCameraScale(
  aspect: number,
  vfovDeg: number,
  baseDistance: number,
  halfWidth: number,
): number {
  if (aspect >= 1 || baseDistance <= 0) return 1;
  const halfTan = Math.tan((vfovDeg * Math.PI) / 360);
  const needed = halfWidth / (halfTan * aspect);
  return Math.min(2.4, Math.max(1, needed / baseDistance));
}

/**
 * Scale a camera preset's position away from its target so the subject fits
 * on portrait screens. Returns the original position on desktop aspect.
 */
export function adaptCameraPreset(
  position: [number, number, number],
  target: [number, number, number],
  aspect: number,
  halfWidth: number,
): [number, number, number] {
  const dx = position[0] - target[0];
  const dy = position[1] - target[1];
  const dz = position[2] - target[2];
  const base = Math.hypot(dx, dy, dz);
  const scale = fitCameraScale(
    aspect,
    cameraFovForAspect(aspect),
    base,
    halfWidth,
  );
  if (scale === 1) return position;
  return [
    target[0] + dx * scale,
    target[1] + dy * scale,
    target[2] + dz * scale,
  ];
}

// Constrained azimuth ±35° around 45° diagonal
export const CAMERA_BASE_AZIMUTH = Math.PI / 4;
export const CAMERA_AZIMUTH_LIMIT = (35 * Math.PI) / 180;

export interface CameraFocusPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export interface ComputedRoom {
  department: Department;
  position: [number, number, number];
  width: number;
  depth: number;
  labelPosition: [number, number, number];
  cameraFocus: CameraFocusPreset;
}

/**
 * Computes 3D room placement directly from each department's 2D `position` and `rect` in office.json.
 */
export function computeOfficeRooms(departments: Department[]): ComputedRoom[] {
  return departments.map((dept) => {
    const [cx, cz] = dept.position;
    const [, , width, depth] = dept.rect;

    return {
      department: dept,
      position: [cx, 0, cz],
      width,
      depth,
      labelPosition: [0, 2.25, 0],
      cameraFocus: {
        position: [cx + 4.4, 6.2, cz + 5.2],
        target: [cx, 0.85, cz - 0.15],
      },
    };
  });
}
