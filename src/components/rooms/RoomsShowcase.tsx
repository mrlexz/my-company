"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  OrbitControls,
  PerspectiveCamera,
  RoundedBox,
  View,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Character } from "@/components/office/Character";
import { getHoneyWoodTexture } from "@/components/office/furniture/furnitureTextures";
import { RoomFurniture } from "@/components/office/RoomFurniture";
import { useOfficeData } from "@/hooks/useOfficeData";
import { checkWallFacingAngle } from "@/lib/facingUtils";
import {
  computeOfficeRooms,
  LOW_PARTITION_HEIGHT,
  WALL_THICKNESS,
} from "@/lib/officeLayout";
import { MEMBER_SEATS, type Vec3 } from "@/lib/officePathfinding";
import type { Department } from "@/types/office";

function RoomTurntableCard({
  department,
  autoRotate,
  showCharacters,
  showFacingCone,
}: {
  department: Department;
  autoRotate: boolean;
  showCharacters: boolean;
  showFacingCone: boolean;
}) {
  const { departments } = useOfficeData();
  const honeyWoodMap = getHoneyWoodTexture();

  const room = useMemo(() => {
    const rooms = computeOfficeRooms(departments);
    return rooms.find((r) => r.department.id === department.id);
  }, [departments, department.id]);

  if (!room) return null;

  const { width, depth, position: roomWorldPos } = room;
  const h = LOW_PARTITION_HEIGHT;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-[#DFD6BE] bg-[#FCF9F2] shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-80 w-full bg-[#EFE7D4] sm:h-96">
        <View className="h-full w-full cursor-grab active:cursor-grabbing">
          <color attach="background" args={["#EFE7D4"]} />
          <PerspectiveCamera makeDefault position={[5.2, 4.8, 6.0]} fov={38} />
          <ambientLight intensity={0.82} color="#FFF8EC" />
          <hemisphereLight args={["#FFFDF7", "#C6B494", 0.5]} />
          <directionalLight
            position={[8, 12, 8]}
            intensity={1.3}
            color="#FFF4DF"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight
            position={[-6, 5, -6]}
            intensity={0.4}
            color="#DDE8F8"
          />

          <group position={[0, -0.45, 0]}>
            {/* Honey-wood floor */}
            <mesh position={[0, -0.1, 0]} receiveShadow>
              <boxGeometry args={[width, 0.2, depth]} />
              <meshStandardMaterial
                map={honeyWoodMap ?? undefined}
                color="#D4AA72"
                roughness={0.82}
              />
            </mesh>

            {/* Low open-plan vinyl partitions */}
            <RoundedBox
              args={[width, 1.8, WALL_THICKNESS]}
              radius={0.03}
              smoothness={2}
              position={[0, 0.9, -depth / 2 + WALL_THICKNESS / 2]}
              receiveShadow
            >
              <meshStandardMaterial color="#EFE3CE" roughness={0.86} />
            </RoundedBox>
            <RoundedBox
              args={[WALL_THICKNESS, h, depth]}
              radius={0.03}
              smoothness={2}
              position={[-width / 2 + WALL_THICKNESS / 2, h / 2, 0]}
              receiveShadow
            >
              <meshStandardMaterial color="#E9D9BF" roughness={0.86} />
            </RoundedBox>
            <RoundedBox
              args={[WALL_THICKNESS + 0.04, 0.08, depth]}
              radius={0.02}
              smoothness={2}
              position={[-width / 2 + WALL_THICKNESS / 2, h + 0.02, 0]}
            >
              <meshStandardMaterial color={department.color} roughness={0.75} />
            </RoundedBox>

            <RoomFurniture
              departmentId={department.id}
              accentColor={department.color}
            />

            {showCharacters &&
              department.members.map((member) => {
                const seat = MEMBER_SEATS[member.id];
                if (!seat) return null;
                const localPos: Vec3 = [
                  seat.position[0] - roomWorldPos[0],
                  seat.position[1] - roomWorldPos[1],
                  seat.position[2] - roomWorldPos[2],
                ];
                return (
                  <Character
                    key={member.id}
                    id={member.id}
                    state="working"
                    showDebugFacing={showFacingCone}
                    initialPosition={localPos}
                    initialRotationY={seat.rotationY}
                  />
                );
              })}
          </group>

          <OrbitControls
            makeDefault
            target={[0, 0.6, -0.1]}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={0.85}
            minDistance={3.5}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
          />
        </View>

        <span className="pointer-events-none absolute left-4 top-3.5 z-30 inline-flex items-center gap-2 rounded-full bg-[#FCF9F2]/92 px-3 py-1 text-xs font-bold text-[#2A251D] shadow-sm backdrop-blur-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: department.color }}
          />
          {department.name}
        </span>
      </div>

      {/* Room Name, ShortDesc & Members Only (no floor diagram) */}
      <div className="p-5">
        <h2 className="text-lg font-extrabold text-[#2A251D]">
          {department.name}
        </h2>
        <p className="mt-1 text-sm text-[#5C5343]">{department.shortDesc}</p>

        <div className="mt-3.5 flex flex-wrap gap-2">
          {department.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-xl border border-[#E5DEC9] bg-white px-3 py-1.5"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                style={{ backgroundColor: member.avatarStyle.shirtColor }}
              >
                {member.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="text-xs">
                <span className="font-bold text-[#2A251D]">{member.name}</span>
                <span className="ml-1.5 text-[#7C715D]">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function RoomsShowcase() {
  const { departments, companyName } = useOfficeData();
  const [autoRotate, setAutoRotate] = useState(true);
  const [showCharacters, setShowCharacters] = useState(true);
  const [showFacingCone, setShowFacingCone] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const wallChecks = useMemo(() => {
    return departments.flatMap((dept) =>
      dept.workstations.map((ws) => ({
        memberId: ws.memberId,
        deptName: dept.name,
        ...checkWallFacingAngle(ws.facing),
      }))
    );
  }, [departments]);

  const unsafeCount = wallChecks.filter((c) => !c.isSafe).length;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#F5EFE0] px-4 py-8 sm:px-8"
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <View.Port />
      </Canvas>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <header className="relative z-30 flex flex-col gap-4 border-b border-[#DFD6BE] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD6BE] bg-[#FCF9F2] px-3 py-1 text-xs font-semibold text-[#3F5B2F] transition-colors hover:bg-[#EFE7D4]"
              >
                ← Về văn phòng 3D
              </Link>
              <Link
                href="/characters"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD6BE] bg-[#FCF9F2] px-3 py-1 text-xs font-semibold text-[#5C5343] transition-colors hover:bg-[#EFE7D4]"
              >
                Xem nhân vật & đạo cụ →
              </Link>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2A251D]">
              4 Phòng ban · {companyName}
            </h1>
            <p className="mt-1 text-sm text-[#6B6253]">
              Không gian một tầng với vách ngăn thấp, gỗ mật ong vân canvas và
              nội thất bo tròn vinyl.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFacingCone((v) => !v)}
              className={`cursor-pointer rounded-2xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-colors ${
                showFacingCone
                  ? "border-[#059669] bg-[#059669] text-[#FCF9F2]"
                  : "border-[#DFD6BE] bg-[#FCF9F2] text-[#5C5343]"
              }`}
            >
              Kiểm tra hướng: {showFacingCone ? "BẬT" : "TẮT"}
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              className={`cursor-pointer rounded-2xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-colors ${autoRotate
                ? "border-[#3F5B2F] bg-[#3F5B2F] text-[#FCF9F2]"
                : "border-[#DFD6BE] bg-[#FCF9F2] text-[#5C5343]"
                }`}
            >
              Camera tự xoay: {autoRotate ? "BẬT" : "TẮT"}
            </button>
            <button
              type="button"
              onClick={() => setShowCharacters((v) => !v)}
              className={`cursor-pointer rounded-2xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-colors ${showCharacters
                ? "border-[#2A251D] bg-[#2A251D] text-[#FCF9F2]"
                : "border-[#DFD6BE] bg-[#FCF9F2] text-[#5C5343]"
                }`}
            >
              Nhân vật: {showCharacters ? "HIỆN" : "ẨN"}
            </button>
          </div>
        </header>

        {showFacingCone && (
          <div
            className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold ${
              unsafeCount === 0
                ? "border-[#059669]/40 bg-[#ECFDF5] text-[#065F46]"
                : "border-[#D97706]/40 bg-[#FFFBEB] text-[#92400E]"
            }`}
          >
            {unsafeCount === 0
              ? `✓ Kiểm tra hướng nhìn: 10/10 nhân vật đều quay mặt ra sảnh/camera (góc với tường ≥ 60° — nhỏ nhất ${Math.min(...wallChecks.map((c) => c.minAngleToWallDeg))}°).`
              : `⚠ Có ${unsafeCount} nhân vật hướng nhìn hợp với tường dưới 60°.`}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {departments.map((dept) => (
            <RoomTurntableCard
              key={dept.id}
              department={dept}
              autoRotate={autoRotate}
              showCharacters={showCharacters}
              showFacingCone={showFacingCone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
