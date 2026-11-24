"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { AccessoryType } from "@/types/office";
import {
  getShieldGeometry,
  METAL_MAT,
  OUTLINE_COLOR,
  OUTLINE_SCALE,
  VINYL_MAT,
} from "../geometryHelpers";

/**
 * Accessories library — mounted onto whichever socket is specified in `attach`.
 * Types: badge, ring, gear, shield, headsetMic, cheekBandage, notebookStrap
 */
export function renderAccessory(type: AccessoryType, color: string) {
  switch (type) {
    case "badge":
      return (
        <group position={[0.11, 0.09, 0.23]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.024, 12]} />
            <meshStandardMaterial color={color} {...METAL_MAT} />
          </mesh>
          <mesh position={[0, 0, 0.014]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.01, 10]} />
            <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
          </mesh>
        </group>
      );

    case "ring":
      return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.055, 0.014, 8, 16]} />
          <meshStandardMaterial color={color} {...METAL_MAT} />
        </mesh>
      );

    case "gear":
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.17, 0.17, 0.055, 16]} />
            <meshStandardMaterial color={color} {...METAL_MAT} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.07, 10]} />
            <meshStandardMaterial color="#3A3148" {...METAL_MAT} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <RoundedBox
                key={i}
                args={[0.085, 0.058, 0.055]}
                radius={0.014}
                smoothness={2}
                position={[Math.cos(angle) * 0.19, Math.sin(angle) * 0.19, 0]}
                rotation={[0, 0, angle]}
                castShadow
              >
                <meshStandardMaterial color={color} {...METAL_MAT} />
              </RoundedBox>
            );
          })}
        </group>
      );

    case "shield": {
      const geom = getShieldGeometry();
      return (
        <group position={[0, -0.05, -0.06]}>
          <mesh geometry={geom} castShadow>
            <meshStandardMaterial color={color} {...METAL_MAT} />
          </mesh>
          <mesh geometry={geom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
        </group>
      );
    }

    case "headsetMic":
      return (
        <group position={[0.22, -0.06, 0.16]} rotation={[0, -0.5, -0.25]}>
          <mesh>
            <capsuleGeometry args={[0.012, 0.18, 4, 8]} />
            <meshStandardMaterial color="#252830" {...VINYL_MAT} />
          </mesh>
          <mesh position={[0, -0.1, 0.02]}>
            <sphereGeometry args={[0.026, 10, 10]} />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
        </group>
      );

    case "cheekBandage":
      return (
        <RoundedBox
          args={[0.085, 0.036, 0.014]}
          radius={0.008}
          smoothness={2}
          position={[0.14, -0.03, 0.295]}
          rotation={[0, 0.35, -0.22]}
        >
          <meshStandardMaterial color={color} {...VINYL_MAT} />
        </RoundedBox>
      );

    case "notebookStrap":
      return (
        <group rotation={[0, 0, 0.55]}>
          <mesh>
            <torusGeometry args={[0.24, 0.022, 8, 22]} />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
        </group>
      );
  }
}
