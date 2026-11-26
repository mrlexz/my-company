"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { InstancedMesh } from "three";
import {
  FloatingCloud,
  GroundDisc,
  RoundTrees,
  type CloudConfig,
  type TreeSpot,
} from "./shared";

/**
 * Sở thú — cỏ xanh, hàng rào gỗ vòng quanh đảo (chừa lối đi phía nam),
 * voi, hươu cao cổ, sư tử, chim cánh cụt chibi ghép từ hình khối,
 * hồ nước nhỏ, cây tán tròn, mây trôi.
 */

const FENCE_RADIUS = 12.3;
const FENCE_GAP_START = (60 * Math.PI) / 180; // phía nam (+z): 60°..120°
const FENCE_GAP_END = (120 * Math.PI) / 180;
const FENCE_STEP = (15 * Math.PI) / 180;

/** Hàng rào gỗ instanced: cọc + 2 thanh ngang nối các cọc liên tiếp. */
function ZooFence() {
  const postRef = useRef<InstancedMesh>(null);
  const railRef = useRef<InstancedMesh>(null);

  const { posts, rails, chord } = useMemo(() => {
    const posts: Array<{ pos: [number, number, number] }> = [];
    const rails: Array<{
      pos: [number, number, number];
      rotY: number;
    }> = [];
    const angles: number[] = [];
    for (let a = FENCE_GAP_END; a <= FENCE_GAP_START + Math.PI * 2 + 1e-6; a += FENCE_STEP) {
      angles.push(a);
    }
    angles.forEach((a) => {
      posts.push({
        pos: [FENCE_RADIUS * Math.cos(a), 0.36, FENCE_RADIUS * Math.sin(a)],
      });
    });
    const chord = 2 * FENCE_RADIUS * Math.sin(FENCE_STEP / 2);
    for (let i = 0; i < angles.length - 1; i++) {
      const mid = (angles[i] + angles[i + 1]) / 2;
      const rMid = FENCE_RADIUS * Math.cos(FENCE_STEP / 2);
      const pos: [number, number, number] = [
        rMid * Math.cos(mid),
        0,
        rMid * Math.sin(mid),
      ];
      // Thanh ngang dọc theo dây cung: hướng dây cung = mid + 90°.
      const rotY = -(mid + Math.PI / 2);
      rails.push({ pos: [pos[0], 0.45, pos[2]], rotY });
      rails.push({ pos: [pos[0], 0.8, pos[2]], rotY });
    }
    return { posts, rails, chord };
  }, []);

  const geoms = useMemo(
    () => ({
      post: new THREE.CylinderGeometry(0.07, 0.07, 1.0, 8),
      rail: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );
  const mats = useMemo(
    () => ({
      wood: new THREE.MeshStandardMaterial({
        color: "#8A6A45",
        roughness: 0.85,
      }),
    }),
    [],
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();
    posts.forEach((p, i) => {
      dummy.position.set(p.pos[0], p.pos[1], p.pos[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      postRef.current?.setMatrixAt(i, dummy.matrix);
    });
    rails.forEach((r, i) => {
      dummy.position.set(r.pos[0], r.pos[1], r.pos[2]);
      dummy.rotation.set(0, r.rotY, 0);
      dummy.scale.set(chord, 0.07, 0.05);
      dummy.updateMatrix();
      railRef.current?.setMatrixAt(i, dummy.matrix);
    });
    [postRef, railRef].forEach((ref) => {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    });
  }, [posts, rails, chord]);

  useEffect(
    () => () => {
      Object.values(geoms).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geoms, mats],
  );

  return (
    <group>
      <instancedMesh
        ref={postRef}
        args={[geoms.post, mats.wood, posts.length]}
        castShadow
      />
      <instancedMesh
        ref={railRef}
        args={[geoms.rail, mats.wood, rails.length]}
        castShadow
      />
    </group>
  );
}

/** Voi chibi — mặt hướng về văn phòng (+x). */
function Elephant({ position }: { position: [number, number, number] }) {
  const gray = "#9AA3B0";
  return (
    <group position={position}>
      {/* Thân */}
      <mesh position={[0, 0.95, 0]} scale={[1.35, 1, 1]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={gray} roughness={0.85} />
      </mesh>
      {/* Đầu + vòi + tai */}
      <mesh position={[1.0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.55, 14, 12]} />
        <meshStandardMaterial color={gray} roughness={0.85} />
      </mesh>
      <mesh position={[1.45, 0.65, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.14, 0.7, 4, 8]} />
        <meshStandardMaterial color={gray} roughness={0.85} />
      </mesh>
      <mesh position={[0.7, 1.2, 0.5]} scale={[0.35, 0.5, 0.12]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#8A93A0" roughness={0.85} />
      </mesh>
      <mesh position={[0.7, 1.2, -0.5]} scale={[0.35, 0.5, 0.12]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#8A93A0" roughness={0.85} />
      </mesh>
      {/* 4 chân + đuôi */}
      {[
        [0.6, 0.45],
        [0.6, -0.45],
        [-0.6, 0.45],
        [-0.6, -0.45],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 8]} />
          <meshStandardMaterial color={gray} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[-1.35, 1.0, 0]} rotation={[0, 0, 0.6]} castShadow>
        <capsuleGeometry args={[0.05, 0.5, 4, 6]} />
        <meshStandardMaterial color={gray} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Hươu cao cổ chibi — mặt hướng về văn phòng (-x). */
function Giraffe({ position }: { position: [number, number, number] }) {
  const body = "#D9A45B";
  const spot = "#8A5A2A";
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]} scale={[1.2, 0.85, 0.75]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* Đốm */}
      {[
        [0.3, 1.6, 0.5],
        [-0.4, 1.5, -0.5],
        [0.6, 1.2, -0.4],
        [-0.1, 1.7, 0.2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} scale={[0.22, 0.16, 0.08]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={spot} roughness={0.85} />
        </mesh>
      ))}
      {/* Cổ + đầu + sừng nhỏ */}
      <mesh position={[-0.75, 2.2, 0]} rotation={[0, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 1.5, 10]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      <mesh position={[-1.25, 3.0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.35]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      <mesh position={[-1.35, 3.28, 0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
        <meshStandardMaterial color={spot} roughness={0.85} />
      </mesh>
      <mesh position={[-1.35, 3.28, -0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
        <meshStandardMaterial color={spot} roughness={0.85} />
      </mesh>
      {/* 4 chân + đuôi */}
      {[
        [0.55, 0.3],
        [0.55, -0.3],
        [-0.55, 0.3],
        [-0.55, -0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.55, z]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 1.1, 8]} />
          <meshStandardMaterial color={body} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0.95, 1.3, 0]} rotation={[0, 0, -0.5]} castShadow>
        <capsuleGeometry args={[0.05, 0.5, 4, 6]} />
        <meshStandardMaterial color={spot} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Sư tử chibi — mặt hướng về văn phòng (xoay -90° để đầu hướng -z). */
function Lion({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) {
  const body = "#D9A45B";
  const mane = "#B06A28";
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.85, 0]} scale={[1.05, 0.85, 0.8]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* Bờm + đầu + tai */}
      <mesh position={[-0.75, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.62, 14, 12]} />
        <meshStandardMaterial color={mane} roughness={0.9} />
      </mesh>
      <mesh position={[-0.95, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.42, 14, 12]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      <mesh position={[-0.85, 1.45, 0.28]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      <mesh position={[-0.85, 1.45, -0.28]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 4 chân + đuôi có chùm lông */}
      {[
        [0.55, 0.32],
        [0.55, -0.32],
        [-0.55, 0.32],
        [-0.55, -0.32],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.38, z]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.75, 8]} />
          <meshStandardMaterial color={body} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[1.05, 0.9, 0]} rotation={[0, 0, -0.7]} castShadow>
        <capsuleGeometry args={[0.05, 0.55, 4, 6]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      <mesh position={[1.32, 0.62, 0]}>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color={mane} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Chim cánh cụt chibi — mặt hướng bắc (-z). */
function Penguin({
  position,
  rotationY,
}: {
  position: [number, number, number];
  rotationY: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.42, 0.7, 6, 12]} />
        <meshStandardMaterial color="#2C303A" roughness={0.85} />
      </mesh>
      {/* Bụng trắng */}
      <mesh position={[0, 0.7, 0.18]} scale={[0.3, 0.45, 0.15]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#F5F2EA" roughness={0.85} />
      </mesh>
      {/* Mỏ cam + mắt */}
      <mesh position={[0, 1.05, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.22, 8]} />
        <meshStandardMaterial color="#E8912D" roughness={0.8} />
      </mesh>
      <mesh position={[0.15, 1.15, 0.35]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
      </mesh>
      <mesh position={[-0.15, 1.15, 0.35]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
      </mesh>
      {/* Cánh + chân */}
      <mesh position={[0.45, 0.8, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.09, 0.4, 4, 8]} />
        <meshStandardMaterial color="#2C303A" roughness={0.85} />
      </mesh>
      <mesh position={[-0.45, 0.8, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.09, 0.4, 4, 8]} />
        <meshStandardMaterial color="#2C303A" roughness={0.85} />
      </mesh>
      <mesh position={[0.18, 0.05, 0.1]} scale={[1, 0.3, 1.4]}>
        <boxGeometry args={[0.18, 0.12, 0.24]} />
        <meshStandardMaterial color="#E8912D" roughness={0.8} />
      </mesh>
      <mesh position={[-0.18, 0.05, 0.1]} scale={[1, 0.3, 1.4]}>
        <boxGeometry args={[0.18, 0.12, 0.24]} />
        <meshStandardMaterial color="#E8912D" roughness={0.8} />
      </mesh>
    </group>
  );
}

const ROUND_TREES: TreeSpot[] = [
  { pos: [-10.5, -0.15, 4.5], scale: 0.95 },
  { pos: [11, -0.15, -1], scale: 0.9 },
  { pos: [-5.5, -0.15, -10], scale: 0.9 },
];

const CLOUDS: CloudConfig[] = [
  { position: [-13, 4, -6], scale: 1.2, speed: 0.24, phase: 0.6 },
  { position: [13, 5, 6], scale: 1.1, speed: 0.26, phase: 1.9 },
  { position: [-4, 6, -13], scale: 1.3, speed: 0.2, phase: 3.2 },
  { position: [6, 4.5, 13], scale: 1.0, speed: 0.25, phase: 4.5 },
];

export function ZooEnvironment() {
  return (
    <group>
      <GroundDisc />

      <ZooFence />

      {/* Hồ nước nhỏ (phía nam, cạnh chim cánh cụt) */}
      <mesh position={[-3, -0.12, 10]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.4, 0.06, 20]} />
        <meshStandardMaterial color="#7CC4DE" roughness={0.4} />
      </mesh>

      {/* Thú: voi tây, hươu đông, sư tử nam, cánh cụt tây-nam */}
      <Elephant position={[-10.6, 0, -2.5]} />
      <Giraffe position={[10.6, 0, 3]} />
      <Lion position={[6, 0, 10]} rotationY={-Math.PI / 2} />
      <Penguin position={[-7, 0, 9]} rotationY={Math.PI} />

      <RoundTrees trees={ROUND_TREES} />

      {CLOUDS.map((cloud, idx) => (
        <FloatingCloud key={idx} {...cloud} />
      ))}
    </group>
  );
}
