"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InstancedMesh } from "three";
import {
  Bushes,
  GroundDisc,
  LampPost,
  PineTrees,
  mulberry32,
  type TreeSpot,
} from "./shared";

/**
 * Mùa đông tuyết — đảo phủ tuyết trắng, thông phủ tuyết, 2 người tuyết,
 * tuyết rơi, đèn lồng ấm, bụi tuyết. Ánh sáng sáng lạnh.
 */

const SNOW_PINE_CONES: [string, string, string] = [
  "#FFFFFF",
  "#F0F6FC",
  "#E8F1F8",
];

const SNOW_PINES: TreeSpot[] = [
  { pos: [-10.5, -0.15, -4.5], scale: 1.1 },
  { pos: [10.5, -0.15, -5], scale: 1.0 },
  { pos: [-10.2, -0.15, 6], scale: 1.0 },
  { pos: [10.2, -0.15, 6], scale: 1.0 },
  { pos: [0, -0.15, -11.5], scale: 1.2 },
];

const SNOW_BUSHES: TreeSpot[] = [
  { pos: [-11, -0.02, -1], scale: 1.0 },
  { pos: [11, -0.02, 1.5], scale: 0.9 },
  { pos: [-6, -0.02, -11], scale: 0.85 },
  { pos: [6, -0.02, -11], scale: 0.9 },
  { pos: [-10, -0.02, 6.5], scale: 0.8 },
  { pos: [10, -0.02, 6.5], scale: 0.85 },
];

/** Người tuyết 3 tầng — mặt hướng `faceX` (+1 đông, -1 tây). */
function Snowman({
  position,
  faceX,
  withScarf,
  withHat,
}: {
  position: [number, number, number];
  faceX: 1 | -1;
  withScarf?: boolean;
  withHat?: boolean;
}) {
  return (
    <group position={position}>
      {/* 3 tầng thân */}
      <mesh position={[0, 0.41, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial color="#F8FBFF" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 12]} />
        <meshStandardMaterial color="#F8FBFF" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#F8FBFF" roughness={0.9} />
      </mesh>
      {/* Mũi cà rốt + mắt + cúc áo */}
      <mesh
        position={[faceX * 0.3, 1.8, 0]}
        rotation={[0, 0, faceX === 1 ? -Math.PI / 2 : Math.PI / 2]}
      >
        <coneGeometry args={[0.07, 0.3, 8]} />
        <meshStandardMaterial color="#E8912D" roughness={0.8} />
      </mesh>
      <mesh position={[faceX * 0.22, 1.88, 0.12]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
      </mesh>
      <mesh position={[faceX * 0.22, 1.88, -0.12]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
      </mesh>
      <mesh position={[faceX * 0.36, 1.3, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
      </mesh>
      <mesh position={[faceX * 0.38, 1.05, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
      </mesh>
      {/* Tay cành cây */}
      <mesh position={[0.5, 1.25, 0]} rotation={[0, 0, -1.1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <meshStandardMaterial color="#7C5638" roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 1.25, 0]} rotation={[0, 0, 1.1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
        <meshStandardMaterial color="#7C5638" roughness={0.9} />
      </mesh>
      {/* Khăn quàng đỏ */}
      {withScarf && (
        <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 8, 20]} />
          <meshStandardMaterial color="#C1292F" roughness={0.85} />
        </mesh>
      )}
      {/* Mũ top hat đen */}
      {withHat && (
        <group position={[0, 2.08, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.22, 12]} />
            <meshStandardMaterial color="#2C303A" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.03, 12]} />
            <meshStandardMaterial color="#2C303A" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Tuyết rơi — 90 bông instanced rơi vòng lặp trong trụ r 13, cao 0..9. */
function FallingSnow({ count = 90 }: { count?: number }) {
  const ref = useRef<InstancedMesh>(null);

  const geom = useMemo(() => new THREE.SphereGeometry(0.06, 6, 6), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        roughness: 0.9,
      }),
    [],
  );

  const flakes = useMemo(() => {
    const rand = mulberry32(20261128);
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 13;
      return {
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r,
        y: rand() * 9.2,
        speed: 0.5 + rand() * 0.5,
        phase: rand() * Math.PI * 2,
      };
    });
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    flakes.forEach((f, i) => {
      const y = -0.1 + (((f.y - t * f.speed) % 9.2) + 9.2) % 9.2;
      dummy.position.set(
        f.x + Math.sin(t * 0.5 + f.phase) * 0.3,
        y,
        f.z,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
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

export function SnowEnvironment() {
  return (
    <group>
      <GroundDisc top="#F4F8FF" mid="#B9D2E8" low="#9DBFE0" base="#7FA8CC" />

      <PineTrees trees={SNOW_PINES} coneColors={SNOW_PINE_CONES} />
      <Bushes bushes={SNOW_BUSHES} color="#FFFFFF" />

      {/* Người tuyết: tây có khăn, đông đội mũ */}
      <Snowman position={[-10, 0, 4]} faceX={1} withScarf />
      <Snowman position={[10.5, 0, -3.5]} faceX={-1} withHat />

      {/* Đèn lồng ấm hai bên lối đi */}
      <LampPost position={[-1.55, -0.14, 7.2]} />
      <LampPost position={[2.2, -0.14, 8.8]} />

      <FallingSnow />
    </group>
  );
}
