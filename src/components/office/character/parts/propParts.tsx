"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { PropType } from "@/types/office";
import {
  getMegaphoneGeometry,
  getSpeechBubbleGeometry,
  METAL_MAT,
  OUTLINE_COLOR,
  OUTLINE_SCALE,
  VINYL_MAT,
} from "../geometryHelpers";

export interface PropRenderOptions {
  primaryColor?: string;
  secondaryColor?: string;
  isWorking?: boolean;
}

/** 1. Scroll: cuộn giấy có dấu sáp đỏ & ruy băng; khi working cuộn mở nhẹ ra */
function ScrollProp({
  primaryColor = "#F5E7C6",
  secondaryColor = "#B83B2E",
  isWorking = false,
}: PropRenderOptions) {
  const sheetRef = useRef<Mesh>(null);
  const leftRollRef = useRef<Mesh>(null);
  const rightRollRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const openAmt = isWorking ? 0.5 + Math.sin(t * 2.6) * 0.5 : 0;
    if (sheetRef.current) {
      sheetRef.current.scale.x = 0.01 + openAmt * 1.0;
      sheetRef.current.visible = openAmt > 0.04;
    }
    if (leftRollRef.current && rightRollRef.current) {
      leftRollRef.current.position.x = -0.025 - openAmt * 0.095;
      rightRollRef.current.position.x = 0.025 + openAmt * 0.095;
    }
  });

  return (
    <group rotation={[0.32, 0.22, 0.22]}>
      {/* Left & right scroll rolls (separate when working) */}
      <mesh ref={leftRollRef} position={[-0.025, 0, 0]} castShadow>
        <capsuleGeometry args={[0.042, 0.24, 8, 12]} />
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>
      <mesh ref={rightRollRef} position={[0.025, 0, 0]} castShadow>
        <capsuleGeometry args={[0.042, 0.24, 8, 12]} />
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>

      {/* Unfurling parchment sheet when working */}
      <mesh ref={sheetRef} position={[0, 0, 0.01]} castShadow>
        <boxGeometry args={[0.2, 0.24, 0.012]} />
        <meshStandardMaterial color="#FCF6E3" {...VINYL_MAT} />
      </mesh>

      {/* Ribbon wrap */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.068, 0.013, 6, 16]} />
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </mesh>
      {/* Ribbon tails */}
      <RoundedBox
        args={[0.026, 0.095, 0.01]}
        radius={0.004}
        smoothness={2}
        position={[-0.018, -0.05, 0.065]}
        rotation={[0, 0, -0.22]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>
      <RoundedBox
        args={[0.026, 0.085, 0.01]}
        radius={0.004}
        smoothness={2}
        position={[0.018, -0.045, 0.065]}
        rotation={[0, 0, 0.25]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>

      {/* Red wax seal */}
      <mesh position={[0, 0, 0.072]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.035, 0.018, 12]} />
        <meshStandardMaterial color="#B83B2E" roughness={0.45} metalness={0.05} />
      </mesh>
    </group>
  );
}

/** 2. Notebook: sổ da, bút lông cài gáy; khi working lật trang */
function NotebookProp({
  primaryColor = "#8C5E3C",
  secondaryColor = "#E5C068",
  isWorking = false,
}: PropRenderOptions) {
  const flippingPageRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!flippingPageRef.current) return;
    const t = clock.getElapsedTime();
    if (isWorking) {
      // Smooth page-turn cycle
      const wave = (Math.sin(t * 3.4) + 1) * 0.5;
      flippingPageRef.current.rotation.y = -wave * Math.PI * 0.72;
    } else {
      flippingPageRef.current.rotation.y = THREE.MathUtils.lerp(
        flippingPageRef.current.rotation.y,
        -0.08,
        0.1
      );
    }
  });

  return (
    <group rotation={[0.28, -0.32, 0.08]}>
      {/* Leather cover */}
      <RoundedBox
        args={[0.21, 0.26, 0.052]}
        radius={0.018}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Cream page block */}
      <RoundedBox
        args={[0.175, 0.225, 0.038]}
        radius={0.008}
        smoothness={2}
        position={[0.012, 0, 0.012]}
      >
        <meshStandardMaterial color="#FCF9F2" {...VINYL_MAT} />
      </RoundedBox>
      {/* Animated flipping page hinged at spine */}
      <group ref={flippingPageRef} position={[-0.072, 0, 0.032]}>
        <RoundedBox
          args={[0.16, 0.21, 0.006]}
          radius={0.002}
          smoothness={2}
          position={[0.08, 0, 0]}
        >
          <meshStandardMaterial color="#FFFDF7" {...VINYL_MAT} />
        </RoundedBox>
      </group>
      {/* Spine band */}
      <mesh position={[-0.095, 0, 0]}>
        <capsuleGeometry args={[0.024, 0.22, 6, 10]} />
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </mesh>
      {/* Quill tucked into spine */}
      <group position={[-0.11, 0.06, 0.015]} rotation={[0.1, 0, 0.12]}>
        <mesh>
          <capsuleGeometry args={[0.009, 0.22, 4, 8]} />
          <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
        </mesh>
        <mesh position={[0.008, 0.1, 0]} scale={[1.2, 2.2, 0.35]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#F2D7A8" {...VINYL_MAT} />
        </mesh>
      </group>
    </group>
  );
}

/** 3. Quill: bút lông ngỗng lớn */
function QuillProp({
  primaryColor = "#FAF6EC",
  secondaryColor = "#D9B35C",
  isWorking = false,
}: PropRenderOptions) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = isWorking
      ? -0.3 + Math.sin(t * 9) * 0.14
      : -0.32;
  });

  return (
    <group ref={ref} rotation={[0.2, 0, -0.32]}>
      {/* Shaft */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.014, 0.34, 6, 10]} />
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>
      {/* Metallic golden nib */}
      <mesh position={[0, -0.095, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.02, 0.06, 8]} />
        <meshStandardMaterial color={secondaryColor} {...METAL_MAT} />
      </mesh>
      {/* Sculpted large goose-feather plume */}
      <mesh position={[0.025, 0.17, 0]} scale={[1.65, 3.1, 0.38]} castShadow>
        <sphereGeometry args={[0.048, 12, 12]} />
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>
      <mesh position={[0.032, 0.27, 0]} scale={[1.2, 2.0, 0.32]} castShadow>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshStandardMaterial color="#F3E2BE" {...VINYL_MAT} />
      </mesh>
    </group>
  );
}

/** 4. Clapperboard: bảng clap phim vạch đen trắng, phần trên khép mở nhẹ */
function ClapperboardProp({
  primaryColor = "#23262E",
  secondaryColor = "#FAF7F0",
  isWorking = false,
}: PropRenderOptions) {
  const clapperTopRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!clapperTopRef.current) return;
    const t = clock.getElapsedTime();
    const speed = isWorking ? 5.5 : 1.8;
    const maxAngle = isWorking ? 0.42 : 0.18;
    clapperTopRef.current.rotation.z =
      0.06 + (Math.sin(t * speed) * 0.5 + 0.5) * maxAngle;
  });

  return (
    <group rotation={[0.1, -0.25, 0.06]}>
      {/* Main slate body */}
      <RoundedBox
        args={[0.27, 0.2, 0.036]}
        radius={0.014}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* White chalk lines */}
      <RoundedBox
        args={[0.2, 0.012, 0.008]}
        radius={0.003}
        smoothness={2}
        position={[0, 0.01, 0.02]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>
      <RoundedBox
        args={[0.16, 0.012, 0.008]}
        radius={0.003}
        smoothness={2}
        position={[-0.02, -0.04, 0.02]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>

      {/* Fixed lower striped bar */}
      <RoundedBox
        args={[0.27, 0.038, 0.04]}
        radius={0.008}
        smoothness={2}
        position={[0, 0.095, 0]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {[-0.09, 0, 0.09].map((x, i) => (
        <RoundedBox
          key={i}
          args={[0.042, 0.04, 0.044]}
          radius={0.006}
          smoothness={2}
          position={[x, 0.095, 0]}
          rotation={[0, 0, 0.3]}
        >
          <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
        </RoundedBox>
      ))}

      {/* Hinged upper clapper arm */}
      <group ref={clapperTopRef} position={[-0.13, 0.125, 0]}>
        <RoundedBox
          args={[0.27, 0.042, 0.04]}
          radius={0.008}
          smoothness={2}
          position={[0.13, 0.012, 0]}
          castShadow
        >
          <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
        </RoundedBox>
        {[0.04, 0.13, 0.22].map((x, i) => (
          <RoundedBox
            key={i}
            args={[0.042, 0.044, 0.044]}
            radius={0.006}
            smoothness={2}
            position={[x, 0.012, 0]}
            rotation={[0, 0, -0.3]}
          >
            <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

/** 5. Megaphone: loa nón LatheGeometry */
function MegaphoneProp({
  primaryColor = "#3C82A6",
  secondaryColor = "#FAF7F0",
}: PropRenderOptions) {
  const geom = getMegaphoneGeometry();
  return (
    <group rotation={[Math.PI / 2.2, 0, -0.25]}>
      <mesh geometry={geom} castShadow>
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>
      <mesh geometry={geom} scale={OUTLINE_SCALE}>
        <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
      </mesh>
      {/* Rim ring */}
      <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.122, 0.016, 8, 20]} />
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </mesh>
      {/* Rear cap */}
      <mesh position={[0, -0.01, 0]}>
        <sphereGeometry args={[0.036, 10, 10]} />
        <meshStandardMaterial color="#252830" {...VINYL_MAT} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.075, -0.065]} rotation={[0.38, 0, 0]} castShadow>
        <capsuleGeometry args={[0.022, 0.095, 6, 10]} />
        <meshStandardMaterial color="#252830" {...VINYL_MAT} />
      </mesh>
    </group>
  );
}

/** 6. ShoppingBag: túi giấy có quai dây */
function ShoppingBagProp({
  primaryColor = "#D4A373",
  secondaryColor = "#FAF6EC",
}: PropRenderOptions) {
  return (
    <group position={[0, -0.1, 0.03]}>
      <RoundedBox
        args={[0.23, 0.25, 0.135]}
        radius={0.028}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Folded top cuff */}
      <RoundedBox
        args={[0.24, 0.042, 0.145]}
        radius={0.014}
        smoothness={2}
        position={[0, 0.105, 0]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Front & back rope handles */}
      {[-0.042, 0.042].map((z, i) => (
        <mesh key={i} position={[0, 0.125, z]}>
          <torusGeometry args={[0.062, 0.013, 8, 16, Math.PI]} />
          <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
        </mesh>
      ))}
    </group>
  );
}

/** 7. PriceSign: bảng giá gỗ trên cọc */
function PriceSignProp({
  primaryColor = "#B88652",
  secondaryColor = "#FAF3DF",
}: PropRenderOptions) {
  return (
    <group rotation={[0.1, -0.2, 0]}>
      {/* Wooden stake */}
      <mesh position={[0, -0.06, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.25, 6, 10]} />
        <meshStandardMaterial color="#7C5636" {...VINYL_MAT} />
      </mesh>
      {/* Wooden board frame */}
      <RoundedBox
        args={[0.27, 0.17, 0.034]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.11, 0]}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Inner cream label */}
      <RoundedBox
        args={[0.22, 0.12, 0.014]}
        radius={0.01}
        smoothness={2}
        position={[0, 0.11, 0.018]}
      >
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Price accent bar */}
      <RoundedBox
        args={[0.13, 0.028, 0.01]}
        radius={0.006}
        smoothness={2}
        position={[0, 0.11, 0.026]}
      >
        <meshStandardMaterial color="#B5532F" {...VINYL_MAT} />
      </RoundedBox>
    </group>
  );
}

/** 8. Wrench: cờ lê to bản kim loại */
function WrenchProp({
  primaryColor = "#CBD5E1",
  secondaryColor = "#64748B",
}: PropRenderOptions) {
  return (
    <group rotation={[0.25, 0, -0.35]}>
      {/* Chunky handle */}
      <RoundedBox
        args={[0.065, 0.28, 0.032]}
        radius={0.014}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...METAL_MAT} />
      </RoundedBox>
      {/* Recessed handle grip */}
      <RoundedBox
        args={[0.032, 0.15, 0.038]}
        radius={0.008}
        smoothness={2}
      >
        <meshStandardMaterial color={secondaryColor} {...METAL_MAT} />
      </RoundedBox>
      {/* Open-end U-jaw head */}
      <mesh position={[0, 0.165, 0]} rotation={[0, 0, 0.35]} castShadow>
        <torusGeometry args={[0.068, 0.026, 8, 16, Math.PI * 1.45]} />
        <meshStandardMaterial color={primaryColor} {...METAL_MAT} />
      </mesh>
      {/* Box-end ring at bottom */}
      <mesh position={[0, -0.155, 0]} castShadow>
        <torusGeometry args={[0.044, 0.018, 8, 14]} />
        <meshStandardMaterial color={primaryColor} {...METAL_MAT} />
      </mesh>
    </group>
  );
}

/** 9. Blueprint: ống bản vẽ có giấy xanh thò ra */
function BlueprintProp({
  primaryColor = "#6D4C36",
  secondaryColor = "#2E6DB4",
}: PropRenderOptions) {
  return (
    <group rotation={[0.42, 0.22, 0.3]}>
      {/* Carrying cylinder tube */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <capsuleGeometry args={[0.052, 0.22, 8, 14]} />
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>
      {/* Metallic tube rim */}
      <mesh position={[0, 0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.052, 0.012, 8, 16]} />
        <meshStandardMaterial color="#D9B35C" {...METAL_MAT} />
      </mesh>
      {/* Blue blueprint roll peeking out the top */}
      <mesh position={[0, 0.165, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.044, 0.15, 14]} />
        <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
      </mesh>
      {/* White drafting bands */}
      <mesh position={[0, 0.185, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.043, 0.005, 6, 14]} />
        <meshStandardMaterial color="#E6F2FF" {...VINYL_MAT} />
      </mesh>
    </group>
  );
}

/** 10. BigBook: sách dày bìa teal, góc vàng */
function BigBookProp({
  primaryColor = "#2B7A78",
  secondaryColor = "#E0B85A",
}: PropRenderOptions) {
  return (
    <group rotation={[0.15, 0.25, -0.1]}>
      {/* Thick teal cover */}
      <RoundedBox
        args={[0.23, 0.29, 0.088]}
        radius={0.02}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Cream page block */}
      <RoundedBox
        args={[0.19, 0.245, 0.064]}
        radius={0.01}
        smoothness={2}
        position={[0.022, 0, 0]}
      >
        <meshStandardMaterial color="#FAF5E8" {...VINYL_MAT} />
      </RoundedBox>
      {/* 4 Metallic gold corner brackets */}
      {[
        [-0.095, 0.125],
        [0.095, 0.125],
        [-0.095, -0.125],
        [0.095, -0.125],
      ].map(([x, y], i) => (
        <RoundedBox
          key={i}
          args={[0.045, 0.045, 0.094]}
          radius={0.008}
          smoothness={2}
          position={[x, y, 0]}
        >
          <meshStandardMaterial color={secondaryColor} {...METAL_MAT} />
        </RoundedBox>
      ))}
      {/* Center gold crest */}
      <mesh position={[0, 0, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.01, 6]} />
        <meshStandardMaterial color={secondaryColor} {...METAL_MAT} />
      </mesh>
    </group>
  );
}

/** 11. MiniChart: bảng nhỏ có biểu đồ cột màu */
function MiniChartProp({
  primaryColor = "#FAF7F0",
  secondaryColor = "#6B4F8A",
}: PropRenderOptions) {
  return (
    <group rotation={[0.15, -0.28, 0]}>
      <RoundedBox
        args={[0.28, 0.23, 0.034]}
        radius={0.02}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </RoundedBox>
      {/* Top metal clip */}
      <RoundedBox
        args={[0.1, 0.032, 0.042]}
        radius={0.008}
        smoothness={2}
        position={[0, 0.115, 0.006]}
      >
        <meshStandardMaterial color={secondaryColor} {...METAL_MAT} />
      </RoundedBox>
      {/* 4 Colorful rising bars */}
      {[
        { x: -0.085, h: 0.065, y: -0.045, color: "#38BDF8" },
        { x: -0.028, h: 0.105, y: -0.025, color: "#A78BFA" },
        { x: 0.028, h: 0.14, y: -0.008, color: "#F59E0B" },
        { x: 0.085, h: 0.175, y: 0.01, color: "#34D399" },
      ].map((b, i) => (
        <RoundedBox
          key={i}
          args={[0.038, b.h, 0.024]}
          radius={0.008}
          smoothness={2}
          position={[b.x, b.y, 0.022]}
          castShadow
        >
          <meshStandardMaterial color={b.color} {...VINYL_MAT} />
        </RoundedBox>
      ))}
    </group>
  );
}

/** 12. Laptop: mở, màn hình phát sáng, 3 sticker tròn; khi working có chuyển động gõ phím */
function LaptopProp({
  primaryColor = "#475569",
  secondaryColor = "#38BDF8",
  isWorking = false,
}: PropRenderOptions) {
  const laptopRef = useRef<Group>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (laptopRef.current) {
      laptopRef.current.position.y = isWorking
        ? -0.02 + Math.sin(t * 18) * 0.005
        : -0.02;
    }
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = isWorking
        ? 0.65 + Math.sin(t * 9) * 0.2
        : 0.55;
    }
  });

  return (
    <group ref={laptopRef} position={[0, -0.02, 0.07]}>
      {/* Base keyboard deck */}
      <RoundedBox
        args={[0.32, 0.028, 0.21]}
        radius={0.009}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial color="#94A3B8" {...METAL_MAT} />
      </RoundedBox>
      {/* Keyboard dark inset */}
      <RoundedBox
        args={[0.26, 0.008, 0.11]}
        radius={0.003}
        smoothness={2}
        position={[0, 0.015, -0.015]}
      >
        <meshStandardMaterial color="#252830" {...VINYL_MAT} />
      </RoundedBox>

      {/* Open screen lid */}
      <group position={[0, 0.098, -0.088]} rotation={[-0.25, 0, 0]}>
        <RoundedBox
          args={[0.32, 0.19, 0.026]}
          radius={0.009}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
        </RoundedBox>
        {/* Glowing display */}
        <RoundedBox
          args={[0.27, 0.145, 0.01]}
          radius={0.005}
          smoothness={2}
          position={[0, 0, 0.013]}
        >
          <meshStandardMaterial
            ref={screenMatRef}
            color="#0F172A"
            emissive={secondaryColor}
            emissiveIntensity={0.6}
          />
        </RoundedBox>

        {/* 3 Round Stickers on back of lid */}
        {[
          { pos: [-0.075, 0.035, -0.015], color: "#F59E0B", r: 0.026 },
          { pos: [0.01, -0.02, -0.015], color: "#34D399", r: 0.03 },
          { pos: [0.085, 0.03, -0.015], color: "#F472B6", r: 0.024 },
        ].map((st, idx) => (
          <mesh
            key={idx}
            position={st.pos as [number, number, number]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[st.r, st.r, 0.006, 14]} />
            <meshStandardMaterial color={st.color} {...VINYL_MAT} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** 13. ShieldF: khiên tròn xanh đậm, viền vàng, chữ "f" nổi */
function ShieldFProp({
  primaryColor = "#1E4D8C",
  secondaryColor = "#E0B85A",
}: PropRenderOptions) {
  return (
    <group rotation={[0, -0.25, 0]}>
      {/* Domed circular dark-blue shield */}
      <mesh scale={[1, 1, 0.28]} castShadow receiveShadow>
        <sphereGeometry args={[0.19, 22, 16]} />
        <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
      </mesh>
      <mesh scale={[1 * OUTLINE_SCALE, 1 * OUTLINE_SCALE, 0.28 * OUTLINE_SCALE]}>
        <sphereGeometry args={[0.19, 16, 12]} />
        <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
      </mesh>
      {/* Thick metallic gold rim */}
      <mesh position={[0, 0, 0.01]} castShadow>
        <torusGeometry args={[0.188, 0.024, 10, 26]} />
        <meshStandardMaterial color={secondaryColor} {...METAL_MAT} />
      </mesh>
      {/* Raised 3D white "f" */}
      <group position={[0, 0, 0.056]}>
        <RoundedBox
          args={[0.044, 0.17, 0.024]}
          radius={0.008}
          smoothness={2}
          position={[-0.005, -0.01, 0]}
          castShadow
        >
          <meshStandardMaterial color="#FFFFFF" {...VINYL_MAT} />
        </RoundedBox>
        <RoundedBox
          args={[0.095, 0.04, 0.024]}
          radius={0.008}
          smoothness={2}
          position={[0.02, 0.068, 0]}
          castShadow
        >
          <meshStandardMaterial color="#FFFFFF" {...VINYL_MAT} />
        </RoundedBox>
        <RoundedBox
          args={[0.105, 0.036, 0.024]}
          radius={0.008}
          smoothness={2}
          position={[0.005, 0.005, 0]}
          castShadow
        >
          <meshStandardMaterial color="#FFFFFF" {...VINYL_MAT} />
        </RoundedBox>
      </group>
    </group>
  );
}

/** 14. SpeechBubbles: 3 bong bóng thoại trắng-xanh trôi lơ lửng nhấp nhô */
function SpeechBubblesProp({
  primaryColor = "#FAF7F0",
  secondaryColor = "#72B8E2",
}: PropRenderOptions) {
  const b1Ref = useRef<Group>(null);
  const b2Ref = useRef<Group>(null);
  const b3Ref = useRef<Group>(null);
  const geom = getSpeechBubbleGeometry();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (b1Ref.current) {
      b1Ref.current.position.y = 0.12 + Math.sin(t * 2.4) * 0.045;
      b1Ref.current.rotation.z = Math.sin(t * 1.8) * 0.08;
    }
    if (b2Ref.current) {
      b2Ref.current.position.y = -0.02 + Math.sin(t * 2.8 + 1.8) * 0.05;
      b2Ref.current.rotation.z = Math.cos(t * 2.0) * 0.08;
    }
    if (b3Ref.current) {
      b3Ref.current.position.y = 0.22 + Math.sin(t * 3.1 + 3.4) * 0.04;
      b3Ref.current.rotation.z = Math.sin(t * 2.2 + 1) * 0.1;
    }
  });

  return (
    <group>
      {/* Bubble 1: Ivory white */}
      <group ref={b1Ref} position={[-0.04, 0.12, 0]}>
        <mesh geometry={geom} castShadow>
          <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
        </mesh>
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.026]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
        ))}
      </group>

      {/* Bubble 2: Soft blue */}
      <group ref={b2Ref} position={[0.14, -0.02, 0.04]} scale={0.78}>
        <mesh geometry={geom} castShadow>
          <meshStandardMaterial color={secondaryColor} {...VINYL_MAT} />
        </mesh>
        {[-0.038, 0, 0.038].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.026]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        ))}
      </group>

      {/* Bubble 3: Mini floating white bubble */}
      <group ref={b3Ref} position={[0.12, 0.22, -0.04]} scale={0.58}>
        <mesh geometry={geom} castShadow>
          <meshStandardMaterial color={primaryColor} {...VINYL_MAT} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Master prop dispatcher — returns a modular <group> for any of the 14 prop types.
 */
export function renderProp(type: PropType, options: PropRenderOptions = {}) {
  switch (type) {
    case "none":
      return null;
    case "scroll":
      return <ScrollProp {...options} />;
    case "notebook":
      return <NotebookProp {...options} />;
    case "quill":
      return <QuillProp {...options} />;
    case "clapperboard":
      return <ClapperboardProp {...options} />;
    case "megaphone":
      return <MegaphoneProp {...options} />;
    case "shoppingBag":
      return <ShoppingBagProp {...options} />;
    case "priceSign":
      return <PriceSignProp {...options} />;
    case "wrench":
      return <WrenchProp {...options} />;
    case "blueprint":
      return <BlueprintProp {...options} />;
    case "bigBook":
      return <BigBookProp {...options} />;
    case "miniChart":
      return <MiniChartProp {...options} />;
    case "laptop":
      return <LaptopProp {...options} />;
    case "shieldF":
      return <ShieldFProp {...options} />;
    case "speechBubbles":
      return <SpeechBubblesProp {...options} />;
  }
}
