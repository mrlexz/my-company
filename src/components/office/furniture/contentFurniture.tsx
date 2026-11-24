"use client";

import { RoundedBox } from "@react-three/drei";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import { HoneyWoodMaterial, LiveMonitor, VinylChair } from "./furnitureCommon";
import { getContentRugTexture } from "./furnitureTextures";

/** Phòng Nội dung: bàn dựng video 2 màn hình + bảng vẽ + loa, ghế cam đất, TV timeline, ring light, tripod camera, spotlight, corkboard, kệ kịch bản & phim, thảm cuộn phim */
export function ContentRoomFurniture({ accentColor }: { accentColor: string }) {
  const rugTex = getContentRugTexture(accentColor);

  return (
    <group>
      {/* Film-strip patterned orange rug */}
      <RoundedBox
        args={[3.55, 0.04, 3.65]}
        radius={0.018}
        smoothness={2}
        position={[0, 0.025, 0.1]}
        receiveShadow
      >
        <meshStandardMaterial
          map={rugTex ?? undefined}
          color="#FFFFFF"
          roughness={0.92}
        />
      </RoundedBox>

      {/* Large Wall-Mounted Timeline TV */}
      <LiveMonitor
        position={[-0.3, 1.85, -2.14]}
        width={2.05}
        height={1.08}
        mode="timeline"
        withStand={false}
      />

      {/* Video Editing L-Desk in front of Alien & 8bit-video (both sit behind facing OUT 3/4 toward camera) */}
      <group position={[-0.1, 0, -0.45]}>
        <RoundedBox
          args={[2.7, 0.12, 0.86]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.72, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial />
        </RoundedBox>
        {[
          [-1.22, 0.35, -0.32],
          [1.22, 0.35, -0.32],
          [-1.22, 0.35, 0.32],
          [1.22, 0.35, 0.32],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.04, 0.62, 6, 8]} />
            <meshStandardMaterial color="#5A4230" {...VINYL_MAT} />
          </mesh>
        ))}

        {/* Monitors placed at desk outer corners angled ~30° toward viewer so faces stay unobstructed */}
        <LiveMonitor
          position={[-1.08, 1.06, 0.14]}
          rotation={[0, 0.52, 0]}
          width={0.68}
          height={0.44}
          mode="timeline"
        />
        <LiveMonitor
          position={[1.08, 1.06, 0.14]}
          rotation={[0, -0.42, 0]}
          width={0.68}
          height={0.44}
          mode="analyticsAmber"
        />

        {/* Studio Speakers & Drawing Tablet */}
        <RoundedBox
          args={[0.46, 0.032, 0.3]}
          radius={0.012}
          smoothness={2}
          position={[-0.42, 0.795, -0.08]}
          castShadow
        >
          <meshStandardMaterial color="#2C303A" {...VINYL_MAT} />
        </RoundedBox>
        <RoundedBox
          args={[0.42, 0.035, 0.26]}
          radius={0.012}
          smoothness={2}
          position={[0.42, 0.795, -0.08]}
          castShadow
        >
          <meshStandardMaterial color="#343844" {...VINYL_MAT} />
        </RoundedBox>
      </group>

      {/* Burnt-orange swivel chairs facing OUT toward camera/lobby (aligned with Alien 0.38 & 8bit-video 0.25) */}
      <VinylChair position={[-1.1, 0, -1.35]} rotationY={0.38} color={accentColor} />
      <VinylChair position={[0.45, 0, -1.35]} rotationY={0.25} color="#C8643D" />

      {/* Ring Light on Tripod Stand (đèn ring light) */}
      <group position={[1.45, 0, -1.15]} rotation={[0, -0.55, 0]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <capsuleGeometry args={[0.03, 1.65, 6, 8]} />
          <meshStandardMaterial color="#2B2E36" {...METAL_MAT} />
        </mesh>
        {[0, 2.09, 4.18].map((a, i) => (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.22, 0.22, Math.cos(a) * 0.22]}
            rotation={[Math.cos(a) * 0.45, 0, -Math.sin(a) * 0.45]}
            castShadow
          >
            <capsuleGeometry args={[0.02, 0.5, 4, 8]} />
            <meshStandardMaterial color="#252830" {...METAL_MAT} />
          </mesh>
        ))}
        {/* Glowing Ring Light */}
        <mesh position={[0, 1.82, 0]} castShadow>
          <torusGeometry args={[0.28, 0.042, 10, 24]} />
          <meshStandardMaterial
            color="#FFFDF5"
            emissive="#FFF0B8"
            emissiveIntensity={1.25}
          />
        </mesh>
      </group>

      {/* Cinema Camera on Tripod (máy quay trên tripod) */}
      <group position={[-1.45, 0, 1.05]} rotation={[0, 0.8, 0]}>
        <mesh position={[0, 0.68, 0]} castShadow>
          <capsuleGeometry args={[0.03, 1.32, 6, 8]} />
          <meshStandardMaterial color="#2B2E36" {...METAL_MAT} />
        </mesh>
        <RoundedBox
          args={[0.36, 0.26, 0.46]}
          radius={0.04}
          smoothness={3}
          position={[0, 1.46, 0]}
          castShadow
        >
          <meshStandardMaterial color="#23262E" {...VINYL_MAT} />
        </RoundedBox>
        <mesh position={[0, 1.46, 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.095, 0.115, 0.22, 14]} />
          <meshStandardMaterial color="#181A20" {...METAL_MAT} />
        </mesh>
      </group>

      {/* Studio Spotlight (đèn spotlight) */}
      <group position={[1.55, 0, 0.85]} rotation={[0, -0.95, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow>
          <capsuleGeometry args={[0.028, 1.4, 6, 8]} />
          <meshStandardMaterial color="#2B2E36" {...METAL_MAT} />
        </mesh>
        <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
          <coneGeometry args={[0.22, 0.34, 14]} />
          <meshStandardMaterial color="#252830" {...METAL_MAT} />
        </mesh>
        <mesh position={[0, 1.48, 0.14]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial
            color="#FFF7DC"
            emissive="#FFE49E"
            emissiveIntensity={1.1}
          />
        </mesh>
      </group>

      {/* Corkboard with Sketches & Sticky Notes on Left Wall */}
      <group position={[-2.02, 1.65, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[1.65, 1.05, 0.07]} radius={0.025} smoothness={2} castShadow>
          <HoneyWoodMaterial tint="#8F653E" />
        </RoundedBox>
        <RoundedBox
          args={[1.5, 0.9, 0.03]}
          radius={0.015}
          smoothness={2}
          position={[0, 0, 0.03]}
        >
          <meshStandardMaterial color="#C89B6E" {...VINYL_MAT} />
        </RoundedBox>
        {/* Sticky notes */}
        {[
          { x: -0.45, y: 0.2, c: "#FDE047" },
          { x: -0.12, y: 0.18, c: "#FDA4AF" },
          { x: 0.24, y: 0.22, c: "#93C5FD" },
          { x: -0.32, y: -0.18, c: "#86EFAC" },
          { x: 0.15, y: -0.15, c: "#FAF7F0" },
        ].map((n, i) => (
          <RoundedBox
            key={i}
            args={[0.24, 0.22, 0.015]}
            radius={0.008}
            smoothness={2}
            position={[n.x, n.y, 0.052]}
            rotation={[0, 0, (i - 2) * 0.05]}
          >
            <meshStandardMaterial color={n.c} {...VINYL_MAT} />
          </RoundedBox>
        ))}
      </group>

      {/* Script & Film Reel Shelf (kệ cuộn kịch bản & cuộn phim) */}
      <group position={[1.45, 0, -2.02]}>
        <RoundedBox
          args={[0.92, 1.45, 0.42]}
          radius={0.035}
          smoothness={3}
          position={[0, 0.72, 0]}
          castShadow
        >
          <HoneyWoodMaterial />
        </RoundedBox>
        {/* Rolled scripts */}
        {[-0.22, -0.08, 0.06].map((x, i) => (
          <mesh key={i} position={[x, 1.54, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.24, 6, 10]} />
            <meshStandardMaterial color="#F5E7C6" {...VINYL_MAT} />
          </mesh>
        ))}
        {/* Film reel */}
        <mesh position={[0.26, 1.56, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
          <meshStandardMaterial color="#252830" {...METAL_MAT} />
        </mesh>
      </group>
    </group>
  );
}
