"use client";

import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import type { CapeType, OutfitTopType } from "@/types/office";
import {
  getCapeGeometry,
  getCoatTorsoGeometry,
  getRobeTorsoGeometry,
  METAL_MAT,
  OUTLINE_COLOR,
  OUTLINE_SCALE,
  VINYL_MAT,
} from "../geometryHelpers";

/**
 * Outfit top library — mounted on the `chest` socket.
 * Types: suit, knightCoat, robe, hoodie, engineerJacket, scholarRobe, astronautTunic, pixelArmor
 */
export function renderOutfitTop(
  top: OutfitTopType,
  topColor: string,
  trimColor: string,
  beltColor: string
) {
  const coatGeom = getCoatTorsoGeometry();
  const robeGeom = getRobeTorsoGeometry();

  const renderBelt = (y = -0.14) => (
    <group position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.228, 0.034, 8, 22]} />
        <meshStandardMaterial color={beltColor} {...VINYL_MAT} />
      </mesh>
      <RoundedBox
        args={[0.095, 0.072, 0.036]}
        radius={0.014}
        smoothness={3}
        position={[0, 0, 0.238]}
        castShadow
      >
        <meshStandardMaterial color={trimColor} {...METAL_MAT} />
      </RoundedBox>
    </group>
  );

  const renderCollar = () => (
    <mesh position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.165, 0.044, 10, 22]} />
      <meshStandardMaterial color={trimColor} {...VINYL_MAT} />
    </mesh>
  );

  switch (top) {
    case "suit":
      return (
        <group>
          <mesh geometry={coatGeom} castShadow receiveShadow>
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={coatGeom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Crisp inner shirt V-front */}
          <RoundedBox
            args={[0.13, 0.24, 0.05]}
            radius={0.02}
            smoothness={3}
            position={[0, 0.07, 0.195]}
          >
            <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
          </RoundedBox>
          {/* Tailored lapels */}
          {[-0.085, 0.085].map((x, idx) => (
            <RoundedBox
              key={idx}
              args={[0.055, 0.24, 0.045]}
              radius={0.015}
              smoothness={3}
              position={[x, 0.06, 0.205]}
              rotation={[0, idx === 0 ? 0.24 : -0.24, idx === 0 ? 0.14 : -0.14]}
              castShadow
            >
              <meshStandardMaterial color={trimColor} {...VINYL_MAT} />
            </RoundedBox>
          ))}
          {/* Suit buttons */}
          {[0.0, -0.07].map((y, i) => (
            <mesh key={i} position={[0, y, 0.228]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color={trimColor} {...METAL_MAT} />
            </mesh>
          ))}
          {renderCollar()}
          {renderBelt(-0.15)}
        </group>
      );

    case "knightCoat":
      return (
        <group>
          <mesh geometry={coatGeom} castShadow receiveShadow>
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={coatGeom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Metallic chest plate & pauldrons */}
          <RoundedBox
            args={[0.28, 0.2, 0.08]}
            radius={0.03}
            smoothness={3}
            position={[0, 0.06, 0.18]}
            castShadow
          >
            <meshStandardMaterial color={trimColor} {...METAL_MAT} />
          </RoundedBox>
          {[-0.22, 0.22].map((x, idx) => (
            <mesh key={idx} position={[x, 0.15, 0]} scale={[1.1, 0.75, 1.1]} castShadow>
              <sphereGeometry args={[0.095, 12, 10]} />
              <meshStandardMaterial color={trimColor} {...METAL_MAT} />
            </mesh>
          ))}
          {renderCollar()}
          {renderBelt(-0.14)}
        </group>
      );

    case "robe":
    case "scholarRobe":
      return (
        <group>
          <mesh geometry={robeGeom} castShadow receiveShadow>
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={robeGeom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Vertical center trim */}
          <RoundedBox
            args={[0.075, 0.44, 0.05]}
            radius={0.018}
            smoothness={3}
            position={[0, -0.01, 0.22]}
            castShadow
          >
            <meshStandardMaterial color={trimColor} {...VINYL_MAT} />
          </RoundedBox>
          {renderCollar()}
          {renderBelt(-0.12)}
        </group>
      );

    case "hoodie":
      return (
        <group>
          <mesh geometry={coatGeom} castShadow receiveShadow>
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={coatGeom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Front kangaroo pocket */}
          <RoundedBox
            args={[0.24, 0.13, 0.06]}
            radius={0.025}
            smoothness={3}
            position={[0, -0.09, 0.205]}
            castShadow
          >
            <meshStandardMaterial color={trimColor} {...VINYL_MAT} />
          </RoundedBox>
          {/* Drawstrings */}
          {[-0.055, 0.055].map((x, idx) => (
            <mesh key={idx} position={[x, 0.09, 0.22]}>
              <capsuleGeometry args={[0.012, 0.14, 4, 8]} />
              <meshStandardMaterial color="#FAF6EC" {...VINYL_MAT} />
            </mesh>
          ))}
          {renderCollar()}
        </group>
      );

    case "engineerJacket":
      return (
        <group>
          <mesh geometry={coatGeom} castShadow receiveShadow>
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={coatGeom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Utility pockets */}
          {[-0.1, 0.1].map((x, i) => (
            <RoundedBox
              key={i}
              args={[0.09, 0.1, 0.05]}
              radius={0.02}
              smoothness={3}
              position={[x, -0.04, 0.215]}
              castShadow
            >
              <meshStandardMaterial color={trimColor} {...VINYL_MAT} />
            </RoundedBox>
          ))}
          {renderCollar()}
          {renderBelt(-0.14)}
        </group>
      );

    case "astronautTunic":
      return (
        <group>
          <mesh geometry={coatGeom} castShadow receiveShadow>
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </mesh>
          <mesh geometry={coatGeom} scale={OUTLINE_SCALE}>
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </mesh>
          {/* Chest control panel */}
          <RoundedBox
            args={[0.17, 0.12, 0.06]}
            radius={0.025}
            smoothness={3}
            position={[0, 0.05, 0.21]}
            castShadow
          >
            <meshStandardMaterial color={trimColor} {...VINYL_MAT} />
          </RoundedBox>
          {renderCollar()}
          {renderBelt(-0.14)}
        </group>
      );

    case "pixelArmor":
      return (
        <group>
          <RoundedBox
            args={[0.44, 0.44, 0.34]}
            radius={0.055}
            smoothness={3}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={topColor} {...VINYL_MAT} />
          </RoundedBox>
          <RoundedBox
            args={[0.44 * OUTLINE_SCALE, 0.44 * OUTLINE_SCALE, 0.34 * OUTLINE_SCALE]}
            radius={0.055}
            smoothness={3}
          >
            <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
          </RoundedBox>
          <RoundedBox
            args={[0.28, 0.22, 0.06]}
            radius={0.025}
            smoothness={3}
            position={[0, 0.04, 0.17]}
            castShadow
          >
            <meshStandardMaterial color={trimColor} {...METAL_MAT} />
          </RoundedBox>
          {renderCollar()}
          {renderBelt(-0.15)}
        </group>
      );
  }
}

/**
 * Cape library — mounted on the `backCenter` socket using ExtrudeGeometry.
 */
export function renderCape(type: CapeType, color: string, trimColor: string) {
  if (type === "none") return null;
  const geom = getCapeGeometry(type);

  return (
    <group>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial color={color} {...VINYL_MAT} />
      </mesh>
      <mesh geometry={geom} scale={OUTLINE_SCALE}>
        <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
      </mesh>
      {/* Shoulder clasp */}
      <mesh position={[0, -0.01, 0.02]}>
        <capsuleGeometry args={[0.028, 0.24, 6, 10]} />
        <meshStandardMaterial color={trimColor} {...METAL_MAT} />
      </mesh>
    </group>
  );
}
