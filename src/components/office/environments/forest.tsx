"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import {
  FloatingCloud,
  GroundDisc,
  PineTrees,
  mulberry32,
  type CloudConfig,
  type TreeSpot,
} from "./shared";

/**
 * Rừng xanh — vòng thông dày quanh đảo (chừa lối đi phía nam), nấm đỏ,
 * đom đóm bay, mây trôi. Đất rêu xanh, sương nhẹ.
 */

const PINE_TREES: TreeSpot[] = [
  { pos: [-10.05, -0.15, 5.8], scale: 1.0 },
  { pos: [-10.6, -0.15, 1.9], scale: 1.15 },
  { pos: [-11.4, -0.15, -2.0], scale: 1.05 },
  { pos: [-10.05, -0.15, -5.8], scale: 1.1 },
  { pos: [-7.3, -0.15, -8.7], scale: 0.95 },
  { pos: [-3.8, -0.15, -10.3], scale: 1.2 },
  { pos: [0, -0.15, -11.6], scale: 1.0 },
  { pos: [3.7, -0.15, -10.15], scale: 1.15 },
  { pos: [7.3, -0.15, -8.7], scale: 1.0 },
  { pos: [10.05, -0.15, -5.8], scale: 1.05 },
  { pos: [11.4, -0.15, -2.0], scale: 1.1 },
  { pos: [10.6, -0.15, 1.9], scale: 0.95 },
  { pos: [10.05, -0.15, 5.8], scale: 1.0 },
  { pos: [6.5, -0.15, 9.3], scale: 1.05 },
];

const MUSHROOMS: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [-8.5, 0, 8.6], scale: 1.0 },
  { pos: [8.8, 0, 8.6], scale: 0.85 },
  { pos: [11.8, 0, -0.5], scale: 1.1 },
  { pos: [-11.8, 0, 0.5], scale: 0.9 },
  { pos: [3, 0, -11.5], scale: 1.0 },
];

/** Nấm đỏ chibi: thân trụ + mũ nửa cầu. */
function Mushroom({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.35, 8]} />
        <meshStandardMaterial color="#F5EFE0" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#D95F4B" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Đom đóm bay — 10 đốm sáng nhỏ dao động quanh vành đai cây. */
function Fireflies({ count = 10 }: { count?: number }) {
  const groupRef = useRef<Group>(null);

  const flies = useMemo(() => {
    const rand = mulberry32(20261127);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.5;
      const r = 9.5 + rand() * 2;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        y: 0.6 + rand() * 1.6,
        speed: 0.4 + rand() * 0.5,
        phase: rand() * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((child, i) => {
      const f = flies[i];
      child.position.set(
        f.x + Math.sin(t * f.speed + f.phase) * 0.6,
        f.y + Math.sin(t * f.speed * 1.3 + f.phase) * 0.35,
        f.z + Math.cos(t * f.speed * 0.8 + f.phase) * 0.6,
      );
    });
  });

  return (
    <group ref={groupRef}>
      {flies.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, f.z]}>
          <sphereGeometry args={[0.09, 8, 6]} />
          <meshStandardMaterial
            color="#D8F78A"
            emissive="#C8F06A"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

const CLOUDS: CloudConfig[] = [
  { position: [-13, 4.5, -7], scale: 1.2, speed: 0.24, phase: 0.4 },
  { position: [13, 5, -5], scale: 1.1, speed: 0.26, phase: 2.1 },
  { position: [0, 6, 13], scale: 1.3, speed: 0.2, phase: 3.6 },
];

export function ForestEnvironment() {
  return (
    <group>
      <GroundDisc top="#7FA35C" mid="#8A6A45" low="#6E5238" base="#54402E" />

      <PineTrees trees={PINE_TREES} />

      {MUSHROOMS.map((m, i) => (
        <Mushroom key={i} position={m.pos} scale={m.scale} />
      ))}

      <Fireflies />

      {CLOUDS.map((cloud, idx) => (
        <FloatingCloud key={idx} {...cloud} />
      ))}
    </group>
  );
}
