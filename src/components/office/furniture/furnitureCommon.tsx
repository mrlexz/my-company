"use client";

import { RoundedBox } from "@react-three/drei";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import {
  getHoneyWoodTexture,
  HONEY_WOOD_COLOR,
  useAnimatedScreenTexture,
  type ScreenMode,
} from "./furnitureTextures";

export function HoneyWoodMaterial({ tint = HONEY_WOOD_COLOR }: { tint?: string }) {
  const woodMap = getHoneyWoodTexture();
  return (
    <meshStandardMaterial
      color={tint}
      map={woodMap ?? undefined}
      roughness={0.78}
      metalness={0}
    />
  );
}

/** Vinyl Swivel / Office Chair built with RoundedBox + CapsuleGeometry */
export function VinylChair({
  position,
  rotationY = 0,
  color = "#4A4138",
  highBack = false,
  gaming = false,
}: {
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  highBack?: boolean;
  gaming?: boolean;
}) {
  const backH = gaming ? 0.72 : highBack ? 0.68 : 0.46;
  const backY = 0.45 + backH / 2;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Rounded cushion seat */}
      <RoundedBox
        args={[0.48, 0.1, 0.48]}
        radius={0.04}
        smoothness={3}
        position={[0, 0.42, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} {...VINYL_MAT} />
      </RoundedBox>

      {/* Rounded backrest */}
      <RoundedBox
        args={[0.46, backH, 0.1]}
        radius={0.045}
        smoothness={3}
        position={[0, backY, -0.2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} {...VINYL_MAT} />
      </RoundedBox>

      {/* Gaming wing accents & pillow */}
      {gaming && (
        <>
          <RoundedBox
            args={[0.08, 0.56, 0.12]}
            radius={0.03}
            smoothness={2}
            position={[-0.24, backY - 0.04, -0.17]}
            rotation={[0, 0.25, 0]}
            castShadow
          >
            <meshStandardMaterial color="#252834" {...VINYL_MAT} />
          </RoundedBox>
          <RoundedBox
            args={[0.08, 0.56, 0.12]}
            radius={0.03}
            smoothness={2}
            position={[0.24, backY - 0.04, -0.17]}
            rotation={[0, -0.25, 0]}
            castShadow
          >
            <meshStandardMaterial color="#252834" {...VINYL_MAT} />
          </RoundedBox>
          <RoundedBox
            args={[0.26, 0.12, 0.07]}
            radius={0.035}
            smoothness={3}
            position={[0, backY + 0.22, -0.13]}
            castShadow
          >
            <meshStandardMaterial color="#A78BFA" {...VINYL_MAT} />
          </RoundedBox>
        </>
      )}

      {/* Armrests for high-back or gaming chairs */}
      {(highBack || gaming) &&
        [-0.24, 0.24].map((x, i) => (
          <mesh key={i} position={[x, 0.58, -0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.032, 0.28, 6, 10]} />
            <meshStandardMaterial color="#343842" {...METAL_MAT} />
          </mesh>
        ))}

      {/* Metallic swivel column & 5-star base */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.052, 0.36, 10]} />
        <meshStandardMaterial color="#3A3E48" {...METAL_MAT} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.25, 0.05, 10]} />
        <meshStandardMaterial color="#3A3E48" {...METAL_MAT} />
      </mesh>
    </group>
  );
}

/** Beveled Vinyl Monitor with Live Animated CanvasTexture Screen */
export function LiveMonitor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.72,
  height = 0.45,
  mode,
  withStand = true,
  frameColor = "#252932",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  mode: ScreenMode;
  withStand?: boolean;
  frameColor?: string;
}) {
  const screenTex = useAnimatedScreenTexture(mode);

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        args={[width, height, 0.06]}
        radius={0.02}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={frameColor} {...VINYL_MAT} />
      </RoundedBox>
      <mesh position={[0, 0, 0.033]}>
        <planeGeometry args={[width - 0.08, height - 0.08]} />
        <meshStandardMaterial
          map={screenTex ?? undefined}
          emissiveMap={screenTex ?? undefined}
          emissive="#FFFFFF"
          emissiveIntensity={0.45}
          roughness={0.35}
        />
      </mesh>
      {withStand && (
        <>
          <mesh position={[0, -height / 2 - 0.1, -0.01]} castShadow>
            <capsuleGeometry args={[0.032, 0.14, 6, 8]} />
            <meshStandardMaterial color="#3A3E48" {...METAL_MAT} />
          </mesh>
          <RoundedBox
            args={[width * 0.42, 0.03, 0.18]}
            radius={0.012}
            smoothness={2}
            position={[0, -height / 2 - 0.19, 0.02]}
            castShadow
          >
            <meshStandardMaterial color="#3A3E48" {...METAL_MAT} />
          </RoundedBox>
        </>
      )}
    </group>
  );
}

/** Cute Vinyl Potted Plant */
export function PottedPlant({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.1, 0.28, 12]} />
        <meshStandardMaterial color="#C87551" {...VINYL_MAT} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshStandardMaterial color="#67944C" {...VINYL_MAT} />
      </mesh>
      <mesh position={[0.09, 0.42, 0.05]} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#7EAE5E" {...VINYL_MAT} />
      </mesh>
      <mesh position={[-0.08, 0.4, -0.04]} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#588240" {...VINYL_MAT} />
      </mesh>
    </group>
  );
}
