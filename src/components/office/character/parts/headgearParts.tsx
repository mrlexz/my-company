"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { HeadgearType } from "@/types/office";
import {
  getHoodGeometry,
  getWizardHatGeometry,
  METAL_MAT,
  OUTLINE_COLOR,
  OUTLINE_SCALE,
  VINYL_MAT,
} from "../geometryHelpers";

/**
 * Headgear library — returns a modular <group> mounted on the `head` socket.
 * Types: none, wizardHat, hood, headphones, glasses, roundGlasses, antennae, viewfinder
 */
export function renderHeadgear(
  type: HeadgearType,
  color: string,
  accentColor: string
) {
  switch (type) {
    case "none":
      return null;

    case "wizardHat": {
      const geom = getWizardHatGeometry();
      return (
        <group position={[0, 0.24, -0.02]} rotation={[-0.1, 0, 0.07]}>
          <mesh geometry={geom} castShadow receiveShadow>
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={geom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Accent ribbon band */}
          <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.23, 0.028, 8, 22]} />
            <meshStandardMaterial color={accentColor} {...VINYL_MAT} />
          </mesh>
        </group>
      );
    }

    case "hood": {
      const geom = getHoodGeometry();
      return (
        <group position={[0, 0.01, -0.03]}>
          <mesh geometry={geom} castShadow receiveShadow>
            <meshStandardMaterial
              color={color}
              side={THREE.DoubleSide}
              {...VINYL_MAT}
            />
          </mesh>
          <mesh geometry={geom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Thickened hood trim */}
          <mesh position={[0, 0.02, 0.12]} rotation={[0.12, 0, 0]}>
            <torusGeometry args={[0.31, 0.034, 8, 20, Math.PI * 1.15]} />
            <meshStandardMaterial color={accentColor} {...VINYL_MAT} />
          </mesh>
        </group>
      );
    }

    case "headphones":
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <torusGeometry args={[0.345, 0.036, 10, 24, Math.PI]} />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          {[-0.35, 0.35].map((x, idx) => (
            <group
              key={idx}
              position={[x, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <mesh castShadow>
                <capsuleGeometry args={[0.095, 0.035, 8, 12]} />
                <meshStandardMaterial color={accentColor} {...VINYL_MAT} />
              </mesh>
              <mesh position={[0, idx === 0 ? -0.04 : 0.04, 0]}>
                <torusGeometry args={[0.075, 0.025, 8, 16]} />
                <meshStandardMaterial color="#252830" {...VINYL_MAT} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case "glasses":
      return (
        <group position={[0, 0.015, 0.305]}>
          {[-0.105, 0.105].map((x, idx) => (
            <RoundedBox
              key={idx}
              args={[0.135, 0.095, 0.024]}
              radius={0.022}
              smoothness={3}
              position={[x, 0, 0]}
            >
              <meshStandardMaterial
                color={color}
                wireframe={false}
                transparent
                opacity={0.22}
                roughness={0.15}
              />
            </RoundedBox>
          ))}
          {/* Frame rims */}
          {[-0.105, 0.105].map((x, idx) => (
            <mesh key={`rim-${idx}`} position={[x, 0, 0.008]}>
              <torusGeometry args={[0.062, 0.013, 8, 12]} />
              <meshStandardMaterial color={accentColor} {...METAL_MAT} />
            </mesh>
          ))}
          <mesh position={[0, 0.01, 0.008]}>
            <capsuleGeometry args={[0.01, 0.06, 4, 8]} />
            <meshStandardMaterial color={accentColor} {...METAL_MAT} />
          </mesh>
        </group>
      );

    case "roundGlasses":
      return (
        <group position={[0, 0.015, 0.308]}>
          {[-0.108, 0.108].map((x, idx) => (
            <group key={idx} position={[x, 0, 0]}>
              <mesh>
                <torusGeometry args={[0.068, 0.013, 10, 22]} />
                <meshStandardMaterial color={accentColor} {...METAL_MAT} />
              </mesh>
              {/* Subtle tinted lens */}
              <mesh>
                <circleGeometry args={[0.058, 16]} />
                <meshPhysicalMaterial
                  color="#FFFDF7"
                  transparent
                  opacity={0.18}
                  clearcoat={1}
                  roughness={0.1}
                />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.008, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.009, 0.065, 4, 8]} />
            <meshStandardMaterial color={accentColor} {...METAL_MAT} />
          </mesh>
        </group>
      );

    case "antennae":
      return (
        <group>
          {[-0.14, 0.14].map((x, idx) => (
            <group
              key={idx}
              position={[x, 0.25, 0]}
              rotation={[0, 0, idx === 0 ? 0.26 : -0.26]}
            >
              <mesh position={[0, 0.1, 0]} castShadow>
                <capsuleGeometry args={[0.02, 0.16, 6, 8]} />
                <meshStandardMaterial color={color} {...VINYL_MAT} />
              </mesh>
              <mesh position={[0, 0.22, 0]} castShadow>
                <sphereGeometry args={[0.058, 12, 12]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={0.4}
                  roughness={0.45}
                />
              </mesh>
            </group>
          ))}
        </group>
      );

    case "viewfinder":
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <torusGeometry args={[0.33, 0.03, 8, 20, Math.PI]} />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          <group position={[0.12, 0.03, 0.3]}>
            <RoundedBox args={[0.17, 0.14, 0.15]} radius={0.03} smoothness={3} castShadow>
              <meshStandardMaterial color={color} {...VINYL_MAT} />
            </RoundedBox>
            <mesh position={[0, 0, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.045, 0.03, 6, 12]} />
              <meshPhysicalMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={0.4}
                clearcoat={1}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[-0.055, 0.05, 0.075]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color="#EF4444"
                emissive="#EF4444"
                emissiveIntensity={1.1}
              />
            </mesh>
          </group>
        </group>
      );
  }
}
