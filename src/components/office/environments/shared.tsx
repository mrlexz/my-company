"use client";

import { useEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, InstancedMesh } from "three";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import { HoneyWoodMaterial } from "../furniture/furnitureCommon";

/** Bộ sinh số giả ngẫu nhiên có seed — vị trí sao/tuyết/bọt khí ổn định mỗi lần render. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface TreeSpot {
  pos: [number, number, number];
  scale: number;
}

/**
 * Đĩa đất nổi (giữ nguyên hình học của đảo hiện tại: mặt trên y ≈ -0.14
 * để sàn văn phòng nằm vừa khít). Mỗi cảnh chỉ đổi màu các lớp.
 */
export function GroundDisc({
  top = "#8EB162",
  mid = "#9E7652",
  low = "#7F6046",
  base = "#674F3B",
}: {
  top?: string;
  mid?: string;
  low?: string;
  base?: string;
}) {
  return (
    <group>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[12.8, 13.0, 0.42, 24]} />
        <meshStandardMaterial color={top} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.04, 0]} receiveShadow>
        <cylinderGeometry args={[12.7, 10.2, 1.0, 18]} />
        <meshStandardMaterial color={mid} flatShading roughness={0.94} />
      </mesh>
      <mesh position={[0, -2.25, 0]}>
        <cylinderGeometry args={[9.8, 5.4, 1.5, 14]} />
        <meshStandardMaterial color={low} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, -3.8, 0]}>
        <coneGeometry args={[5.2, 1.75, 10]} />
        <meshStandardMaterial color={base} flatShading roughness={0.95} />
      </mesh>
    </group>
  );
}

const DEFAULT_PINE_CONES: [string, string, string] = [
  "#577B42",
  "#69904F",
  "#7CA55E",
];

/** Cây thông instanced — dùng chung cho Đảo xanh, Rừng, Tuyết (đổi màu tán). */
export function PineTrees({
  trees,
  coneColors = DEFAULT_PINE_CONES,
}: {
  trees: TreeSpot[];
  coneColors?: [string, string, string];
}) {
  const trunkRef = useRef<InstancedMesh>(null);
  const cone1Ref = useRef<InstancedMesh>(null);
  const cone2Ref = useRef<InstancedMesh>(null);
  const cone3Ref = useRef<InstancedMesh>(null);

  const geoms = useMemo(
    () => ({
      trunk: new THREE.CylinderGeometry(0.12, 0.18, 1.1, 7),
      cone1: new THREE.ConeGeometry(0.84, 1.35, 7),
      cone2: new THREE.ConeGeometry(0.64, 1.1, 7),
      cone3: new THREE.ConeGeometry(0.4, 0.78, 7),
    }),
    [],
  );

  const mats = useMemo(
    () => ({
      trunk: new THREE.MeshStandardMaterial({
        color: "#7C5638",
        roughness: 0.88,
      }),
      cone1: new THREE.MeshStandardMaterial({
        color: coneColors[0],
        roughness: 0.84,
      }),
      cone2: new THREE.MeshStandardMaterial({
        color: coneColors[1],
        roughness: 0.84,
      }),
      cone3: new THREE.MeshStandardMaterial({
        color: coneColors[2],
        roughness: 0.84,
      }),
    }),
    [coneColors],
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();
    trees.forEach((t, i) => {
      dummy.rotation.set(0, i * 0.9, 0);
      dummy.scale.setScalar(t.scale);

      dummy.position.set(t.pos[0], t.pos[1] + 0.55 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 1.35 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      cone1Ref.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 2.05 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      cone2Ref.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 2.6 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      cone3Ref.current?.setMatrixAt(i, dummy.matrix);
    });
    [trunkRef, cone1Ref, cone2Ref, cone3Ref].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, [trees]);

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
        ref={trunkRef}
        args={[geoms.trunk, mats.trunk, trees.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={cone1Ref}
        args={[geoms.cone1, mats.cone1, trees.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={cone2Ref}
        args={[geoms.cone2, mats.cone2, trees.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={cone3Ref}
        args={[geoms.cone3, mats.cone3, trees.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/** Cây tán tròn instanced — dùng chung cho Đảo xanh, Sở thú. */
export function RoundTrees({
  trees,
  crownColor = "#658D4B",
}: {
  trees: TreeSpot[];
  crownColor?: string;
}) {
  const trunkRef = useRef<InstancedMesh>(null);
  const crownRef = useRef<InstancedMesh>(null);

  const geoms = useMemo(
    () => ({
      trunk: new THREE.CylinderGeometry(0.12, 0.18, 1.1, 7),
      crown: new THREE.DodecahedronGeometry(0.82, 1),
    }),
    [],
  );

  const mats = useMemo(
    () => ({
      trunk: new THREE.MeshStandardMaterial({
        color: "#7C5638",
        roughness: 0.88,
      }),
      crown: new THREE.MeshStandardMaterial({
        color: crownColor,
        roughness: 0.85,
      }),
    }),
    [crownColor],
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();
    trees.forEach((t, i) => {
      dummy.rotation.set(0, i * 1.2, 0);
      dummy.scale.setScalar(t.scale);

      dummy.position.set(t.pos[0], t.pos[1] + 0.55 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 1.55 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      crownRef.current?.setMatrixAt(i, dummy.matrix);
    });
    [trunkRef, crownRef].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, [trees]);

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
        ref={trunkRef}
        args={[geoms.trunk, mats.trunk, trees.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={crownRef}
        args={[geoms.crown, mats.crown, trees.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/** Bụi cây instanced. */
export function Bushes({
  bushes,
  color = "#769C52",
}: {
  bushes: TreeSpot[];
  color?: string;
}) {
  const bushRef = useRef<InstancedMesh>(null);

  const geoms = useMemo(
    () => ({ bush: new THREE.DodecahedronGeometry(0.42, 1) }),
    [],
  );
  const mats = useMemo(
    () => ({
      bush: new THREE.MeshStandardMaterial({ color, roughness: 0.88 }),
    }),
    [color],
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();
    bushes.forEach((b, i) => {
      dummy.position.set(b.pos[0], b.pos[1], b.pos[2]);
      dummy.rotation.set(0, i * 0.8, 0);
      dummy.scale.set(b.scale * 1.1, b.scale * 0.85, b.scale);
      dummy.updateMatrix();
      bushRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (bushRef.current) bushRef.current.instanceMatrix.needsUpdate = true;
  }, [bushes]);

  useEffect(
    () => () => {
      Object.values(geoms).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geoms, mats],
  );

  return (
    <instancedMesh
      ref={bushRef}
      args={[geoms.bush, mats.bush, bushes.length]}
      castShadow
      receiveShadow
    />
  );
}

/** Đá lát đường instanced. */
export function PathStones({
  stones,
}: {
  stones: Array<{
    pos: [number, number, number];
    scale: [number, number, number];
    rotY: number;
  }>;
}) {
  const stoneRef = useRef<InstancedMesh>(null);

  const geoms = useMemo(
    () => ({ stone: new THREE.BoxGeometry(1, 1, 1) }),
    [],
  );
  const mats = useMemo(
    () => ({
      stone: new THREE.MeshStandardMaterial({
        color: "#DFD4BC",
        roughness: 0.9,
      }),
    }),
    [],
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();
    stones.forEach((s, i) => {
      dummy.position.set(s.pos[0], s.pos[1], s.pos[2]);
      dummy.rotation.set(0, s.rotY, 0);
      dummy.scale.set(s.scale[0], s.scale[1], s.scale[2]);
      dummy.updateMatrix();
      stoneRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (stoneRef.current) stoneRef.current.instanceMatrix.needsUpdate = true;
  }, [stones]);

  useEffect(
    () => () => {
      Object.values(geoms).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
    [geoms, mats],
  );

  return (
    <instancedMesh
      ref={stoneRef}
      args={[geoms.stone, mats.stone, stones.length]}
      castShadow
      receiveShadow
    />
  );
}

/** Cột đèn lồng ngoài trời, hai bên lối đi (Đảo xanh, Tuyết). */
export function LampPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.16, 10]} />
        <meshStandardMaterial color="#343844" {...METAL_MAT} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <capsuleGeometry args={[0.04, 1.75, 6, 8]} />
        <meshStandardMaterial color="#2C303A" {...METAL_MAT} />
      </mesh>
      {/* Glowing warm lantern head */}
      <mesh position={[0, 1.98, 0]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial
          color="#FFF8E0"
          emissive="#FFE196"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 2.14, 0]} castShadow>
        <coneGeometry args={[0.2, 0.14, 10]} />
        <meshStandardMaterial color="#2C303A" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

/** Biển gỗ chào mừng bên lối đi (Đảo xanh). */
export function WoodenSignboard({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0, -0.35, 0]}>
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.58, 0]} castShadow>
          <capsuleGeometry args={[0.048, 1.15, 6, 8]} />
          <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
        </mesh>
      ))}
      <RoundedBox
        args={[1.3, 0.65, 0.1]}
        radius={0.03}
        smoothness={3}
        position={[0, 0.92, 0]}
        castShadow
      >
        <HoneyWoodMaterial />
      </RoundedBox>
      <RoundedBox
        args={[1.14, 0.5, 0.025]}
        radius={0.015}
        smoothness={2}
        position={[0, 0.92, 0.055]}
      >
        <meshStandardMaterial color="#FCF9F2" {...VINYL_MAT} />
      </RoundedBox>
      {/* Moss-green emblem crest on signboard */}
      <mesh position={[-0.34, 0.92, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 6]} />
        <meshStandardMaterial color="#3F5B2F" {...VINYL_MAT} />
      </mesh>
      <RoundedBox
        args={[0.52, 0.07, 0.018]}
        radius={0.01}
        smoothness={2}
        position={[0.16, 0.98, 0.075]}
      >
        <meshStandardMaterial color="#3F5B2F" {...VINYL_MAT} />
      </RoundedBox>
      <RoundedBox
        args={[0.42, 0.05, 0.018]}
        radius={0.01}
        smoothness={2}
        position={[0.11, 0.85, 0.075]}
      >
        <meshStandardMaterial color="#8F653E" {...VINYL_MAT} />
      </RoundedBox>
    </group>
  );
}

export interface CloudConfig {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
}

/** Đám mây phồng trôi chậm (Đảo xanh, Sở thú, Rừng). */
export function FloatingCloud({
  position,
  scale,
  speed,
  phase,
  color = "#FFFFFF",
}: CloudConfig & { color?: string }) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.24;
    ref.current.position.x =
      position[0] + Math.cos(t * speed * 0.45 + phase) * 0.35;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1.05, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0.92, -0.15, 0.12]}>
        <sphereGeometry args={[0.78, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[-0.86, -0.18, -0.12]}>
        <sphereGeometry args={[0.74, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0.25, 0.42, -0.25]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#FAF7F0" roughness={0.95} />
      </mesh>
      <mesh position={[-0.36, -0.12, 0.54]}>
        <sphereGeometry args={[0.62, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}
