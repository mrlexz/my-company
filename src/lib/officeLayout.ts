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
