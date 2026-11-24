import * as THREE from "three";

/**
 * Global facing offset (radians).
 * Convention: Character local front is +Z, so default offset is 0.
 */
export const FACING_OFFSET = 0;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const _targetQuat = new THREE.Quaternion();

/**
 * Smoothly rotates a Three.js Object3D around the Y axis to face `targetPoint`
 * using yaw = Math.atan2(dx, dz) + FACING_OFFSET and speed-clamped quaternion slerp.
 */
export function faceTo(
  object: THREE.Object3D,
  targetPoint: { x: number; z: number },
  delta: number,
  maxTurnSpeed = 5.5
): number {
  const dx = targetPoint.x - object.position.x;
  const dz = targetPoint.z - object.position.z;
  if (dx * dx + dz * dz < 1e-6) return object.rotation.y;

  const targetYaw = Math.atan2(dx, dz) + FACING_OFFSET;
  _targetQuat.setFromAxisAngle(Y_AXIS, targetYaw);

  const angleDiff = object.quaternion.angleTo(_targetQuat);
  if (angleDiff < 1e-4) return targetYaw;

  const maxStep = Math.max(0.001, maxTurnSpeed * delta);
  const t = Math.min(1, maxStep / angleDiff);
  object.quaternion.slerp(_targetQuat, t);
  return targetYaw;
}

/**
 * Smoothly rotates an object toward a specific target yaw (radians) via clamped slerp.
 */
export function faceToYaw(
  object: THREE.Object3D,
  targetYaw: number,
  delta: number,
  maxTurnSpeed = 5.5
) {
  _targetQuat.setFromAxisAngle(Y_AXIS, targetYaw + FACING_OFFSET);
  const angleDiff = object.quaternion.angleTo(_targetQuat);
  if (angleDiff < 1e-4) return;
  const maxStep = Math.max(0.001, maxTurnSpeed * delta);
  const t = Math.min(1, maxStep / angleDiff);
  object.quaternion.slerp(_targetQuat, t);
}

/**
 * Live world-position registry updated inside useFrame (zero React re-renders)
 * so nearby characters can detect passersby within 2m and turn their heads.
 */
export interface LiveCharacterEntry {
  position: THREE.Vector3;
  isWalking: boolean;
}

export const characterRegistry = new Map<string, LiveCharacterEntry>();

/**
 * Validates that a character's facing yaw is at least 60° away from facing directly
 * into the back (-Z) or left (-X) outer walls.
 */
export function checkWallFacingAngle(facingYaw: number): {
  minAngleToWallDeg: number;
  isSafe: boolean;
} {
  const fx = Math.sin(facingYaw + FACING_OFFSET);
  const fz = Math.cos(facingYaw + FACING_OFFSET);

  // Outward wall directions: back wall is (0, -1), left wall is (-1, 0)
  const dotBackWall = THREE.MathUtils.clamp(-fz, -1, 1);
  const dotLeftWall = THREE.MathUtils.clamp(-fx, -1, 1);

  const angleToBackDeg = (Math.acos(dotBackWall) * 180) / Math.PI;
  const angleToLeftDeg = (Math.acos(dotLeftWall) * 180) / Math.PI;
  const minAngleToWallDeg = Math.round(Math.min(angleToBackDeg, angleToLeftDeg));

  return {
    minAngleToWallDeg,
    isSafe: minAngleToWallDeg >= 60,
  };
}
