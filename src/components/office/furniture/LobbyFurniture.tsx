"use client";

import { RoundedBox } from "@react-three/drei";
import { useOfficeData } from "@/hooks/useOfficeData";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import { HoneyWoodMaterial, PottedPlant } from "./furnitureCommon";

/** Sảnh chung hình chữ thập ở giữa: thảm lối đi, góc cà phê, bàn tròn 4 ghế đẩu, bảng thông báo, cây xanh */
export function LobbyFurniture() {
  const { lobby } = useOfficeData();
  const { coffee, roundTable, noticeBoard, plants } = lobby.gatherPoints;

  return (
    <group>
      {/* Cross-shaped lobby walkway carpets (thảm lối đi) */}
      <RoundedBox
        args={[2.1, 0.032, 11.4]}
        radius={0.014}
        smoothness={2}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#E6D9BE" roughness={0.94} />
      </RoundedBox>
      <RoundedBox
        args={[13.4, 0.032, 1.75]}
        radius={0.014}
        smoothness={2}
        position={[0, 0.021, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#E6D9BE" roughness={0.94} />
      </RoundedBox>

      {/* Center Quick-Meeting Round Table + 4 Vinyl Stools (bàn tròn họp nhanh) */}
      <group position={[roundTable[0], 0, roundTable[1]]}>
        <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.09, 24]} />
          <HoneyWoodMaterial />
        </mesh>
        <mesh position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.2, 0.65, 14]} />
          <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
        </mesh>
        {/* Centerpiece mini cup / notepad */}
        <mesh position={[0.12, 0.77, 0.05]} castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.09, 10]} />
          <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
        </mesh>
        <RoundedBox
          args={[0.24, 0.03, 0.18]}
          radius={0.008}
          smoothness={2}
          position={[-0.14, 0.74, -0.06]}
          rotation={[0, 0.2, 0]}
        >
          <meshStandardMaterial color="#FCF9F2" {...VINYL_MAT} />
        </RoundedBox>

        {/* 4 Round Stools */}
        {[
          [0, 0.92, "#3F5B2F"],
          [0, -0.92, "#B5532F"],
          [0.92, 0, "#2F6B8A"],
          [-0.92, 0, "#6B4F8A"],
        ].map(([x, z, color], idx) => (
          <group key={idx} position={[x as number, 0, z as number]}>
            <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.19, 0.08, 16]} />
              <meshStandardMaterial color={color as string} {...VINYL_MAT} />
            </mesh>
            <mesh position={[0, 0.22, 0]} castShadow>
              <capsuleGeometry args={[0.04, 0.36, 6, 8]} />
              <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Coffee Corner (góc cà phê: quầy, máy pha, ly) */}
      <group position={[coffee[0], 0, coffee[1]]}>
        <RoundedBox
          args={[1.8, 0.86, 0.68]}
          radius={0.04}
          smoothness={3}
          position={[0, 0.43, 0]}
          castShadow
          receiveShadow
        >
          <HoneyWoodMaterial tint="#B8874E" />
        </RoundedBox>
        {/* Countertop slab */}
        <RoundedBox
          args={[1.88, 0.07, 0.74]}
          radius={0.025}
          smoothness={2}
          position={[0, 0.89, 0]}
          castShadow
        >
          <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
        </RoundedBox>
        {/* Espresso Machine */}
        <RoundedBox
          args={[0.42, 0.4, 0.32]}
          radius={0.04}
          smoothness={3}
          position={[-0.42, 1.12, -0.05]}
          castShadow
        >
          <meshStandardMaterial color="#343844" {...METAL_MAT} />
        </RoundedBox>
        <RoundedBox
          args={[0.3, 0.14, 0.04]}
          radius={0.015}
          smoothness={2}
          position={[-0.42, 1.2, 0.12]}
        >
          <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
        </RoundedBox>
        {/* Coffee Mugs */}
        {[
          [0.18, 0.98, 0.08, "#FAF6EC"],
          [0.36, 0.98, 0.12, "#E07A5F"],
          [0.54, 0.98, 0.04, "#81B29A"],
        ].map(([x, y, z, c], i) => (
          <mesh
            key={i}
            position={[x as number, y as number, z as number]}
            castShadow
          >
            <cylinderGeometry args={[0.055, 0.048, 0.11, 12]} />
            <meshStandardMaterial color={c as string} {...VINYL_MAT} />
          </mesh>
        ))}
      </group>

      {/* Notice Board on Back Wall (bảng thông báo) */}
      <group position={[noticeBoard[0], 1.78, noticeBoard[1]]}>
        <RoundedBox
          args={[1.75, 0.95, 0.08]}
          radius={0.03}
          smoothness={2}
          castShadow
        >
          <HoneyWoodMaterial tint="#8F653E" />
        </RoundedBox>
        <RoundedBox
          args={[1.58, 0.78, 0.025]}
          radius={0.015}
          smoothness={2}
          position={[0, 0, 0.04]}
        >
          <meshStandardMaterial color="#D4A978" {...VINYL_MAT} />
        </RoundedBox>
        {[
          [-0.48, 0.16, "#FDE047"],
          [-0.14, 0.14, "#93C5FD"],
          [0.2, 0.18, "#FDA4AF"],
          [0.52, 0.12, "#86EFAC"],
          [-0.28, -0.18, "#FAF7F0"],
          [0.24, -0.16, "#FDE68A"],
        ].map(([x, y, c], i) => (
          <RoundedBox
            key={i}
            args={[0.24, 0.2, 0.015]}
            radius={0.008}
            smoothness={2}
            position={[x as number, y as number, 0.058]}
            rotation={[0, 0, (i % 3 - 1) * 0.06]}
          >
            <meshStandardMaterial color={c as string} {...VINYL_MAT} />
          </RoundedBox>
        ))}
      </group>

      {/* Potted Plants around the Lobby */}
      {plants.map(([px, pz], idx) => (
        <PottedPlant key={idx} position={[px, 0, pz]} scale={1.15} />
      ))}
    </group>
  );
}
