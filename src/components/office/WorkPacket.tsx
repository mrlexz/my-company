"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Vec3 } from "@/lib/officePathfinding";

interface WorkPacketProps {
  from: Vec3;
  to: Vec3;
  color?: string;
  duration?: number;
}

/**
 * Stylized low-poly work parcel / envelope that arcs smoothly between two characters
 * during task handoffs in the workflow simulation.
 */
export function WorkPacket({
  from,
  to,
  color = "#E5B94E",
  duration = 1.6,
}: WorkPacketProps) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    elapsedRef.current = 0;
  }, [from, to]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    elapsedRef.current += Math.min(delta, 0.05);
    const rawT = Math.min(1, elapsedRef.current / duration);
    // Smooth easeInOutCubic
    const t =
      rawT < 0.5
        ? 4 * rawT * rawT * rawT
        : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

    const startY = from[1] + 1.25;
    const endY = to[1] + 1.25;
    const dist = Math.hypot(to[0] - from[0], to[2] - from[2]);
    const arcHeight = Math.min(3.4, 1.15 + dist * 0.22);

    const x = from[0] + (to[0] - from[0]) * t;
    const z = from[2] + (to[2] - from[2]) * t;
    const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * arcHeight;

    group.position.set(x, y, z);
    group.rotation.y = rawT * Math.PI * 3;
    group.rotation.z = Math.sin(rawT * Math.PI * 2) * 0.22;

    // Pop in at start, gently shrink at arrival
    const scale =
      rawT < 0.12
        ? rawT / 0.12
        : rawT > 0.88
          ? Math.max(0.001, (1 - rawT) / 0.12)
          : 1;
    group.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef} position={[from[0], from[1] + 1.25, from[2]]}>
      {/* Envelope / parcel box */}
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.28, 0.3]} />
        <meshStandardMaterial
          color="#FAF3DF"
          emissive="#FFF5D6"
          emissiveIntensity={0.25}
          roughness={0.5}
        />
      </mesh>
      {/* Accent ribbon wrap */}
      <mesh>
        <boxGeometry args={[0.44, 0.07, 0.32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          roughness={0.4}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[0.07, 0.3, 0.32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.65}
          roughness={0.4}
        />
      </mesh>
      {/* Wax seal / glowing badge on top */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 10]} />
        <meshStandardMaterial
          color="#3F5B2F"
          emissive="#5B8743"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
