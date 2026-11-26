"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, InstancedMesh } from "three";
import { GroundDisc, mulberry32 } from "./shared";

/**
 * Đại dương — văn phòng dưới đáy biển: cát biển, san hô, rong biển
 * đung đưa, cá bơi trên cao, bọt khí nổi, sao biển. Nền xanh dương sâu.
 */

const CORALS: Array<{
  pos: [number, number, number];
  color: string;
  scale: number;
}> = [
  { pos: [-11, 0, -3], color: "#F2A0B5", scale: 1.0 },
  { pos: [11, 0, 4], color: "#F08A4B", scale: 1.1 },
  { pos: [-6, 0, -11], color: "#9A7BD0", scale: 0.9 },
  { pos: [7, 0, -10.5], color: "#F2A0B5", scale: 1.0 },
  { pos: [-11, 0, 6], color: "#F08A4B", scale: 0.85 },
];

/** San hô: 3 nhánh nón chụm lại. */
function Coral({
  position,
  color,
  scale,
}: {
  position: [number, number, number];
  color: string;
  scale: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.28, 1.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.28, 0.15]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-0.32, 0.24, -0.1]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.18, 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

const SEAWEED_SPOTS: Array<{
  pos: [number, number, number];
  phase: number;
}> = [
  { pos: [-10.5, 0, 1], phase: 0.4 },
  { pos: [10.8, 0, -1.5], phase: 1.3 },
  { pos: [-9, 0, -8.5], phase: 2.2 },
  { pos: [9, 0, -9], phase: 3.1 },
  { pos: [-9.5, 0, 8], phase: 4.0 },
  { pos: [9.5, 0, 8], phase: 4.9 },
  { pos: [0, 0, -12], phase: 5.6 },
];

/** Rong biển đung đưa theo dòng nước. */
function Seaweed() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((child, i) => {
      child.rotation.z = Math.sin(t * 0.8 + SEAWEED_SPOTS[i].phase) * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {SEAWEED_SPOTS.map((s, i) => (
        <mesh key={i} position={[s.pos[0], 0.55, s.pos[2]]}>
          <capsuleGeometry args={[0.09, 0.9, 4, 8]} />
          <meshStandardMaterial color="#3E7A4E" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

const FISH: Array<{
  radius: number;
  height: number;
  speed: number;
  phase: number;
  color: string;
  scale: number;
}> = [
  { radius: 11.0, height: 5.0, speed: 0.16, phase: 0.0, color: "#F2A541", scale: 1.0 },
  { radius: 10.6, height: 4.5, speed: -0.13, phase: 1.4, color: "#F2789F", scale: 0.85 },
  { radius: 11.4, height: 5.6, speed: 0.12, phase: 2.6, color: "#7CC4DE", scale: 1.1 },
  { radius: 10.8, height: 6.0, speed: -0.18, phase: 3.8, color: "#FFD166", scale: 0.9 },
  { radius: 11.2, height: 4.8, speed: 0.15, phase: 5.0, color: "#9A7BD0", scale: 0.95 },
];

/** Cá bơi vòng tròn trên cao (trên mái văn phòng), đầu hướng theo chiều bơi. */
function SwimmingFish() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((child, i) => {
      const f = FISH[i];
      const a = f.phase + t * f.speed;
      child.position.set(
        Math.cos(a) * f.radius,
        f.height,
        Math.sin(a) * f.radius,
      );
      // Đầu cá hướng theo chiều bơi: rotation.y = -a.
      child.rotation.set(0, -a, 0);
    });
  });

  return (
    <group ref={groupRef}>
      {FISH.map((f, i) => (
        <group key={i} scale={f.scale}>
          {/* Thân dài theo trục z, đầu hướng +z */}
          <mesh scale={[0.22, 0.28, 0.5]} castShadow>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color={f.color} roughness={0.8} />
          </mesh>
          {/* Đuôi */}
          <mesh position={[0, 0, -0.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.14, 0.25, 8]} />
            <meshStandardMaterial color={f.color} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Bọt khí nổi lên — 24 bong bóng instanced, vòng lặp y 0..9. */
function Bubbles({ count = 24 }: { count?: number }) {
  const ref = useRef<InstancedMesh>(null);

  const geom = useMemo(() => new THREE.SphereGeometry(0.07, 8, 6), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#E8F4FA",
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
      }),
    [],
  );

  const bubbles = useMemo(() => {
    const rand = mulberry32(20261129);
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 11;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        y: rand() * 9,
        speed: 0.4 + rand() * 0.5,
        phase: rand() * Math.PI * 2,
        scale: 0.7 + rand() * 0.6,
      };
    });
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    bubbles.forEach((b, i) => {
      const y = (((b.y + t * b.speed) % 9) + 9) % 9;
      dummy.position.set(
        b.x + Math.sin(t * 0.6 + b.phase) * 0.25,
        y,
        b.z,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(b.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  useEffect(
    () => () => {
      geom.dispose();
      mat.dispose();
    },
    [geom, mat],
  );

  return <instancedMesh ref={ref} args={[geom, mat, count]} />;
}

export function OceanEnvironment() {
  return (
    <group>
      <GroundDisc top="#D9C08A" mid="#B89A68" low="#8F7648" base="#6E5A38" />

      {CORALS.map((c, i) => (
        <Coral key={i} position={c.pos} color={c.color} scale={c.scale} />
      ))}

      <Seaweed />

      <SwimmingFish />

      <Bubbles />

      {/* Sao biển 5 cánh trên cát */}
      <mesh position={[9.5, -0.1, -6]} rotation={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 5]} />
        <meshStandardMaterial color="#E8912D" roughness={0.85} />
      </mesh>
    </group>
  );
}
