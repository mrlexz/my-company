"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";
import { METAL_MAT, VINYL_MAT } from "../character/geometryHelpers";
import { HoneyWoodMaterial, LiveMonitor, VinylChair } from "./furnitureCommon";
import { getITRugTexture } from "./furnitureTextures";

/** Tall Server Rack with Randomly Blinking LEDs */
function TallServerRack({
  position,
  seed = 0,
}: {
  position: [number, number, number];
  seed?: number;
}) {
  const ledRefs = useRef<Array<MeshStandardMaterial | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ledRefs.current.forEach((mat, i) => {
      if (!mat) return;
      const blink = Math.sin(t * (3.2 + ((i + seed) % 4) * 1.4) + i * 2.1 + seed);
      mat.emissiveIntensity = blink > 0.15 ? 1.4 : 0.18;
    });
  });

  return (
    <group position={position}>
      <RoundedBox
        args={[0.66, 2.25, 0.72]}
        radius={0.04}
        smoothness={3}
        position={[0, 1.125, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#272A36" {...METAL_MAT} />
      </RoundedBox>
      {[0.45, 0.8, 1.15, 1.5, 1.85].map((y, idx) => (
        <group key={idx}>
          <RoundedBox
            args={[0.54, 0.16, 0.03]}
            radius={0.012}
            smoothness={2}
            position={[0, y, 0.36]}
          >
            <meshStandardMaterial color="#181B24" {...VINYL_MAT} />
          </RoundedBox>
          <mesh position={[-0.18, y, 0.382]}>
            <sphereGeometry args={[0.026, 8, 8]} />
            <meshStandardMaterial
              ref={(el) => {
                ledRefs.current[idx] = el;
              }}
              color={idx % 2 === 0 ? "#34D399" : "#38BDF8"}
              emissive={idx % 2 === 0 ? "#34D399" : "#38BDF8"}
              emissiveIntensity={1.1}
            />
          </mesh>
          <mesh position={[-0.1, y, 0.382]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial
              color="#A78BFA"
              emissive="#A78BFA"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Cute Decorative Mini Robot that gently bobs */
function BobbingMiniRobot({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 3.2)) * 0.06;
    ref.current.rotation.z = Math.sin(t * 2.2) * 0.08;
  });

  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[0.24, 0.24, 0.2]} radius={0.04} smoothness={2} position={[0, 0.16, 0]} castShadow>
        <meshStandardMaterial color="#9477B5" {...METAL_MAT} />
      </RoundedBox>
      <RoundedBox args={[0.26, 0.2, 0.22]} radius={0.045} smoothness={2} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color="#E2E8F0" {...METAL_MAT} />
      </RoundedBox>
      {/* Glowing eyes */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0.115]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#38BDF8"
            emissive="#38BDF8"
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.56, 0]}>
        <sphereGeometry args={[0.032, 8, 8]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#34D399"
          emissiveIntensity={1.1}
        />
      </mesh>
    </group>
  );
}

/** Phòng IT: tủ server LED nhấp nháy, 4 màn hình cong, ghế gaming tím, khay cáp phát sáng xanh, bảng sơ đồ mạng, bàn thợ hộp đồ nghề, robot nhỏ nhún, góc cà phê, thảm mạch điện */
export function ITRoomFurniture({ accentColor }: { accentColor: string }) {
  const rugTex = getITRugTexture(accentColor);

  return (
    <group>
      {/* Circuit-board patterned purple rug */}
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

      {/* Tall Server Racks with Blinking LEDs */}
      <TallServerRack position={[-1.45, 0, -1.72]} seed={0} />
      <TallServerRack position={[-0.7, 0, -1.72]} seed={2} />

      {/* Network Topology Diagram Board on Back Wall */}
      <LiveMonitor
        position={[0.68, 1.85, -2.14]}
        width={1.45}
        height={0.86}
        mode="network"
        withStand={false}
      />

      {/* Technician Workbench + Toolbox + Bobbing Mini Robot (back-right) */}
      <group position={[0.72, 0, -1.55]}>
        <RoundedBox
          args={[1.45, 0.1, 0.68]}
          radius={0.03}
          smoothness={2}
          position={[0, 0.7, 0]}
          castShadow
        >
          <HoneyWoodMaterial />
        </RoundedBox>
        {[
          [-0.64, 0.34, -0.26],
          [0.64, 0.34, -0.26],
          [-0.64, 0.34, 0.26],
          [0.64, 0.34, 0.26],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} castShadow>
            <capsuleGeometry args={[0.035, 0.6, 6, 8]} />
            <meshStandardMaterial color="#3B3F4C" {...METAL_MAT} />
          </mesh>
        ))}
        {/* Red Toolbox */}
        <RoundedBox
          args={[0.42, 0.22, 0.24]}
          radius={0.03}
          smoothness={2}
          position={[-0.32, 0.86, 0]}
          castShadow
        >
          <meshStandardMaterial color="#C84B3E" {...METAL_MAT} />
        </RoundedBox>
        {/* Bobbing Mini Robot */}
        <BobbingMiniRobot position={[0.35, 0.76, 0]} />
      </group>

      {/* Coffee Corner (góc cà phê) */}
      <group position={[1.76, 0, -1.52]}>
        <RoundedBox
          args={[0.52, 0.74, 0.52]}
          radius={0.035}
          smoothness={2}
          position={[0, 0.37, 0]}
          castShadow
        >
          <HoneyWoodMaterial tint="#A87843" />
        </RoundedBox>
        {/* Espresso machine */}
        <RoundedBox
          args={[0.28, 0.3, 0.24]}
          radius={0.03}
          smoothness={2}
          position={[0, 0.89, -0.05]}
          castShadow
        >
          <meshStandardMaterial color="#343844" {...METAL_MAT} />
        </RoundedBox>
        {/* Coffee mug */}
        <mesh position={[0.08, 0.8, 0.14]} castShadow>
          <cylinderGeometry args={[0.048, 0.042, 0.09, 10]} />
          <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
        </mesh>
      </group>

      {/* 4 Staggered Outward-Facing Tech Desks (characters sit behind desks facing SE 3/4 toward camera/lobby) */}
      {(
        [
          { desk: [-1.05, -0.15], chair: [-1.55, -0.85], rot: 0.65, mode: "code" as const, color: accentColor },
          { desk: [0.35, -0.15], chair: [-0.15, -0.85], rot: 0.58, mode: "network" as const, color: "#533B6E" },
          { desk: [-1.05, 1.45], chair: [-1.55, 0.75], rot: 0.72, mode: "analyticsBlue" as const, color: "#7E60A1" },
          { desk: [0.35, 1.45], chair: [-0.15, 0.75], rot: 0.62, mode: "code" as const, color: "#5B427A" },
        ]
      ).map((ws, idx) => (
        <group key={idx}>
          <group position={[ws.desk[0], 0, ws.desk[1]]} rotation={[0, ws.rot, 0]}>
            <RoundedBox
              args={[1.15, 0.1, 0.66]}
              radius={0.035}
              smoothness={3}
              position={[0, 0.72, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#3B3F4C" {...VINYL_MAT} />
            </RoundedBox>
            {[
              [-0.48, 0.35, -0.24],
              [0.48, 0.35, -0.24],
              [-0.48, 0.35, 0.24],
              [0.48, 0.35, 0.24],
            ].map((pos, i) => (
              <mesh key={i} position={pos as [number, number, number]} castShadow>
                <capsuleGeometry args={[0.032, 0.62, 6, 8]} />
                <meshStandardMaterial color="#23262F" {...METAL_MAT} />
              </mesh>
            ))}
            {/* Side-corner curved monitor angled ~30° toward viewer */}
            <LiveMonitor
              position={[0.38, 1.03, 0.12]}
              rotation={[0, -0.45, 0]}
              width={0.54}
              height={0.36}
              mode={ws.mode}
            />
          </group>

          {/* Purple Gaming Chair facing OUT same yaw as character */}
          <VinylChair
            position={[ws.chair[0], 0, ws.chair[1]]}
            rotationY={ws.rot}
            color={ws.color}
            gaming
          />
        </group>
      ))}

      {/* Floor Cable Tray with Glowing Blue Fiber Cables */}
      <group>
        <RoundedBox
          args={[0.38, 0.05, 1.38]}
          radius={0.015}
          smoothness={2}
          position={[-0.95, 0.04, -0.72]}
        >
          <meshStandardMaterial color="#272A36" {...METAL_MAT} />
        </RoundedBox>
        {[-1.04, -0.95, -0.86].map((x, i) => (
          <mesh key={i} position={[x, 0.072, -0.72]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.018, 1.28, 4, 8]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#38BDF8"
              emissiveIntensity={0.95}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
