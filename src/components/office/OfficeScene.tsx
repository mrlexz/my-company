"use client";

import { useEffect, useMemo, useRef } from "react";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import rawWorkflow from "@/data/workflow.json";
import { useCameraFocus } from "@/hooks/useCameraFocus";
import { useOfficeData } from "@/hooks/useOfficeData";
import {
  BUILDING_DEPTH,
  BUILDING_WIDTH,
  CAMERA_AZIMUTH_LIMIT,
  CAMERA_BASE_AZIMUTH,
  computeOfficeRooms,
  INTRO_CAMERA_TARGET,
  LOW_PARTITION_HEIGHT,
  OUTER_WALL_HEIGHT,
  WALL_THICKNESS,
  type ComputedRoom,
} from "@/lib/officeLayout";
import { OfficeLifeEngine } from "@/lib/officeLifeEngine";
import {
  MEMBER_SEATS,
  ROOM_VISIT_POINTS,
  type Vec3,
} from "@/lib/officePathfinding";
import { useOfficeStore } from "@/store/useOfficeStore";
import type {
  CharacterState,
  WorkflowData,
  WorkflowSkillTag,
} from "@/types/office";
import { Character } from "./Character";
import { EnvironmentProps } from "./EnvironmentProps";
import { getHoneyWoodTexture } from "./furniture/furnitureTextures";
import { LobbyFurniture } from "./furniture/LobbyFurniture";
import { PostProcessingEffects } from "./PostProcessingEffects";
import { RoomFurniture } from "./RoomFurniture";
import { WorkPacket } from "./WorkPacket";

const workflowData = rawWorkflow as WorkflowData;

interface SingleStoryRoomProps {
  room: ComputedRoom;
  isHovered: boolean;
  isSelected: boolean;
  isWorkflowActive: boolean;
  activeSkills: WorkflowSkillTag[];
  isDimmed: boolean;
  hasSelection: boolean;
  showLabels: boolean;
  onHoverChange: (hovered: boolean) => void;
  onSelect: () => void;
}

/** Glowing floor outline frame when hovering, selecting, or running workflow in a room */
function RoomHighlightFrame({
  width,
  depth,
  color,
  visible,
}: {
  width: number;
  depth: number;
  color: string;
  visible: boolean;
}) {
  if (!visible) return null;
  const t = 0.08;
  const y = 0.06;

  return (
    <group>
      <mesh position={[0, y, depth / 2 - 0.02]}>
        <boxGeometry args={[width + 0.06, t, t]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, y, -depth / 2 + 0.02]}>
        <boxGeometry args={[width + 0.06, t, t]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-width / 2 + 0.02, y, 0]}>
        <boxGeometry args={[t, t, depth + 0.06]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[width / 2 - 0.02, y, 0]}>
        <boxGeometry args={[t, t, depth + 0.06]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Low vinyl/glass partition walls (~40% character height) bordering the central cross lobby, with open doorway & colored nameplate */
function RoomLowPartitions({
  room,
}: {
  room: ComputedRoom;
}) {
  const { department, width, depth } = room;
  const [cx, , cz] = room.position;
  const isLeftSide = cx < 0;
  const isBackSide = cz < 0;

  // Inner vertical edge facing central lobby (X = +width/2 for left rooms, -width/2 for right rooms)
  const lobbyEdgeX = isLeftSide ? width / 2 : -width / 2;
  // Inner horizontal edge facing horizontal cross arm (Z = +depth/2 for back rooms, -depth/2 for front rooms)
  const lobbyEdgeZ = isBackSide ? depth / 2 : -depth / 2;

  const h = LOW_PARTITION_HEIGHT;
  const doorGap = 1.45;
  const sideSegLen = (depth - doorGap) / 2;

  return (
    <group>
      {/* Horizontal low partition along the cross-lobby arm */}
      <group position={[0, 0, lobbyEdgeZ]}>
        <RoundedBox
          args={[width - 0.1, h, 0.12]}
          radius={0.03}
          smoothness={2}
          position={[0, h / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#EFE3CE" roughness={0.85} />
        </RoundedBox>
        {/* Department-colored top rail */}
        <RoundedBox
          args={[width - 0.06, 0.075, 0.15]}
          radius={0.02}
          smoothness={2}
          position={[0, h + 0.02, 0]}
          castShadow
        >
          <meshStandardMaterial color={department.color} roughness={0.75} />
        </RoundedBox>
      </group>

      {/* Vertical low partition facing central lobby with open doorway in the middle */}
      {[-depth / 2 + sideSegLen / 2, depth / 2 - sideSegLen / 2].map((z, idx) => (
        <group key={idx} position={[lobbyEdgeX, 0, z]}>
          <RoundedBox
            args={[0.12, h, sideSegLen]}
            radius={0.03}
            smoothness={2}
            position={[0, h / 2, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#EFE3CE" roughness={0.85} />
          </RoundedBox>
          <RoundedBox
            args={[0.15, 0.075, sideSegLen + 0.04]}
            radius={0.02}
            smoothness={2}
            position={[0, h + 0.02, 0]}
            castShadow
          >
            <meshStandardMaterial color={department.color} roughness={0.75} />
          </RoundedBox>
        </group>
      ))}

      {/* Doorway Posts + Colored Department Nameplate (biển tên trên cửa) */}
      <group position={[lobbyEdgeX, 0, 0]}>
        {[-doorGap / 2, doorGap / 2].map((z, idx) => (
          <mesh key={idx} position={[0, 0.42, z]} castShadow>
            <capsuleGeometry args={[0.055, 0.72, 6, 8]} />
            <meshStandardMaterial color={department.color} roughness={0.75} />
          </mesh>
        ))}
        {/* Colored nameplate plaque mounted on doorway post */}
        <RoundedBox
          args={[0.09, 0.24, 0.65]}
          radius={0.025}
          smoothness={2}
          position={[0, 0.72, -doorGap / 2 - 0.35]}
          castShadow
        >
          <meshStandardMaterial color={department.color} roughness={0.7} />
        </RoundedBox>
      </group>
    </group>
  );
}

/** Two moderate-height beige outer walls (-Z and -X) decorated with windows, paintings, wall clock & shelves */
function OuterDecoratedWalls() {
  const h = OUTER_WALL_HEIGHT;
  const halfW = BUILDING_WIDTH / 2;
  const halfD = BUILDING_DEPTH / 2;

  return (
    <group>
      {/* Back Wall (-Z) */}
      <group position={[0, 0, -halfD - WALL_THICKNESS / 2]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[BUILDING_WIDTH + WALL_THICKNESS * 2, h, WALL_THICKNESS]} />
          <meshStandardMaterial color="#EFE3CE" roughness={0.86} />
        </mesh>
        {/* Baseboard & Crown Molding */}
        <mesh position={[0, 0.13, WALL_THICKNESS / 2 + 0.025]}>
          <boxGeometry args={[BUILDING_WIDTH, 0.26, 0.05]} />
          <meshStandardMaterial color="#9E734A" roughness={0.84} />
        </mesh>
        <mesh position={[0, h - 0.08, WALL_THICKNESS / 2 + 0.035]}>
          <boxGeometry args={[BUILDING_WIDTH, 0.16, 0.07]} />
          <meshStandardMaterial color="#C89E6E" roughness={0.82} />
        </mesh>

        {/* Framed Windows along back wall */}
        {[-4.8, 4.6].map((x, idx) => (
          <group key={idx} position={[x, 1.55, WALL_THICKNESS / 2 + 0.03]}>
            <RoundedBox args={[1.65, 1.1, 0.08]} radius={0.03} smoothness={2}>
              <meshStandardMaterial color="#8F653E" roughness={0.82} />
            </RoundedBox>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[1.45, 0.9, 0.03]} />
              <meshPhysicalMaterial
                color="#D2ECFA"
                transparent
                opacity={0.55}
                roughness={0.12}
                clearcoat={0.8}
              />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[1.45, 0.05, 0.03]} />
              <meshStandardMaterial color="#8F653E" roughness={0.82} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <boxGeometry args={[0.05, 0.9, 0.03]} />
              <meshStandardMaterial color="#8F653E" roughness={0.82} />
            </mesh>
          </group>
        ))}

        {/* Wall Clock above central back lobby */}
        <group position={[-1.4, 2.05, WALL_THICKNESS / 2 + 0.04]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.06, 20]} />
            <meshStandardMaterial color="#7C5636" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.21, 0.21, 0.015, 20]} />
            <meshStandardMaterial color="#FCF9F2" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.06, 0.048]}>
            <boxGeometry args={[0.02, 0.12, 0.01]} />
            <meshStandardMaterial color="#2A251D" />
          </mesh>
          <mesh position={[0.045, 0, 0.048]}>
            <boxGeometry args={[0.09, 0.02, 0.01]} />
            <meshStandardMaterial color="#2A251D" />
          </mesh>
        </group>

        {/* Framed Paintings */}
        <group position={[-2.6, 1.55, WALL_THICKNESS / 2 + 0.04]}>
          <RoundedBox args={[0.95, 0.72, 0.06]} radius={0.02} smoothness={2}>
            <meshStandardMaterial color="#8F653E" roughness={0.82} />
          </RoundedBox>
          <mesh position={[0, 0, 0.035]}>
            <planeGeometry args={[0.8, 0.56]} />
            <meshStandardMaterial color="#8EB162" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Left Wall (-X) */}
      <group position={[-halfW - WALL_THICKNESS / 2, 0, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[WALL_THICKNESS, h, BUILDING_DEPTH]} />
          <meshStandardMaterial color="#E9D9BF" roughness={0.86} />
        </mesh>
        <mesh position={[WALL_THICKNESS / 2 + 0.025, 0.13, 0]}>
          <boxGeometry args={[0.05, 0.26, BUILDING_DEPTH]} />
          <meshStandardMaterial color="#9E734A" roughness={0.84} />
        </mesh>
        <mesh position={[WALL_THICKNESS / 2 + 0.035, h - 0.08, 0]}>
          <boxGeometry args={[0.07, 0.16, BUILDING_DEPTH]} />
          <meshStandardMaterial color="#C89E6E" roughness={0.82} />
        </mesh>

        {/* Framed Windows on Left Wall */}
        {[-3.4, 3.2].map((z, idx) => (
          <group
            key={idx}
            position={[WALL_THICKNESS / 2 + 0.03, 1.55, z]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <RoundedBox args={[1.55, 1.05, 0.08]} radius={0.03} smoothness={2}>
              <meshStandardMaterial color="#8F653E" roughness={0.82} />
            </RoundedBox>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[1.35, 0.85, 0.03]} />
              <meshPhysicalMaterial
                color="#D2ECFA"
                transparent
                opacity={0.55}
                roughness={0.12}
                clearcoat={0.8}
              />
            </mesh>
          </group>
        ))}

        {/* Wall Shelf in Left Lobby Corridor */}
        <group position={[WALL_THICKNESS / 2 + 0.14, 1.55, 0]}>
          <RoundedBox args={[0.24, 0.06, 1.25]} radius={0.02} smoothness={2} castShadow>
            <meshStandardMaterial color="#B9874E" roughness={0.82} />
          </RoundedBox>
          {[-0.3, 0, 0.3].map((z, i) => (
            <RoundedBox
              key={i}
              args={[0.14, 0.22, 0.14]}
              radius={0.02}
              smoothness={2}
              position={[0, 0.14, z]}
            >
              <meshStandardMaterial
                color={["#3F5B2F", "#E07A5F", "#2F6B8A"][i]}
                roughness={0.8}
              />
            </RoundedBox>
          ))}
        </group>
      </group>
    </group>
  );
}

function SingleStoryRoom({
  room,
  isHovered,
  isSelected,
  isWorkflowActive,
  activeSkills,
  isDimmed,
  hasSelection,
  showLabels,
  onHoverChange,
  onSelect,
}: SingleStoryRoomProps) {
  const { department, position, width, depth, labelPosition } = room;
  const contentGroupRef = useRef<Group>(null);

  useEffect(() => {
    const group = contentGroupRef.current;
    if (!group) return;

    group.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const materials: Material[] = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        if (mat.userData.origOpacity === undefined) {
          mat.userData.origOpacity = mat.opacity;
          mat.userData.origTransparent = mat.transparent;
        }
        const origOpacity = mat.userData.origOpacity as number;
        const origTransparent = mat.userData.origTransparent as boolean;

        if (isDimmed) {
          mat.transparent = true;
          mat.opacity = origOpacity * 0.45;
        } else {
          mat.transparent = origTransparent;
          mat.opacity = origOpacity;
        }
        mat.needsUpdate = true;
      });
    });
  }, [isDimmed]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverChange(true);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverChange(false);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <group ref={contentGroupRef}>
        {/* Invisible interactive floor hit area matching room rect */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Low Partition Walls + Doorway + Nameplate */}
        <RoomLowPartitions room={room} />

        {/* Room Furniture + Bespoke Rug + Live Monitors */}
        <RoomFurniture
          departmentId={department.id}
          accentColor={department.color}
        />
      </group>

      {/* Glowing Outline */}
      <RoomHighlightFrame
        width={width}
        depth={depth}
        color={department.color}
        visible={isHovered || isSelected || isWorkflowActive}
      />

      {/* Running Skill Pills during Workflow */}
      {showLabels && isWorkflowActive && activeSkills.length > 0 && (
        <Html position={[0, 2.95, 0]} center zIndexRange={[15, 0]}>
          <div className="pointer-events-none flex max-w-[300px] flex-wrap justify-center gap-1.5">
            {activeSkills.map((tag) => (
              <div
                key={`${tag.actorId}-${tag.skill}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-[#231F18]/92 px-2.5 py-1 text-[11px] font-medium text-[#FAF6EC] shadow-md backdrop-blur-sm"
                style={{ borderColor: department.color }}
              >
                <span
                  className="h-2 w-2 animate-pulse rounded-full"
                  style={{ backgroundColor: department.color }}
                />
                <span className="font-bold">{tag.actorName}:</span>
                <code className="font-mono text-[#E8C66D]">{tag.skill}</code>
              </div>
            ))}
          </div>
        </Html>
      )}

      {/* Floating Room Label */}
      {showLabels && (
        <Html
          position={labelPosition}
          center
          zIndexRange={[10, 0]}
          style={{
            transition: "opacity 200ms ease, transform 200ms ease",
            opacity: isDimmed ? 0.35 : hasSelection && !isSelected ? 0.3 : 1,
            pointerEvents: hasSelection && !isSelected ? "none" : "auto",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            className="group flex max-w-[195px] cursor-pointer flex-col items-start rounded-xl border bg-[#FCF9F2]/95 px-3 py-2 text-left shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              borderColor:
                isHovered || isSelected ? department.color : "#DFD6BE",
              boxShadow:
                isHovered || isSelected
                  ? `0 6px 18px -4px ${department.color}55`
                  : undefined,
            }}
          >
            <div className="flex w-full items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: department.color }}
              />
              <span className="truncate text-xs font-bold tracking-tight text-[#2A251D]">
                {department.name}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#6B6253]">
              {department.shortDesc}
            </p>
          </button>
        </Html>
      )}
    </group>
  );
}

/** Visualizes the 14x12 A* walkable grid on the floor when Debug mode (D) is active */
function DebugWalkableGrid() {
  const { lobby } = useOfficeData();
  const { grid } = lobby;

  return (
    <group position={[0, 0.035, 0]}>
      {grid.walkable.map((row, r) =>
        row.map((cell, c) => {
          const x = grid.origin[0] + (c + 0.5) * grid.cellSize;
          const z = grid.origin[1] + (r + 0.5) * grid.cellSize;
          return (
            <mesh
              key={`${r}-${c}`}
              position={[x, 0, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[grid.cellSize * 0.88, grid.cellSize * 0.88]} />
              <meshBasicMaterial
                color={cell === 1 ? "#10B981" : "#EF4444"}
                transparent
                opacity={cell === 1 ? 0.16 : 0.14}
                depthWrite={false}
              />
            </mesh>
          );
        })
      )}
    </group>
  );
}

export function OfficeScene({ enableSSAO = true }: { enableSSAO?: boolean }) {
  const { departments, allMembers, getDepartmentById } = useOfficeData();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const honeyWoodMap = getHoneyWoodTexture();

  const hasEnteredOffice = useOfficeStore((s) => s.hasEnteredOffice);
  const selectedDepartmentId = useOfficeStore((s) => s.selectedDepartmentId);
  const hoveredDepartmentId = useOfficeStore((s) => s.hoveredDepartmentId);
  const selectedMemberId = useOfficeStore((s) => s.selectedMemberId);
  const hoveredMemberId = useOfficeStore((s) => s.hoveredMemberId);
  const postProcessingEnabled = useOfficeStore((s) => s.postProcessingEnabled);
  const debugFacing = useOfficeStore((s) => s.debugFacing);
  const lifeSnapshots = useOfficeStore((s) => s.lifeSnapshots);
  const characterAction = useOfficeStore((s) => s.characterAction);
  const isWorkflowRunning = useOfficeStore((s) => s.isWorkflowRunning);
  const workflowStepIndex = useOfficeStore((s) => s.workflowStepIndex);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  const clearSelection = useOfficeStore((s) => s.clearSelection);
  const setHoveredDepartment = useOfficeStore((s) => s.setHoveredDepartment);
  const setSelectedMember = useOfficeStore((s) => s.setSelectedMember);
  const setHoveredMember = useOfficeStore((s) => s.setHoveredMember);
  const setLifeSnapshots = useOfficeStore((s) => s.setLifeSnapshots);
  const setWorkflowStepIndex = useOfficeStore((s) => s.setWorkflowStepIndex);
  const finishWorkflow = useOfficeStore((s) => s.finishWorkflow);

  // Centralized Office Life Simulation Engine (ticked at 10Hz in one single useFrame)
  const lifeEngine = useMemo(
    () => new OfficeLifeEngine(allMembers.map((m) => m.id)),
    [allMembers]
  );
  const aiAccumulatorRef = useRef(0);

  // Sync initial snapshots on mount
  useEffect(() => {
    setLifeSnapshots(lifeEngine.getSnapshots());
  }, [lifeEngine, setLifeSnapshots]);

  // Pause autonomous Office Life while intro or workflow is active
  useEffect(() => {
    lifeEngine.setPaused(!hasEnteredOffice || isWorkflowRunning);
    setLifeSnapshots(lifeEngine.getSnapshots());
  }, [hasEnteredOffice, isWorkflowRunning, lifeEngine, setLifeSnapshots]);

  // Handle viewer commands ("Gọi đến sảnh" / "Hối thúc")
  useEffect(() => {
    if (!characterAction) return;
    if (characterAction.type === "callToLobby") {
      lifeEngine.callToLobby(characterAction.memberId);
    } else if (characterAction.type === "hurry") {
      lifeEngine.hurryCharacter(characterAction.memberId);
    }
    setLifeSnapshots(lifeEngine.getSnapshots());
  }, [characterAction, lifeEngine, setLifeSnapshots]);

  // Single centralized 10Hz AI loop (zero per-character AI useFrames!)
  useFrame((_, delta) => {
    if (!hasEnteredOffice || isWorkflowRunning) return;
    aiAccumulatorRef.current += Math.min(delta, 0.1);
    if (aiAccumulatorRef.current >= 0.1) {
      const stepDt = aiAccumulatorRef.current;
      aiAccumulatorRef.current = 0;
      if (lifeEngine.tick(stepDt)) {
        setLifeSnapshots(lifeEngine.getSnapshots());
      }
    }
  });

  const computedRooms = useMemo(
    () => computeOfficeRooms(departments),
    [departments]
  );

  const { focusOn, focusDepartment, resetCamera } = useCameraFocus(
    controlsRef,
    computedRooms
  );

  const currentStep =
    isWorkflowRunning &&
    workflowStepIndex >= 0 &&
    workflowStepIndex < workflowData.steps.length
      ? workflowData.steps[workflowStepIndex]
      : null;

  // Advance workflow steps automatically
  useEffect(() => {
    if (!isWorkflowRunning || !currentStep) return;

    const timer = window.setTimeout(() => {
      if (workflowStepIndex + 1 < workflowData.steps.length) {
        setWorkflowStepIndex(workflowStepIndex + 1);
      } else {
        finishWorkflow();
      }
    }, currentStep.durationMs);

    return () => window.clearTimeout(timer);
  }, [
    isWorkflowRunning,
    workflowStepIndex,
    currentStep,
    setWorkflowStepIndex,
    finishWorkflow,
  ]);

  useEffect(() => {
    document.body.style.cursor =
      hasEnteredOffice && hoveredDepartmentId ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hasEnteredOffice, hoveredDepartmentId]);

  // Camera control: intro fly-in, single-story room focus, gentle workflow tracking
  useEffect(() => {
    if (!hasEnteredOffice) return;

    if (isWorkflowRunning && currentStep) {
      if (currentStep.isCelebration || !currentStep.activeDepartment) {
        resetCamera(1.3);
      } else {
        const room = computedRooms.find(
          (r) => r.department.id === currentStep.activeDepartment
        );
        if (room) {
          focusOn({
            position: [
              room.cameraFocus.position[0] + 2.2,
              room.cameraFocus.position[1] + 2.8,
              room.cameraFocus.position[2] + 3.0,
            ],
            target: room.cameraFocus.target,
            duration: 1.25,
          });
        }
      }
      return;
    }

    if (selectedDepartmentId) {
      focusDepartment(selectedDepartmentId, 1.2);
    } else {
      resetCamera(1.35);
    }
  }, [
    hasEnteredOffice,
    isWorkflowRunning,
    currentStep,
    selectedDepartmentId,
    computedRooms,
    focusOn,
    focusDepartment,
    resetCamera,
  ]);

  const activePacket = useMemo(() => {
    if (!currentStep?.packet) return null;
    const fromSeat = MEMBER_SEATS[currentStep.packet.from];
    const toSeat = MEMBER_SEATS[currentStep.packet.to];
    if (!fromSeat || !toSeat) return null;

    const activeDept = currentStep.activeDepartment
      ? getDepartmentById(currentStep.activeDepartment)
      : undefined;

    return {
      key: `${currentStep.id}-${workflowStepIndex}`,
      from: fromSeat.position,
      to: toSeat.position,
      color: activeDept?.color ?? "#E5B94E",
    };
  }, [currentStep, workflowStepIndex, getDepartmentById]);

  return (
    <>
      <fog attach="fog" args={["#F3ECDD", 38, 72]} />

      {/* Warm Hemisphere + Soft Shadow Directional + Interior PointLights */}
      <ambientLight intensity={0.44} color="#FFF6E5" />
      <hemisphereLight args={["#FFF8EB", "#C9B08A", 0.62]} />
      <directionalLight
        position={[14, 24, 14]}
        intensity={1.45}
        color="#FFF0D6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={5}
        shadow-camera-near={2}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <directionalLight
        position={[-12, 10, -10]}
        intensity={0.35}
        color="#DCEAF8"
      />

      {/* Warm Interior PointLights in each of the 4 quadrants + central lobby */}
      <pointLight position={[-4.25, 2.5, -3.6]} intensity={1.7} distance={8} decay={2} color="#FFE6B5" />
      <pointLight position={[4.25, 2.5, -3.6]} intensity={1.7} distance={8} decay={2} color="#FFE5B8" />
      <pointLight position={[-4.25, 2.5, 3.6]} intensity={1.7} distance={8} decay={2} color="#E6DCFF" />
      <pointLight position={[4.25, 2.5, 3.6]} intensity={1.7} distance={8} decay={2} color="#FFE8C2" />
      <pointLight position={[0, 2.8, 0]} intensity={1.6} distance={8} decay={2} color="#FFF1D0" />

      {/* Floating Island & Outdoor Scenery */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          if (selectedDepartmentId && !isWorkflowRunning) {
            clearSelection();
          }
        }}
      >
        <EnvironmentProps />
      </group>

      {/* Single-Story 2x2 Office Building */}
      <group>
        {/* Wide Rectangular Honey-Wood Floor Slab */}
        <mesh position={[0, -0.1, 0]} receiveShadow castShadow>
          <boxGeometry args={[BUILDING_WIDTH, 0.2, BUILDING_DEPTH]} />
          <meshStandardMaterial
            map={honeyWoodMap ?? undefined}
            color="#D4AA72"
            roughness={0.82}
          />
        </mesh>
        {/* Architectural wooden foundation rim */}
        <mesh position={[0, -0.24, 0]} receiveShadow castShadow>
          <boxGeometry args={[BUILDING_WIDTH + 0.5, 0.14, BUILDING_DEPTH + 0.5]} />
          <meshStandardMaterial color="#8E6743" roughness={0.85} />
        </mesh>

        {/* Two Decorated Outer Walls (-Z and -X only; camera sides open) */}
        <OuterDecoratedWalls />

        {/* Central Cross-Shaped Lobby */}
        <LobbyFurniture />

        {/* Debug A* Walkable Grid overlay on floor (Phím D) */}
        {debugFacing && <DebugWalkableGrid />}

        {/* 4 Rooms in 2x2 Quadrants */}
        {computedRooms.map((room) => {
          const deptId = room.department.id;
          const isHovered = hoveredDepartmentId === deptId;
          const isSelected = selectedDepartmentId === deptId;
          const isWorkflowActive = currentStep?.activeDepartment === deptId;
          const isDimmed =
            hoveredDepartmentId !== null && hoveredDepartmentId !== deptId;

          return (
            <SingleStoryRoom
              key={deptId}
              room={room}
              isHovered={hasEnteredOffice && isHovered}
              isSelected={isSelected}
              isWorkflowActive={isWorkflowActive}
              activeSkills={
                isWorkflowActive ? currentStep?.activeSkills ?? [] : []
              }
              isDimmed={hasEnteredOffice && !isWorkflowRunning && isDimmed}
              hasSelection={selectedDepartmentId !== null}
              showLabels={hasEnteredOffice}
              onHoverChange={(hovered) =>
                setHoveredDepartment(hovered ? deptId : null)
              }
              onSelect={() => {
                if (!isWorkflowRunning) {
                  selectDepartment(deptId);
                }
              }}
            />
          );
        })}

        {/* Flying Work Packet during handoffs */}
        {activePacket && (
          <WorkPacket
            key={activePacket.key}
            from={activePacket.from}
            to={activePacket.to}
            color={activePacket.color}
          />
        )}

        {/* All 10 Chibi Characters on Single Floor (y = 0) */}
        {allMembers.map((member) => {
          const seat = MEMBER_SEATS[member.id];
          const snap = lifeSnapshots[member.id];
          let charState: CharacterState =
            snap?.state ?? seat?.defaultState ?? "working";
          let handoverRole: "giver" | "receiver" | undefined = undefined;
          let talkPartnerId: string | null = snap?.talkPartnerId ?? null;
          let targetPos: Vec3 | undefined = snap?.targetPosition ?? undefined;
          let speechText: string | null = snap?.speechText ?? null;
          const gesture = snap?.gesture ?? "none";

          if (currentStep) {
            // Workflow overrides autonomous Office Life
            speechText = null;
            if (currentStep.isCelebration) {
              charState = "celebrating";
              talkPartnerId = null;
            } else if (
              currentStep.packet &&
              (currentStep.packet.from === member.id ||
                currentStep.packet.to === member.id) &&
              currentStep.walkingActor !== member.id
            ) {
              charState = "handover";
              handoverRole =
                currentStep.packet.from === member.id ? "giver" : "receiver";
              talkPartnerId =
                currentStep.packet.from === member.id
                  ? currentStep.packet.to
                  : currentStep.packet.from;
            } else if (currentStep.actors.includes(member.id)) {
              charState = "working";
              talkPartnerId = null;
            } else {
              // Bystanders watch the active workflow actor!
              charState = "idle";
              talkPartnerId =
                currentStep.walkingActor ?? currentStep.actors[0] ?? null;
            }

            if (
              currentStep.walkingActor === member.id &&
              currentStep.walkDestination
            ) {
              targetPos =
                currentStep.walkDestination === "desk"
                  ? seat?.position
                  : ROOM_VISIT_POINTS[currentStep.walkDestination];
            } else if (seat) {
              targetPos = seat.position;
            }
          }

          const isCharFocused =
            selectedMemberId === member.id || hoveredMemberId === member.id;
          const hoverLabel =
            hoveredMemberId === member.id && !isWorkflowRunning
              ? snap?.activityLabel ?? "đang làm việc"
              : null;

          return (
            <Character
              key={member.id}
              id={member.id}
              state={charState}
              handoverRole={handoverRole}
              talkPartnerId={talkPartnerId}
              gesture={isWorkflowRunning ? "none" : gesture}
              speechText={hasEnteredOffice ? speechText : null}
              hoverLabel={hasEnteredOffice ? hoverLabel : null}
              speedMultiplier={snap?.speedMultiplier ?? 1}
              isYielding={snap?.isYielding ?? false}
              isFocused={isCharFocused}
              showDebugFacing={debugFacing}
              debugPath={snap?.path}
              targetPosition={targetPos}
              initialPosition={seat?.position}
              initialRotationY={seat?.rotationY}
              onHoverChange={(hovered) =>
                setHoveredMember(hovered ? member.id : null)
              }
              onSelect={() =>
                setSelectedMember(
                  selectedMemberId === member.id ? null : member.id
                )
              }
              onArrive={() => {
                if (!isWorkflowRunning) {
                  lifeEngine.notifyArrived(member.id);
                  setLifeSnapshots(lifeEngine.getSnapshots());
                }
              }}
            />
          );
        })}
      </group>

      {/* Camera OrbitControls: ~45° diagonal, max ±35° azimuth, zoom clamped, no back-view */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={INTRO_CAMERA_TARGET}
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        minDistance={12}
        maxDistance={36}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minAzimuthAngle={CAMERA_BASE_AZIMUTH - CAMERA_AZIMUTH_LIMIT}
        maxAzimuthAngle={CAMERA_BASE_AZIMUTH + CAMERA_AZIMUTH_LIMIT}
      />

      <PostProcessingEffects
        enabled={postProcessingEnabled}
        enableSSAO={enableSSAO}
      />
    </>
  );
}
