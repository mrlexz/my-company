"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface SparkleParticlesProps {
  variant: "antennae" | "celebrating";
  position?: [number, number, number];
}

const SPARKLE_SEEDS = [
  { angle: 0, radius: 0.28, yOffset: 0.0, speed: 2.2, color: "#FFE875" },
  { angle: 1.05, radius: 0.36, yOffset: 0.14, speed: 2.7, color: "#D9FF7A" },
  { angle: 2.1, radius: 0.32, yOffset: -0.06, speed: 2.4, color: "#FFFDF5" },
  { angle: 3.15, radius: 0.38, yOffset: 0.2, speed: 2.9, color: "#FFD166" },
  { angle: 4.2, radius: 0.3, yOffset: 0.08, speed: 2.5, color: "#72CBE8" },
  { angle: 5.25, radius: 0.35, yOffset: 0.24, speed: 2.6, color: "#F497A9" },
];

/**
 * Lightweight procedural 3D sparkles (octahedron glints) orbiting around
 * Alien's antennae or bursting upward when any character is celebrating.
 */
export function SparkleParticles({
  variant,
  position = [0, 0, 0],
}: SparkleParticlesProps) {
  const groupRef = useRef<Group>(null);
  const count = variant === "antennae" ? 4 : 6;
  const seeds = SPARKLE_SEEDS.slice(0, count);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();

    group.children.forEach((child, idx) => {
      const s = seeds[idx];
      if (!s) return;

      if (variant === "antennae") {
        const theta = t * s.speed * 0.7 + s.angle;
        const r = s.radius * 0.72;
        child.position.set(
          Math.cos(theta) * r,
          s.yOffset + Math.sin(t * s.speed + s.angle) * 0.09,
          Math.sin(theta) * r
        );
        const pulse = 0.65 + Math.sin(t * 5.5 + s.angle) * 0.45;
        child.scale.setScalar(pulse);
        child.rotation.y = t * 3.0;
      } else {
        const theta = t * s.speed * 0.8 + s.angle;
        const rise = ((t * 0.85 + idx * 0.18) % 1) * 0.9;
        const r = s.radius * (0.95 + rise * 0.35);
        child.position.set(
          Math.cos(theta) * r,
          rise - 0.1,
          Math.sin(theta) * r
        );
        const fade = Math.sin(((t * 0.85 + idx * 0.18) % 1) * Math.PI);
        child.scale.setScalar(Math.max(0.01, fade * 1.15));
        child.rotation.x = t * 4;
        child.rotation.y = t * 3.5;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {seeds.map((s, idx) => (
        <mesh key={idx}>
          <octahedronGeometry args={[variant === "antennae" ? 0.026 : 0.036, 0]} />
          <meshStandardMaterial
            color={variant === "antennae" ? "#D9FF7A" : s.color}
            emissive={variant === "antennae" ? "#B8F25A" : s.color}
            emissiveIntensity={1.1}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
