"use client";

import { useEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, InstancedMesh } from "three";
import { METAL_MAT, VINYL_MAT } from "./character/geometryHelpers";
import { HoneyWoodMaterial } from "./furniture/furnitureCommon";

interface CloudConfig {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
}

const PINE_TREES: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [-9.8, -0.15, -4.6], scale: 1.15 },
  { pos: [-9.2, -0.15, 5.4], scale: 0.94 },
  { pos: [4.2, -0.15, -8.4], scale: 1.12 },
  { pos: [10.2, -0.15, 1.8], scale: 0.9 },
  { pos: [-5.8, -0.15, -8.5], scale: 1.02 },
];

const ROUND_TREES: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [-10.4, -0.15, 0.8], scale: 0.98 },
  { pos: [-2.2, -0.15, -8.6], scale: 1.16 },
  { pos: [9.6, -0.15, -5.2], scale: 1.02 },
  { pos: [8.8, -0.15, 5.8], scale: 0.9 },
];

const BUSHES: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [-7.8, -0.02, 5.4], scale: 1.0 },
  { pos: [-6.8, -0.05, 6.8], scale: 0.76 },
  { pos: [7.8, -0.03, 5.4], scale: 0.92 },
  { pos: [6.8, -0.06, 6.9], scale: 0.7 },
  { pos: [-8.6, -0.04, 2.8], scale: 0.84 },
  { pos: [8.8, -0.04, -1.6], scale: 0.8 },
  { pos: [-1.4, -0.05, -7.8], scale: 0.85 },
  { pos: [6.2, -0.04, -7.4], scale: 0.88 },
];

const PATH_STONES: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
  rotY: number;
}> = [
  { pos: [0.0, -0.12, 6.75], scale: [1.55, 0.1, 0.82], rotY: 0.03 },
  { pos: [0.18, -0.12, 7.85], scale: [1.4, 0.1, 0.76], rotY: -0.06 },
  { pos: [0.45, -0.12, 8.95], scale: [1.3, 0.1, 0.74], rotY: 0.08 },
  { pos: [0.8, -0.12, 10.0], scale: [1.2, 0.1, 0.7], rotY: -0.04 },
  { pos: [1.15, -0.12, 11.0], scale: [1.1, 0.1, 0.66], rotY: 0.05 },
  { pos: [1.45, -0.12, 11.9], scale: [1.0, 0.1, 0.62], rotY: -0.07 },
];

const SIDE_BOULDERS: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
}> = [
  { pos: [-9.8, -1.55, 5.2], scale: [1.2, 0.9, 0.95], rot: [0.2, 0.5, 0.1] },
  { pos: [9.2, -1.7, 6.1], scale: [1.3, 0.95, 1.0], rot: [-0.2, 1.1, 0.3] },
  { pos: [-1.8, -2.0, 10.2], scale: [1.4, 0.95, 0.9], rot: [0.3, 0.2, -0.2] },
  { pos: [10.8, -1.45, -1.4], scale: [1.1, 0.85, 1.1], rot: [0.1, -0.6, 0.2] },
  { pos: [-10.8, -1.65, -2.8], scale: [1.2, 0.85, 0.95], rot: [-0.1, 0.8, -0.1] },
];

const CLOUDS: CloudConfig[] = [
  { position: [-14.5, 2.0, -8.5], scale: 1.45, speed: 0.24, phase: 0.2 },
  { position: [-13.5, -2.2, 6.0], scale: 1.15, speed: 0.28, phase: 1.4 },
  { position: [15.0, 3.0, -7.5], scale: 1.35, speed: 0.22, phase: 2.3 },
  { position: [14.2, -2.6, 7.2], scale: 1.1, speed: 0.26, phase: 3.1 },
  { position: [-2.0, -3.6, 13.5], scale: 1.25, speed: 0.24, phase: 4.0 },
  { position: [4.5, 4.8, -14.0], scale: 1.5, speed: 0.2, phase: 5.1 },
  { position: [-8.5, 5.4, -12.5], scale: 1.18, speed: 0.27, phase: 0.9 },
  { position: [8.8, -4.0, -2.5], scale: 1.2, speed: 0.25, phase: 2.8 },
];

/** Instanced Pine & Round Trees + Bushes + Stepping Stones (memoized geometries & materials) */
function InstancedFoliageAndStones() {
  const pineTrunkRef = useRef<InstancedMesh>(null);
  const pineCone1Ref = useRef<InstancedMesh>(null);
  const pineCone2Ref = useRef<InstancedMesh>(null);
  const pineCone3Ref = useRef<InstancedMesh>(null);

  const roundTrunkRef = useRef<InstancedMesh>(null);
  const roundCrownRef = useRef<InstancedMesh>(null);
  const bushRef = useRef<InstancedMesh>(null);
  const stoneRef = useRef<InstancedMesh>(null);

  const geoms = useMemo(
    () => ({
      trunk: new THREE.CylinderGeometry(0.12, 0.18, 1.1, 7),
      cone1: new THREE.ConeGeometry(0.84, 1.35, 7),
      cone2: new THREE.ConeGeometry(0.64, 1.1, 7),
      cone3: new THREE.ConeGeometry(0.4, 0.78, 7),
      crown: new THREE.DodecahedronGeometry(0.82, 1),
      bush: new THREE.DodecahedronGeometry(0.42, 1),
      stone: new THREE.BoxGeometry(1, 1, 1),
    }),
    []
  );

  const mats = useMemo(
    () => ({
      trunk: new THREE.MeshStandardMaterial({
        color: "#7C5638",
        roughness: 0.88,
      }),
      pineDark: new THREE.MeshStandardMaterial({
        color: "#577B42",
        roughness: 0.84,
      }),
      pineMid: new THREE.MeshStandardMaterial({
        color: "#69904F",
        roughness: 0.84,
      }),
      pineLight: new THREE.MeshStandardMaterial({
        color: "#7CA55E",
        roughness: 0.84,
      }),
      roundLeaf: new THREE.MeshStandardMaterial({
        color: "#658D4B",
        roughness: 0.85,
      }),
      bushLeaf: new THREE.MeshStandardMaterial({
        color: "#769C52",
        roughness: 0.88,
      }),
      stone: new THREE.MeshStandardMaterial({
        color: "#DFD4BC",
        roughness: 0.9,
      }),
    }),
    []
  );

  useEffect(() => {
    const dummy = new THREE.Object3D();

    PINE_TREES.forEach((t, i) => {
      dummy.rotation.set(0, i * 0.9, 0);
      dummy.scale.setScalar(t.scale);

      dummy.position.set(t.pos[0], t.pos[1] + 0.55 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      pineTrunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 1.35 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      pineCone1Ref.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 2.05 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      pineCone2Ref.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 2.6 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      pineCone3Ref.current?.setMatrixAt(i, dummy.matrix);
    });

    ROUND_TREES.forEach((t, i) => {
      dummy.rotation.set(0, i * 1.2, 0);
      dummy.scale.setScalar(t.scale);

      dummy.position.set(t.pos[0], t.pos[1] + 0.55 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      roundTrunkRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.pos[0], t.pos[1] + 1.55 * t.scale, t.pos[2]);
      dummy.updateMatrix();
      roundCrownRef.current?.setMatrixAt(i, dummy.matrix);
    });

    BUSHES.forEach((b, i) => {
      dummy.position.set(b.pos[0], b.pos[1], b.pos[2]);
      dummy.rotation.set(0, i * 0.8, 0);
      dummy.scale.set(b.scale * 1.1, b.scale * 0.85, b.scale);
      dummy.updateMatrix();
      bushRef.current?.setMatrixAt(i, dummy.matrix);
    });

    PATH_STONES.forEach((s, i) => {
      dummy.position.set(s.pos[0], s.pos[1], s.pos[2]);
      dummy.rotation.set(0, s.rotY, 0);
      dummy.scale.set(s.scale[0], s.scale[1], s.scale[2]);
      dummy.updateMatrix();
      stoneRef.current?.setMatrixAt(i, dummy.matrix);
    });

    [
      pineTrunkRef,
      pineCone1Ref,
      pineCone2Ref,
      pineCone3Ref,
      roundTrunkRef,
      roundCrownRef,
      bushRef,
      stoneRef,
    ].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geoms).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    };
  }, [geoms, mats]);

  return (
    <group>
      <instancedMesh
        ref={pineTrunkRef}
        args={[geoms.trunk, mats.trunk, PINE_TREES.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineCone1Ref}
        args={[geoms.cone1, mats.pineDark, PINE_TREES.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineCone2Ref}
        args={[geoms.cone2, mats.pineMid, PINE_TREES.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineCone3Ref}
        args={[geoms.cone3, mats.pineLight, PINE_TREES.length]}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={roundTrunkRef}
        args={[geoms.trunk, mats.trunk, ROUND_TREES.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={roundCrownRef}
        args={[geoms.crown, mats.roundLeaf, ROUND_TREES.length]}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={bushRef}
        args={[geoms.bush, mats.bushLeaf, BUSHES.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={stoneRef}
        args={[geoms.stone, mats.stone, PATH_STONES.length]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

/** Outdoor Lantern Lamp Post flanking the pathway */
function LampPost({ position }: { position: [number, number, number] }) {
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

/** Wooden Welcome Signboard beside the pathway */
function WoodenSignboard({ position }: { position: [number, number, number] }) {
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

/** Puffy Slowly Drifting Cloud */
function FloatingCloud({ position, scale, speed, phase }: CloudConfig) {
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
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[0.92, -0.15, 0.12]}>
        <sphereGeometry args={[0.78, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[-0.86, -0.18, -0.12]}>
        <sphereGeometry args={[0.74, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[0.25, 0.42, -0.25]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#FAF7F0" roughness={0.95} />
      </mesh>
      <mesh position={[-0.36, -0.12, 0.54]}>
        <sphereGeometry args={[0.62, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
    </group>
  );
}

export function EnvironmentProps() {
  return (
    <group>
      {/* Floating Circular Island: Grass Top, Layered Soil & Side Rocks */}
      <group>
        <mesh position={[0, -0.35, 0]} receiveShadow>
          <cylinderGeometry args={[12.8, 13.0, 0.42, 24]} />
          <meshStandardMaterial color="#8EB162" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, -1.04, 0]} receiveShadow>
          <cylinderGeometry args={[12.7, 10.2, 1.0, 18]} />
          <meshStandardMaterial color="#9E7652" flatShading roughness={0.94} />
        </mesh>
        <mesh position={[0, -2.25, 0]}>
          <cylinderGeometry args={[9.8, 5.4, 1.5, 14]} />
          <meshStandardMaterial color="#7F6046" flatShading roughness={0.95} />
        </mesh>
        <mesh position={[0, -3.8, 0]}>
          <coneGeometry args={[5.2, 1.75, 10]} />
          <meshStandardMaterial color="#674F3B" flatShading roughness={0.95} />
        </mesh>

        {/* Faceted Side Boulders embedded along the cliff rim */}
        {SIDE_BOULDERS.map((b, i) => (
          <mesh
            key={i}
            position={b.pos}
            scale={b.scale}
            rotation={b.rot}
            receiveShadow
          >
            <dodecahedronGeometry args={[0.85, 0]} />
            <meshStandardMaterial color="#8E867B" flatShading roughness={0.94} />
          </mesh>
        ))}
      </group>

      {/* Instanced Trees, Bushes & Stepping Stones */}
      <InstancedFoliageAndStones />

      {/* Lamp Posts flanking the pathway */}
      <LampPost position={[-1.55, -0.14, 7.2]} />
      <LampPost position={[2.2, -0.14, 8.8]} />

      {/* Wooden Welcome Signboard */}
      <WoodenSignboard position={[-3.2, -0.14, 7.6]} />

      {/* Slowly Drifting Puffy Clouds */}
      {CLOUDS.map((cloud, idx) => (
        <FloatingCloud key={idx} {...cloud} />
      ))}
    </group>
  );
}
