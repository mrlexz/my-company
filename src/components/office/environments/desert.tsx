"use client";

import { GroundDisc } from "./shared";

/**
 * Sa mạc — cát vàng, xương rồng, 2 kim tự tháp, mặt trời to, ốc đảo
 * có cọ, cồn cát. Ánh sáng vàng ấm, trời cát.
 */

const CACTI: Array<{ pos: [number, number, number]; scale: number }> = [
  { pos: [-11, 0, -4], scale: 1.0 },
  { pos: [11, 0, -6], scale: 0.9 },
  { pos: [-10.5, 0, 6], scale: 1.1 },
  { pos: [6.5, 0, -10.5], scale: 0.95 },
];

/** Xương rồng: thân trụ + 2 tay ngang. */
function Cactus({
  position,
  scale,
}: {
  position: [number, number, number];
  scale: number;
}) {
  const green = "#5A8A4A";
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.76, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1.2, 6, 10]} />
        <meshStandardMaterial color={green} roughness={0.85} />
      </mesh>
      <mesh position={[-0.42, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />
        <meshStandardMaterial color={green} roughness={0.85} />
      </mesh>
      <mesh position={[0.42, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.12, 0.35, 4, 8]} />
        <meshStandardMaterial color={green} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Kim tự tháp 4 mặt (nón 4 cạnh), xoay 45° để đỉnh hướng chéo. */
function Pyramid({
  position,
  baseRadius,
  height,
}: {
  position: [number, number, number];
  baseRadius: number;
  height: number;
}) {
  return (
    <mesh position={[position[0], height / 2 - 0.14, position[2]]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
      <coneGeometry args={[baseRadius, height, 4]} />
      <meshStandardMaterial color="#D9B380" flatShading roughness={0.9} />
    </mesh>
  );
}

/** Cây cọ: thân nghiêng + 5 lá dẹt + 2 quả dừa. */
function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.76, 0]} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.8, 8]} />
        <meshStandardMaterial color="#8A6A45" roughness={0.9} />
      </mesh>
      {[0, 1.26, 2.51, 3.77, 5.03].map((a, i) => (
        <mesh
          key={i}
          position={[
            -0.25 + Math.cos(a) * 0.55,
            1.72,
            Math.sin(a) * 0.55,
          ]}
          rotation={[0, -a, 0.25]}
          scale={[1, 0.3, 0.5]}
        >
          <sphereGeometry args={[0.55, 10, 8]} />
          <meshStandardMaterial color="#5A8A4A" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[-0.2, 1.55, 0.15]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#8A6A45" roughness={0.85} />
      </mesh>
      <mesh position={[-0.32, 1.5, -0.05]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#8A6A45" roughness={0.85} />
      </mesh>
    </group>
  );
}

const DUNES: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
}> = [
  { pos: [-11, -0.3, 2], scale: [1.6, 0.5, 1.2] },
  { pos: [11, -0.3, -2], scale: [1.4, 0.45, 1.1] },
  { pos: [1.5, -0.3, -11], scale: [1.5, 0.5, 1.0] },
];

export function DesertEnvironment() {
  return (
    <group>
      <GroundDisc top="#E8C98F" mid="#C9A86A" low="#A9854E" base="#8A6A3E" />

      {/* Mặt trời to trên cao */}
      <mesh position={[16, 12, -12]}>
        <sphereGeometry args={[2.2, 20, 16]} />
        <meshStandardMaterial
          color="#FFE9A8"
          emissive="#FFD76A"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Kim tự tháp: lớn phía nam (đông), nhỏ phía đông */}
      <Pyramid position={[4.5, 0, 10]} baseRadius={1.6} height={1.9} />
      <Pyramid position={[10, 0, 5]} baseRadius={1.1} height={1.3} />

      {/* Ốc đảo + cọ */}
      <mesh position={[-4, -0.12, 10.3]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 0.06, 20]} />
        <meshStandardMaterial color="#7CC4DE" roughness={0.4} />
      </mesh>
      <PalmTree position={[-5.5, 0, 9]} />

      {/* Xương rồng */}
      {CACTI.map((c, i) => (
        <Cactus key={i} position={c.pos} scale={c.scale} />
      ))}

      {/* Cồn cát nửa chìm */}
      {DUNES.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale} receiveShadow>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color="#D9B380" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
