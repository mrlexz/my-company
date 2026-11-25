"use client";

import { RoundedBox } from "@react-three/drei";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import { HoneyWoodMaterial, LiveMonitor, VinylChair } from "./furnitureCommon";
import { getMarketingRugTexture } from "./furnitureTextures";

/** Phòng Marketing & Phân phối: bàn dài 3 màn hình, tường 2x3 màn hình kênh, bảng biểu đồ, quầy thu ngân, kệ hộp sản phẩm, chồng kiện hàng + xe đẩy, hộp thư xanh, thảm chevron */
export function MarketingRoomFurniture({
  accentColor,
}: {
  accentColor: string;
}) {
  const rugTex = getMarketingRugTexture(accentColor);

  return (
    <group>
      {/* Blue Chevron Rug */}
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

      {/* 2x3 Channel Monitor Wall (tường 2x3 màn hình kênh) */}
      <LiveMonitor
        position={[-0.7, 1.9, -2.14]}
        width={1.68}
        height={0.96}
        mode="channelWall"
        withStand={false}
      />

      {/* Upward Chart Board (bảng biểu đồ đi lên) */}
      <group position={[0.92, 1.85, -2.14]}>
        <RoundedBox args={[1.15, 0.88, 0.07]} radius={0.025} smoothness={2} castShadow>
          <HoneyWoodMaterial tint="#7C5636" />
        </RoundedBox>
        <RoundedBox
          args={[1.02, 0.74, 0.02]}
          radius={0.015}
          smoothness={2}
          position={[0, 0, 0.038]}
        >
          <meshStandardMaterial color="#FCF9F2" {...VINYL_MAT} />
        </RoundedBox>
        {[
          { x: -0.32, h: 0.18, c: "#60A5FA" },
          { x: -0.1, h: 0.3, c: accentColor },
          { x: 0.12, h: 0.42, c: "#F59E0B" },
          { x: 0.34, h: 0.56, c: "#34D399" },
        ].map((b, i) => (
          <RoundedBox
            key={i}
            args={[0.14, b.h, 0.04]}
            radius={0.012}
            smoothness={2}
            position={[b.x, -0.3 + b.h / 2, 0.06]}
          >
            <meshStandardMaterial color={b.c} {...VINYL_MAT} />
          </RoundedBox>
        ))}
      </group>

      {/* Long Desk in front of Threads & 8bit-fb with 3 side-angled live screens (~30° toward viewer) */}
      <group position={[-0.1, 0, -0.25]}>
        <RoundedBox
          args={[2.6, 0.12, 0.84]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.72, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial />
        </RoundedBox>
        {[
          [-1.16, 0.35, -0.32],
          [1.16, 0.35, -0.32],
          [-1.16, 0.35, 0.32],
          [1.16, 0.35, 0.32],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.04, 0.62, 6, 8]} />
            <meshStandardMaterial color="#5A4230" {...VINYL_MAT} />
          </mesh>
        ))}

        {/* 3 Monitors angled toward viewer at desk ends & center */}
        <LiveMonitor
          position={[-1.02, 1.05, 0.16]}
          rotation={[0, 0.52, 0]}
          width={0.58}
          height={0.38}
          mode="analyticsBlue"
        />
        <LiveMonitor
          position={[0.0, 1.05, 0.2]}
          rotation={[0, 0.28, 0]}
          width={0.56}
          height={0.38}
          mode="analyticsAmber"
        />
        <LiveMonitor
          position={[1.02, 1.05, 0.16]}
          rotation={[0, -0.38, 0]}
          width={0.58}
          height={0.38}
          mode="analyticsGreen"
        />
      </group>

      {/* Chairs behind desk facing OUT toward camera/lobby (aligned with Threads 0.45 & 8bit-fb 0.32) */}
      <VinylChair position={[-1.15, 0, -1.05]} rotationY={0.45} color={accentColor} />
      <VinylChair position={[0.35, 0, -1.05]} rotationY={0.32} color="#224F68" />

      {/* Second desk row at the back for Research (workstation chair [0, 0.85], desk [0, 1.55] local) */}
      <group position={[0, 0, 1.55]}>
        <RoundedBox
          args={[1.3, 0.12, 0.7]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.72, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial />
        </RoundedBox>
        {[
          [-0.55, 0.35, -0.25],
          [0.55, 0.35, -0.25],
          [-0.55, 0.35, 0.25],
          [0.55, 0.35, 0.25],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.04, 0.62, 6, 8]} />
            <meshStandardMaterial color="#5A4230" {...VINYL_MAT} />
          </mesh>
        ))}
        <LiveMonitor
          position={[0, 1.05, 0.12]}
          rotation={[0, 0, 0]}
          width={0.56}
          height={0.38}
          mode="analyticsBlue"
        />
      </group>
      <VinylChair position={[0, 0, 0.85]} rotationY={0.55} color="#5B8FB0" />

      {/* Product Box Shelf (kệ hộp sản phẩm) */}
      <group position={[1.45, 0, -1.25]}>
        {[0.25, 0.8, 1.35, 1.9].map((y, i) => (
          <RoundedBox
            key={i}
            args={[0.98, 0.06, 0.52]}
            radius={0.02}
            smoothness={2}
            position={[0, y, 0]}
            castShadow
            receiveShadow
          >
            <HoneyWoodMaterial />
          </RoundedBox>
        ))}
        {[
          [-0.44, 1.0, -0.22],
          [0.44, 1.0, -0.22],
          [-0.44, 1.0, 0.22],
          [0.44, 1.0, 0.22],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.032, 1.9, 6, 8]} />
            <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
          </mesh>
        ))}
        {/* Product boxes */}
        {[
          [-0.22, 0.43, "#E07A5F"],
          [0.2, 0.43, "#F2CC8F"],
          [-0.2, 0.98, "#3D85A8"],
          [0.2, 0.98, "#81B29A"],
          [-0.15, 1.53, "#F4A261"],
          [0.22, 1.53, "#E76F51"],
        ].map(([x, y, c], i) => (
          <RoundedBox
            key={i}
            args={[0.28, 0.28, 0.28]}
            radius={0.035}
            smoothness={2}
            position={[x as number, y as number, 0]}
            castShadow
          >
            <meshStandardMaterial color={c as string} {...VINYL_MAT} />
          </RoundedBox>
        ))}
      </group>

      {/* Checkout Counter with Cash Register & Bell (quầy thu ngân) */}
      <group position={[1.38, 0, 0.55]}>
        <RoundedBox
          args={[0.92, 0.86, 0.62]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.43, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial tint="#C29156" />
        </RoundedBox>
        {/* Cash register */}
        <RoundedBox
          args={[0.38, 0.24, 0.32]}
          radius={0.03}
          smoothness={2}
          position={[-0.12, 0.98, 0]}
          castShadow
        >
          <meshStandardMaterial color="#343A46" {...VINYL_MAT} />
        </RoundedBox>
        {/* Brass counter bell */}
        <mesh position={[0.25, 0.9, 0.1]} castShadow>
          <sphereGeometry
            args={[0.07, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]}
          />
          <meshStandardMaterial color="#E0B85A" {...METAL_MAT} />
        </mesh>
      </group>

      {/* Stacked Parcels + Hand Truck Dolly (chồng kiện hàng với xe đẩy) */}
      <group position={[-1.48, 0, 1.25]} rotation={[0, 0.4, 0]}>
        <RoundedBox
          args={[0.42, 0.32, 0.36]}
          radius={0.03}
          smoothness={2}
          position={[0, 0.2, 0]}
          castShadow
        >
          <meshStandardMaterial color="#D4A373" {...VINYL_MAT} />
        </RoundedBox>
        <RoundedBox
          args={[0.34, 0.26, 0.3]}
          radius={0.03}
          smoothness={2}
          position={[0.02, 0.48, -0.02]}
          rotation={[0, 0.18, 0]}
          castShadow
        >
          <meshStandardMaterial color="#C89362" {...VINYL_MAT} />
        </RoundedBox>
        {/* Dolly frame & wheels */}
        {[-0.18, 0.18].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 0.52, -0.22]} castShadow>
              <capsuleGeometry args={[0.022, 0.95, 6, 8]} />
              <meshStandardMaterial color="#B5532F" {...METAL_MAT} />
            </mesh>
            <mesh
              position={[x, 0.08, -0.24]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
              <meshStandardMaterial color="#252830" {...VINYL_MAT} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Blue Mailbox with Red Flag (hộp thư xanh có cờ) */}
      <group position={[1.55, 0, 1.65]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <capsuleGeometry args={[0.035, 0.8, 6, 8]} />
          <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
        </mesh>
        <RoundedBox
          args={[0.3, 0.26, 0.44]}
          radius={0.07}
          smoothness={3}
          position={[0, 0.9, 0]}
          castShadow
        >
          <meshStandardMaterial color="#2F6B8A" {...VINYL_MAT} />
        </RoundedBox>
        {/* Raised red mailbox flag */}
        <RoundedBox
          args={[0.025, 0.22, 0.08]}
          radius={0.008}
          smoothness={2}
          position={[0.17, 1.0, 0.05]}
        >
          <meshStandardMaterial color="#E05A47" {...VINYL_MAT} />
        </RoundedBox>
      </group>
    </group>
  );
}
