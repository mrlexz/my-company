"use client";

import { useMemo } from "react";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useOfficeData } from "@/hooks/useOfficeData";
import {
  computeOfficeRooms,
  LOW_PARTITION_HEIGHT,
  WALL_THICKNESS,
} from "@/lib/officeLayout";
import { MEMBER_SEATS, type Vec3 } from "@/lib/officePathfinding";
import type { Department } from "@/types/office";
import { Character } from "./Character";
import { getHoneyWoodTexture } from "./furniture/furnitureTextures";
import { RoomFurniture } from "./RoomFurniture";

interface RoomInteriorPreviewProps {
  department: Department;
}

function MiniRoomStage({ department }: { department: Department }) {
  const { departments } = useOfficeData();

  const room = useMemo(() => {
    const rooms = computeOfficeRooms(departments);
    return rooms.find((r) => r.department.id === department.id);
  }, [departments, department.id]);

  if (!room) return null;

  const { width, depth, position: roomWorldPos } = room;
  const honeyWoodMap = getHoneyWoodTexture();
  const h = LOW_PARTITION_HEIGHT;

  return (
    <>
      <color attach="background" args={["#F2EAD7"]} />
      <ambientLight intensity={0.85} color="#FFF8EC" />
      <hemisphereLight args={["#FFFDF7", "#C8B696", 0.5]} />
      <directionalLight
        position={[6, 10, 7]}
        intensity={1.25}
        color="#FFF3DC"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <group position={[0, -0.4, 0]}>
        {/* Honey Wood Floor */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial
            map={honeyWoodMap ?? undefined}
            color="#D4AA72"
            roughness={0.82}
          />
        </mesh>

        {/* Low back & side vinyl partitions */}
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

        {/* Furniture */}
        <RoomFurniture
          departmentId={department.id}
          accentColor={department.color}
        />

        {/* Working Members converted into Room-Local Coordinates */}
        {department.members.map((member) => {
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
              initialPosition={localPos}
              initialRotationY={seat.rotationY}
            />
          );
        })}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.55}
        target={[0, 0.55, -0.15]}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.4}
      />
    </>
  );
}

export function RoomInteriorPreview({ department }: RoomInteriorPreviewProps) {
  return (
    <Canvas
      key={department.id}
      shadows
      dpr={[1, 1.5]}
      camera={{
        position: [4.2, 4.2, 5.2],
        fov: 40,
        near: 0.1,
        far: 60,
      }}
    >
      <MiniRoomStage department={department} />
    </Canvas>
  );
}
