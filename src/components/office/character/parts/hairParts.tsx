"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { HairStyle } from "@/types/office";
import {
  getHairLockGeometry,
  OUTLINE_COLOR,
  OUTLINE_SCALE,
  VINYL_MAT,
} from "../geometryHelpers";

/**
 * Hair library — returns a modular <group> mounted on the `head` socket.
 * Styles: shortSlick, ponytail, curly, bald, pixelBlock, pixelSpiky, bob, hoodedTop
 */
export function renderHair(style: HairStyle, color: string) {
  if (style === "bald") return null;

  const lockGeom = getHairLockGeometry();

  switch (style) {
    case "shortSlick":
      return (
        <group>
          {/* Main dome cap */}
          <mesh position={[0, 0.055, -0.025]} scale={[1.1, 0.96, 1.06]} castShadow>
            <sphereGeometry
              args={[0.312, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.56]}
            />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          <mesh
            position={[0, 0.055, -0.025]}
            scale={[1.1 * OUTLINE_SCALE, 0.96 * OUTLINE_SCALE, 1.06 * OUTLINE_SCALE]}
          >
            <sphereGeometry
              args={[0.312, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56]}
            />
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>

          {/* Sculpted ExtrudeGeometry swept executive bangs */}
          <mesh
            geometry={lockGeom}
            position={[0.04, 0.21, 0.24]}
            rotation={[0.22, -0.18, -0.22]}
            scale={[1.15, 0.85, 0.8]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          <mesh
            geometry={lockGeom}
            position={[-0.14, 0.16, 0.21]}
            rotation={[0.15, 0.35, 0.3]}
            scale={[0.8, 0.7, 0.7]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          {/* Sideburns */}
          {[-0.29, 0.29].map((x, i) => (
            <mesh key={i} position={[x, 0.02, 0.04]} castShadow>
              <capsuleGeometry args={[0.042, 0.08, 6, 10]} />
              <meshStandardMaterial color={color} {...VINYL_MAT} />
            </mesh>
          ))}
        </group>
      );

    case "ponytail":
      return (
        <group>
          <mesh position={[0, 0.055, -0.025]} scale={[1.1, 0.97, 1.06]} castShadow>
            <sphereGeometry
              args={[0.312, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]}
            />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          <mesh
            position={[0, 0.055, -0.025]}
            scale={[1.1 * OUTLINE_SCALE, 0.97 * OUTLINE_SCALE, 1.06 * OUTLINE_SCALE]}
          >
            <sphereGeometry
              args={[0.312, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]}
            />
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>

          {/* Soft side-swept bangs */}
          <mesh
            geometry={lockGeom}
            position={[-0.08, 0.18, 0.25]}
            rotation={[0.25, 0.2, 0.24]}
            scale={[1.05, 0.85, 0.75]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          <mesh
            geometry={lockGeom}
            position={[0.14, 0.17, 0.22]}
            rotation={[0.2, -0.35, -0.35]}
            scale={[0.85, 0.75, 0.7]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>

          {/* High ponytail + warm gold scrunchie */}
          <group position={[0, 0.11, -0.33]} rotation={[-0.45, 0, 0]}>
            <mesh position={[0, 0.03, 0]} castShadow>
              <torusGeometry args={[0.072, 0.024, 8, 16]} />
              <meshStandardMaterial color="#E6C36E" {...VINYL_MAT} />
            </mesh>
            <mesh position={[0, -0.12, -0.05]} castShadow>
              <capsuleGeometry args={[0.085, 0.19, 8, 12]} />
              <meshStandardMaterial color={color} {...VINYL_MAT} />
            </mesh>
            <mesh position={[0, -0.12, -0.05]} scale={OUTLINE_SCALE}>
              <capsuleGeometry args={[0.085, 0.19, 8, 12]} />
              <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
            </mesh>
          </group>
        </group>
      );

    case "curly":
      return (
        <group>
          <mesh position={[0, 0.06, -0.02]} scale={[1.1, 0.96, 1.05]} castShadow>
            <sphereGeometry
              args={[0.31, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56]}
            />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          {[
            [-0.22, 0.21, 0.12],
            [-0.08, 0.28, 0.18],
            [0.09, 0.28, 0.17],
            [0.22, 0.21, 0.11],
            [-0.27, 0.14, -0.08],
            [0.27, 0.14, -0.08],
            [0, 0.31, -0.02],
            [-0.14, 0.24, -0.18],
            [0.14, 0.24, -0.18],
          ].map((pos, idx) => (
            <group key={idx} position={pos as [number, number, number]}>
              <mesh castShadow>
                <sphereGeometry args={[0.092, 12, 12]} />
                <meshStandardMaterial color={color} {...VINYL_MAT} />
              </mesh>
              <mesh scale={OUTLINE_SCALE}>
                <sphereGeometry args={[0.092, 10, 10]} />
                <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
              </mesh>
            </group>
          ))}
        </group>
      );

    case "pixelBlock":
      return (
        <group>
          <RoundedBox
            args={[0.56, 0.16, 0.54]}
            radius={0.04}
            smoothness={3}
            position={[0, 0.22, -0.02]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </RoundedBox>
          <RoundedBox
            args={[0.54, 0.34, 0.12]}
            radius={0.035}
            smoothness={3}
            position={[0, 0.06, -0.24]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </RoundedBox>
          <RoundedBox
            args={[0.16, 0.09, 0.08]}
            radius={0.025}
            smoothness={3}
            position={[-0.13, 0.15, 0.24]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </RoundedBox>
        </group>
      );

    case "pixelSpiky":
      return (
        <group>
          <RoundedBox
            args={[0.55, 0.15, 0.52]}
            radius={0.04}
            smoothness={3}
            position={[0, 0.21, -0.02]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </RoundedBox>
          {[-0.16, 0, 0.16].map((x, idx) => (
            <RoundedBox
              key={idx}
              args={[0.11, 0.15, 0.11]}
              radius={0.03}
              smoothness={3}
              position={[x, 0.31, 0.04]}
              rotation={[0.15, 0, (idx - 1) * -0.22]}
              castShadow
            >
              <meshStandardMaterial color={color} {...VINYL_MAT} />
            </RoundedBox>
          ))}
        </group>
      );

    case "bob":
      return (
        <group>
          <mesh position={[0, 0.04, -0.02]} scale={[1.13, 1.0, 1.08]} castShadow>
            <sphereGeometry
              args={[0.315, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]}
            />
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
          {[-0.27, 0.27].map((x, i) => (
            <mesh key={i} position={[x, -0.06, 0.02]} castShadow>
              <capsuleGeometry args={[0.075, 0.16, 6, 10]} />
              <meshStandardMaterial color={color} {...VINYL_MAT} />
            </mesh>
          ))}
          <mesh
            geometry={lockGeom}
            position={[0, 0.19, 0.25]}
            rotation={[0.25, 0, 0]}
            scale={[1.25, 0.85, 0.75]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
        </group>
      );

    case "hoodedTop":
      return (
        <group>
          {/* Peeking fringe under a hood */}
          <mesh
            geometry={lockGeom}
            position={[-0.04, 0.18, 0.25]}
            rotation={[0.2, 0.1, 0.12]}
            scale={[0.95, 0.75, 0.7]}
            castShadow
          >
            <meshStandardMaterial color={color} {...VINYL_MAT} />
          </mesh>
        </group>
      );
  }
}
