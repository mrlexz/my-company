"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, InstancedMesh } from "three";
import { GroundDisc, mulberry32 } from "./shared";

/**
 * Không gian — văn phòng nổi trên mặt trăng: đĩa đá xám có hố, sao,
 * hành tinh có vành, thiên thạch trôi. Nền tối + ánh sáng xanh lạnh
 * (xem cấu hình "space" trong lib/environments.ts).
 */

const CRATERS: Array<{
  pos: [number, number, number];
  radius: number;
}> = [
  { pos: [-10, -0.13, 3], radius: 0.9 },
  { pos: [10.5, -0.13, -3.5], radius: 1.1 },
  { pos: [-4, -0.13, -10.5], radius: 0.7 },
  { pos: [5, -0.13, 10.8], radius: 0.8 },
  { pos: [11, -0.13, 6], radius: 0.6 },
];

/** Bầu trời sao instanced — basic material, không bị sương mù làm mờ. */
function StarField({ count = 140 }: { count?: number }) {
  const ref = useRef<InstancedMesh>(null);

  const geom = useMemo(() => new THREE.SphereGeometry(0.09, 6, 6), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FFFFFF",
        fog: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => {
    const rand = mulberry32(20261126);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      // Vỏ cầu quanh đảo: bán kính 20-32, cao -4..16.
      const theta = rand() * Math.PI * 2;
      const y = -4 + rand() * 20;
      const r = 20 + rand() * 12;
      dummy.position.set(
        Math.cos(theta) * r,
        y,
        Math.sin(theta) * r,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.7 + rand() * 0.9);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  useEffect(
    () => () => {
      geom.dispose();
      mat.dispose();
    },
    [geom, mat],
  );

  return <instancedMesh ref={ref} args={[geom, mat, count]} />;
}

/** Hành tinh có vành xoay chậm. */
function RingedPlanet({
  position,
}: {
  position: [number, number, number];
}) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[2.4, 24, 18]} />
        <meshStandardMaterial color="#D8A24A" roughness={0.85} />
      </mesh>
      <mesh rotation={[1.15, 0, 0.3]}>
        <torusGeometry args={[3.4, 0.32, 8, 48]} />
        <meshStandardMaterial color="#E8C87A" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Thiên thạch trôi như mây (dao động sin theo thời gian). */
function DriftingAsteroid({
  position,
  scale,
  speed,
  phase,
  color,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  color: string;
}) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.3;
    ref.current.position.x =
      position[0] + Math.cos(t * speed * 0.45 + phase) * 0.4;
    ref.current.rotation.y = phase + t * 0.03;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.95} />
      </mesh>
    </group>
  );
}

const ASTEROIDS: Array<{
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  color: string;
}> = [
  { position: [-15, 3, 6], scale: 0.8, speed: 0.2, phase: 0.5, color: "#7A6A5A" },
  { position: [16, 4, -6], scale: 0.65, speed: 0.24, phase: 1.8, color: "#8A7A6A" },
  { position: [-6, 5, 15], scale: 0.9, speed: 0.18, phase: 3.0, color: "#6A5A4A" },
  { position: [8, 2.5, -16], scale: 0.55, speed: 0.26, phase: 4.2, color: "#7A6A5A" },
];

export function SpaceEnvironment() {
  return (
    <group>
      {/* Mặt trăng: đĩa đá xám + hố va chạm */}
      <GroundDisc top="#6E7686" mid="#565D6D" low="#454B59" base="#353A46" />
      {CRATERS.map((c, i) => (
        <mesh
          key={i}
          position={c.pos}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[c.radius, 20]} />
          <meshStandardMaterial color="#4A5160" roughness={0.95} />
        </mesh>
      ))}

      <StarField />

      {/* Hành tinh có vành + mặt trăng nhỏ */}
      <RingedPlanet position={[-17, 7, -13]} />
      <mesh position={[15, 9, -14]}>
        <sphereGeometry args={[0.9, 16, 12]} />
        <meshStandardMaterial color="#B8BCC8" roughness={0.9} />
      </mesh>

      {/* Thiên thạch trôi */}
      {ASTEROIDS.map((a, i) => (
        <DriftingAsteroid key={i} {...a} />
      ))}
    </group>
  );
}
