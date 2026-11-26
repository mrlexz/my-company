"use client";

import {
  Bushes,
  FloatingCloud,
  GroundDisc,
  LampPost,
  PathStones,
  PineTrees,
  RoundTrees,
  WoodenSignboard,
  type CloudConfig,
  type TreeSpot,
} from "./shared";

/**
 * Đảo xanh — ngoại cảnh gốc của Dashboard (giữ nguyên 100% vị trí, màu,
 * hình học như trước khi tách file). Đảo nổi cỏ xanh + mây trắng trôi.
 */

const PINE_TREES: TreeSpot[] = [
  { pos: [-9.8, -0.15, -4.6], scale: 1.15 },
  { pos: [-9.2, -0.15, 5.4], scale: 0.94 },
  { pos: [4.2, -0.15, -8.4], scale: 1.12 },
  { pos: [10.2, -0.15, 1.8], scale: 0.9 },
  { pos: [-5.8, -0.15, -8.5], scale: 1.02 },
];

const ROUND_TREES: TreeSpot[] = [
  { pos: [-10.4, -0.15, 0.8], scale: 0.98 },
  { pos: [-2.2, -0.15, -9.4], scale: 1.16 },
  { pos: [10.4, -0.15, -5.2], scale: 1.02 },
  { pos: [10.8, -0.15, 5.8], scale: 0.9 },
];

const BUSHES: TreeSpot[] = [
  { pos: [-10.2, -0.02, 5.4], scale: 1.0 },
  { pos: [-6.8, -0.05, 8.8], scale: 0.76 },
  { pos: [10.2, -0.03, 5.4], scale: 0.92 },
  { pos: [6.8, -0.06, 8.9], scale: 0.7 },
  { pos: [-10.6, -0.04, 2.8], scale: 0.84 },
  { pos: [10.8, -0.04, -1.6], scale: 0.8 },
  { pos: [-1.4, -0.05, -9.8], scale: 0.85 },
  { pos: [6.2, -0.04, -9.4], scale: 0.88 },
];

const PATH_STONES: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
  rotY: number;
}> = [
  { pos: [0.0, -0.12, 8.75], scale: [1.55, 0.1, 0.82], rotY: 0.03 },
  { pos: [0.18, -0.12, 9.85], scale: [1.4, 0.1, 0.76], rotY: -0.06 },
  { pos: [0.45, -0.12, 10.95], scale: [1.3, 0.1, 0.74], rotY: 0.08 },
  { pos: [0.8, -0.12, 12.0], scale: [1.2, 0.1, 0.7], rotY: -0.04 },
  { pos: [1.15, -0.12, 13.0], scale: [1.1, 0.1, 0.66], rotY: 0.05 },
  { pos: [1.45, -0.12, 13.9], scale: [1.0, 0.1, 0.62], rotY: -0.07 },
];

const SIDE_BOULDERS: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
}> = [
  { pos: [-9.8, -1.55, 5.2], scale: [1.2, 0.9, 0.95], rot: [0.2, 0.5, 0.1] },
  { pos: [10.2, -1.7, 6.1], scale: [1.3, 0.95, 1.0], rot: [-0.2, 1.1, 0.3] },
  { pos: [-1.8, -2.0, 10.2], scale: [1.4, 0.95, 0.9], rot: [0.3, 0.2, -0.2] },
  { pos: [10.8, -1.45, -1.4], scale: [1.1, 0.85, 1.1], rot: [0.1, -0.6, 0.2] },
  { pos: [-10.8, -1.65, -2.8], scale: [1.2, 0.85, 0.95], rot: [-0.1, 0.8, -0.1] },
];

const CLOUDS: CloudConfig[] = [
  { position: [-14.5, 2.0, -8.5], scale: 1.45, speed: 0.24, phase: 0.2 },
  { position: [-13.5, -2.2, 6.0], scale: 1.15, speed: 0.28, phase: 1.4 },
  { position: [15.0, 3.0, -7.5], scale: 1.35, speed: 0.22, phase: 2.3 },
  { position: [14.2, -2.6, 7.2], scale: 1.1, speed: 0.26, phase: 3.1 },
  { position: [-2.0, -3.6, 13.5], scale: 1.25, speed: 0.24, phase: 4.0 },
  { position: [4.5, 4.8, -14.0], scale: 1.5, speed: 0.2, phase: 5.1 },
  { position: [-8.5, 5.4, -12.5], scale: 1.18, speed: 0.27, phase: 0.9 },
  { position: [8.8, -4.0, -2.5], scale: 1.2, speed: 0.25, phase: 2.8 },
];

export function IslandEnvironment() {
  return (
    <group>
      {/* Floating Circular Island: Grass Top, Layered Soil & Side Rocks */}
      <GroundDisc />

      {/* Faceted Side Boulders embedded along the cliff rim */}
      {SIDE_BOULDERS.map((b, i) => (
        <mesh
          key={i}
          position={b.pos}
          scale={b.scale}
          rotation={b.rot}
          receiveShadow
        >
          <dodecahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial color="#8E867B" flatShading roughness={0.94} />
        </mesh>
      ))}

      {/* Instanced Trees, Bushes & Stepping Stones */}
      <PineTrees trees={PINE_TREES} />
      <RoundTrees trees={ROUND_TREES} />
      <Bushes bushes={BUSHES} />
      <PathStones stones={PATH_STONES} />

      {/* Lamp Posts flanking the pathway */}
      <LampPost position={[-1.55, -0.14, 7.2]} />
      <LampPost position={[2.2, -0.14, 8.8]} />

      {/* Wooden Welcome Signboard */}
      <WoodenSignboard position={[-3.2, -0.14, 7.6]} />

      {/* Slowly Drifting Puffy Clouds */}
      {CLOUDS.map((cloud, idx) => (
        <FloatingCloud key={idx} {...cloud} />
      ))}
    </group>
  );
}
