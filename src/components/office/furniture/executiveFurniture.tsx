"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import { HoneyWoodMaterial, PottedPlant, VinylChair } from "./furnitureCommon";
import { getExecutiveRugTexture } from "./furnitureTextures";

/** Bàn Chủ tịch góc 3/4 hướng ra sảnh/camera (chair local [-1.15, -1.35], facing 0.62) */
export function ChairmanDesk({ accentColor }: { accentColor: string }) {
  return (
    <group>
      {/* Angled L-style Executive Desk in front of Lex */}
      <group position={[-0.65, 0, -0.62]} rotation={[0, 0.62, 0]}>
        <RoundedBox
          args={[1.65, 0.13, 0.88]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.74, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial tint="#B9874E" />
        </RoundedBox>
        {/* Moss-green leather blotter */}
        <RoundedBox
          args={[1.1, 0.03, 0.56]}
          radius={0.014}
          smoothness={2}
          position={[0, 0.81, 0.02]}
          receiveShadow
        >
          <meshStandardMaterial color={accentColor} {...VINYL_MAT} />
        </RoundedBox>
        {/* Gold front trim */}
        <RoundedBox
          args={[1.58, 0.04, 0.04]}
          radius={0.015}
          smoothness={2}
          position={[0, 0.73, 0.44]}
        >
          <meshStandardMaterial color="#E0B85A" {...METAL_MAT} />
        </RoundedBox>
        {[-0.64, 0.64].map((x, i) => (
          <RoundedBox
            key={i}
            args={[0.32, 0.68, 0.76]}
            radius={0.04}
            smoothness={3}
            position={[x, 0.35, 0]}
            castShadow
          >
            <HoneyWoodMaterial tint="#A87843" />
          </RoundedBox>
        ))}

        {/* Brass Desk Lamp & Pen Cup on side corner */}
        <group position={[-0.62, 0.82, 0.14]}>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.06, 12]} />
            <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
          </mesh>
          <mesh position={[0, 0.17, 0]} castShadow>
            <capsuleGeometry args={[0.02, 0.22, 6, 8]} />
            <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <coneGeometry args={[0.14, 0.13, 12]} />
            <meshStandardMaterial
              color="#3F5B2F"
              emissive="#FFE7A0"
              emissiveIntensity={0.28}
              {...VINYL_MAT}
            />
          </mesh>
        </group>
        <mesh position={[0.62, 0.88, 0.12]} castShadow>
          <cylinderGeometry args={[0.055, 0.05, 0.14, 12]} />
          <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
        </mesh>
      </group>

      {/* High-back Chairman Chair aligned with Lex's facing (0.62) */}
      <VinylChair
        position={[-1.15, 0, -1.35]}
        rotationY={0.62}
        color="#2B3D22"
        highBack
      />
    </group>
  );
}

/** Bàn Thư ký góc 3/4 hướng ra sảnh/camera (chair local [1.15, -1.25], facing 0.42) */
export function SecretaryDesk() {
  return (
    <group>
      <group position={[1.45, 0, -0.52]} rotation={[0, 0.42, 0]}>
        <RoundedBox
          args={[1.38, 0.11, 0.76]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.72, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial />
        </RoundedBox>
        {[
          [-0.58, 0.35, -0.28],
          [0.58, 0.35, -0.28],
          [-0.58, 0.35, 0.28],
          [0.58, 0.35, 0.28],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.036, 0.62, 6, 8]} />
            <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
          </mesh>
        ))}

        {/* Notebook, Brass Bell & Potted Plant on side */}
        <RoundedBox
          args={[0.3, 0.045, 0.22]}
          radius={0.015}
          smoothness={2}
          position={[-0.18, 0.795, 0.04]}
          rotation={[0, 0.15, 0]}
          castShadow
        >
          <meshStandardMaterial color="#F7F0DC" {...VINYL_MAT} />
        </RoundedBox>
        <mesh position={[0.16, 0.79, 0.14]} castShadow>
          <sphereGeometry
            args={[0.06, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]}
          />
          <meshStandardMaterial color="#E0B85A" {...METAL_MAT} />
        </mesh>
        <PottedPlant position={[0.48, 0.78, -0.14]} scale={0.62} />
      </group>

      <VinylChair position={[1.15, 0, -1.25]} rotationY={0.42} color="#537640" />
    </group>
  );
}

/** Bàn họp oval 6 ghế gọn trong phòng 5.5x4.8 */
export function OvalConferenceTable({ accentColor }: { accentColor: string }) {
  return (
    <group position={[-0.25, 0, 1.15]}>
      <mesh
        position={[0, 0.72, 0]}
        scale={[1.35, 1, 0.6]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1.05, 1.05, 0.11, 24]} />
        <HoneyWoodMaterial />
      </mesh>
      {[-0.75, 0.75].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.22, 0.68, 12]} />
          <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
        </mesh>
      ))}
      <PottedPlant position={[0, 0.78, 0]} scale={0.62} />

      {[-0.72, 0, 0.72].map((x, i) => (
        <group key={i}>
          <VinylChair position={[x, 0, -0.82]} rotationY={0} color={accentColor} />
          <VinylChair
            position={[x, 0, 0.82]}
            rotationY={Math.PI}
            color={accentColor}
          />
        </group>
      ))}
    </group>
  );
}

/** Kệ sách cao có quả địa cầu */
export function TallBookshelfWithGlobe() {
  const globeRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.45;
    }
  });

  return (
    <group position={[-2.35, 0, 0.75]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox
        args={[1.3, 2.05, 0.42]}
        radius={0.04}
        smoothness={3}
        position={[0, 1.02, 0]}
        castShadow
        receiveShadow
      >
        <HoneyWoodMaterial tint="#B08048" />
      </RoundedBox>
      {[0.44, 0.98, 1.52].map((y, row) => (
        <group key={row} position={[0, y, 0.09]}>
          {[-0.4, -0.18, 0.04, 0.26, 0.42].map((x, i) => (
            <RoundedBox
              key={i}
              args={[0.14, 0.32, 0.22]}
              radius={0.02}
              smoothness={2}
              position={[x, 0, 0]}
              castShadow
            >
              <meshStandardMaterial
                color={
                  ["#3F5B2F", "#B5532F", "#2F6B8A", "#D9B35C", "#6B4F8A"][
                    (i + row) % 5
                  ]
                }
                {...VINYL_MAT}
              />
            </RoundedBox>
          ))}
        </group>
      ))}
      <group position={[0, 2.08, 0]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.1, 0.13, 0.07, 12]} />
          <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
        </mesh>
        <mesh ref={globeRef} position={[0, 0.24, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 14]} />
          <meshStandardMaterial color="#4D8FB3" {...VINYL_MAT} />
        </mesh>
      </group>
    </group>
  );
}

/** Ban Điều hành một tầng (5.5 x 4.8) */
export function ExecutiveRoomFurniture({
  accentColor,
}: {
  accentColor: string;
}) {
  const rugTex = getExecutiveRugTexture(accentColor);

  return (
    <group>
      {/* Round Crest Rug */}
      <mesh position={[0, 0.025, 0.1]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.0, 0.04, 32]} />
        <meshStandardMaterial
          map={rugTex ?? undefined}
          color="#FFFFFF"
          roughness={0.92}
        />
      </mesh>

      <ChairmanDesk accentColor={accentColor} />
      <SecretaryDesk />
      <OvalConferenceTable accentColor={accentColor} />
      <TallBookshelfWithGlobe />

      {/* Company Flag on Golden Pole */}
      <group position={[-2.2, 0, -1.85]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.12, 12]} />
          <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[0.036, 2.15, 6, 10]} />
          <meshStandardMaterial color="#E0B85A" {...METAL_MAT} />
        </mesh>
        <mesh position={[0, 2.34, 0]} castShadow>
          <sphereGeometry args={[0.085, 12, 10]} />
          <meshStandardMaterial color="#E8C66D" {...METAL_MAT} />
        </mesh>
        <RoundedBox
          args={[0.84, 0.56, 0.045]}
          radius={0.02}
          smoothness={2}
          position={[0.44, 1.88, 0.05]}
          rotation={[0, -0.15, -0.04]}
          castShadow
        >
          <meshStandardMaterial color={accentColor} {...VINYL_MAT} />
        </RoundedBox>
        <RoundedBox
          args={[0.2, 0.2, 0.055]}
          radius={0.02}
          smoothness={2}
          position={[0.44, 1.88, 0.06]}
          rotation={[0, -0.15, Math.PI / 4]}
        >
          <meshStandardMaterial color="#E8C66D" {...METAL_MAT} />
        </RoundedBox>
      </group>
    </group>
  );
}
