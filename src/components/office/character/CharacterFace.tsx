"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type {
  BrowStyle,
  CharacterBlueprint,
  EmotionType,
  MouthStyle,
} from "@/types/office";
import { VINYL_MAT } from "./geometryHelpers";

export interface CharacterFaceProps {
  face: CharacterBlueprint["face"];
  skinColor: string;
  hairColor: string;
  isPixel: boolean;
  emotion: EmotionType;
  isWalking: boolean;
  headRef: React.RefObject<Group | null>;
}

/** Cached procedural radial gradient alphaMap for soft airbrushed vinyl cheek blush */
let cachedBlushAlphaMap: THREE.CanvasTexture | null = null;
function getBlushAlphaMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (cachedBlushAlphaMap) return cachedBlushAlphaMap;

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    2,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.65)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  cachedBlushAlphaMap = new THREE.CanvasTexture(canvas);
  cachedBlushAlphaMap.needsUpdate = true;
  return cachedBlushAlphaMap;
}

/** Cached TubeGeometries for eyebrows and mouths */
const faceGeomCache = new Map<string, THREE.BufferGeometry>();
function cachedFaceGeom(key: string, factory: () => THREE.BufferGeometry) {
  let g = faceGeomCache.get(key);
  if (!g) {
    g = factory();
    faceGeomCache.set(key, g);
  }
  return g;
}

function getBrowGeometry(style: Exclude<BrowStyle, "none">): THREE.BufferGeometry {
  return cachedFaceGeom(`brow-${style}`, () => {
    const radius = style === "thick" ? 0.013 : style === "thin" ? 0.0065 : 0.0095;
    const archY = style === "arched" ? 0.022 : 0.011;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.044, 0, 0),
      new THREE.Vector3(0, archY, 0.006),
      new THREE.Vector3(0.044, -0.004, 0),
    ]);
    return new THREE.TubeGeometry(curve, 14, radius, 8, false);
  });
}

function getMouthTubeGeometry(
  style: Exclude<MouthStyle, "open">
): THREE.BufferGeometry {
  return cachedFaceGeom(`mouth-${style}`, () => {
    let pts: THREE.Vector3[];
    let radius = 0.0078;

    if (style === "smile") {
      pts = [
        new THREE.Vector3(-0.042, 0.014, 0),
        new THREE.Vector3(-0.018, -0.006, 0.005),
        new THREE.Vector3(0.018, -0.006, 0.005),
        new THREE.Vector3(0.042, 0.014, 0),
      ];
    } else if (style === "smirk") {
      pts = [
        new THREE.Vector3(-0.036, -0.002, 0),
        new THREE.Vector3(0.0, -0.006, 0.005),
        new THREE.Vector3(0.042, 0.016, 0.002),
      ];
    } else if (style === "focus") {
      radius = 0.0072;
      pts = [
        new THREE.Vector3(-0.022, -0.002, 0),
        new THREE.Vector3(0, 0.006, 0.005),
        new THREE.Vector3(0.022, -0.002, 0),
      ];
    } else {
      // neutral
      pts = [
        new THREE.Vector3(-0.03, 0.002, 0),
        new THREE.Vector3(0, -0.002, 0.004),
        new THREE.Vector3(0.03, 0.002, 0),
      ];
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 16, radius, 8, false);
  });
}

const EMOTION_TARGETS: Record<
  EmotionType,
  {
    browY: number;
    browTilt: number; // positive = raised/relaxed, negative = furrowed inward
    eyelidRest: number; // 0 = wide open, 1 = fully closed
    eyeScale: number;
    mouthOverride: MouthStyle | null;
    openScale: number;
  }
> = {
  idle: {
    browY: 0.095,
    browTilt: 0.06,
    eyelidRest: 0.08,
    eyeScale: 1.0,
    mouthOverride: null,
    openScale: 1.0,
  },
  happy: {
    browY: 0.112,
    browTilt: 0.14,
    eyelidRest: 0.05,
    eyeScale: 1.04,
    mouthOverride: "smile",
    openScale: 1.0,
  },
  focused: {
    browY: 0.08,
    browTilt: -0.24,
    eyelidRest: 0.25,
    eyeScale: 0.96,
    mouthOverride: "focus",
    openScale: 1.0,
  },
  surprised: {
    browY: 0.128,
    browTilt: 0.18,
    eyelidRest: 0.0,
    eyeScale: 1.14,
    mouthOverride: "open",
    openScale: 0.72,
  },
  celebrating: {
    browY: 0.124,
    browTilt: 0.16,
    eyelidRest: 0.0,
    eyeScale: 1.08,
    mouthOverride: "open",
    openScale: 1.08,
  },
};

export function CharacterFace({
  face,
  skinColor,
  hairColor,
  isPixel,
  emotion,
  isWalking,
  headRef,
}: CharacterFaceProps) {
  const faceZ = isPixel ? 0.256 : 0.292;
  const blushAlphaMap = useMemo(() => getBlushAlphaMap(), []);

  const leftBrowRef = useRef<Mesh>(null);
  const rightBrowRef = useRef<Mesh>(null);
  const leftEyelidRef = useRef<Mesh>(null);
  const rightEyelidRef = useRef<Mesh>(null);
  const leftEyeBallRef = useRef<Group>(null);
  const rightEyeBallRef = useRef<Group>(null);
  const mouthGroupRef = useRef<Group>(null);

  // Smooth emotion interpolation values (0.2s lerp)
  const animState = useRef({
    browY: 0.095,
    browTilt: 0.06,
    eyelidRest: 0.08,
    eyeScale: 1.0,
    gazeX: 0,
    gazeY: 0,
    mouthPop: 1.0,
  });

  // Fast 120ms blink timer every 3–6 seconds
  const nextBlinkRef = useRef(2.2 + Math.random() * 3.2);
  const blinkElapsedRef = useRef(-1);
  const BLINK_DURATION = 0.12;

  const tempCamLocal = useMemo(() => new THREE.Vector3(), []);

  const activeMouthStyle: MouthStyle =
    EMOTION_TARGETS[emotion].mouthOverride ?? face.mouthStyle;

  useFrame(({ clock, camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const target = EMOTION_TARGETS[emotion];
    const baseEyelid =
      face.eyeStyle === "sleepy"
        ? Math.max(target.eyelidRest, 0.44)
        : target.eyelidRest;

    // 0.2s smooth exponential lerp for emotion transitions
    const emotionAlpha = 1 - Math.exp(-dt / 0.065);
    const st = animState.current;
    st.browY = THREE.MathUtils.lerp(st.browY, target.browY, emotionAlpha);
    st.browTilt = THREE.MathUtils.lerp(st.browTilt, target.browTilt, emotionAlpha);
    st.eyelidRest = THREE.MathUtils.lerp(st.eyelidRest, baseEyelid, emotionAlpha);
    st.eyeScale = THREE.MathUtils.lerp(st.eyeScale, target.eyeScale, emotionAlpha);

    // Random fast 120ms blink every 3 to 6 seconds
    let blinkClose = 0;
    if (blinkElapsedRef.current < 0 && t >= nextBlinkRef.current) {
      blinkElapsedRef.current = 0;
    }
    if (blinkElapsedRef.current >= 0) {
      blinkElapsedRef.current += dt;
      const p = blinkElapsedRef.current / BLINK_DURATION;
      if (p >= 1) {
        blinkElapsedRef.current = -1;
        nextBlinkRef.current = t + 3 + Math.random() * 3;
      } else {
        blinkClose = Math.sin(p * Math.PI);
      }
    }

    // Apply eyelid upper cover mesh rotation/scale
    const lidAmount = Math.min(1, Math.max(st.eyelidRest, blinkClose));
    const lidRotX = THREE.MathUtils.lerp(-Math.PI * 0.56, 0.12, lidAmount);
    if (leftEyelidRef.current && rightEyelidRef.current) {
      leftEyelidRef.current.rotation.x = lidRotX;
      rightEyelidRef.current.rotation.x = lidRotX;
    }

    // Apply eyebrows
    if (leftBrowRef.current && rightBrowRef.current) {
      leftBrowRef.current.position.y = st.browY;
      rightBrowRef.current.position.y = st.browY;
      leftBrowRef.current.rotation.z = st.browTilt;
      rightBrowRef.current.rotation.z = -st.browTilt;
    }

    // Slow smooth eye gaze toward camera (or forward/down when walking or focused)
    let desiredGazeX = 0;
    let desiredGazeY = 0;

    if (emotion === "focused") {
      desiredGazeX = 0;
      desiredGazeY = -0.014;
    } else if (isWalking) {
      desiredGazeX = 0;
      desiredGazeY = 0.002;
    } else if (headRef.current) {
      tempCamLocal.copy(camera.position);
      headRef.current.worldToLocal(tempCamLocal);
      if (tempCamLocal.z > 0.1) {
        desiredGazeX = THREE.MathUtils.clamp(tempCamLocal.x * 0.008, -0.015, 0.015);
        desiredGazeY = THREE.MathUtils.clamp(tempCamLocal.y * 0.006, -0.011, 0.011);
      }
    }

    const gazeAlpha = 1 - Math.exp(-dt * 3.2);
    st.gazeX = THREE.MathUtils.lerp(st.gazeX, desiredGazeX, gazeAlpha);
    st.gazeY = THREE.MathUtils.lerp(st.gazeY, desiredGazeY, gazeAlpha);

    if (leftEyeBallRef.current && rightEyeBallRef.current) {
      leftEyeBallRef.current.position.set(st.gazeX, st.gazeY, 0);
      rightEyeBallRef.current.position.set(st.gazeX, st.gazeY, 0);
      leftEyeBallRef.current.scale.setScalar(st.eyeScale);
      rightEyeBallRef.current.scale.setScalar(st.eyeScale);
    }

    if (mouthGroupRef.current) {
      const targetScale =
        activeMouthStyle === "open" ? target.openScale : 1.0;
      st.mouthPop = THREE.MathUtils.lerp(st.mouthPop, targetScale, emotionAlpha);
      mouthGroupRef.current.scale.setScalar(st.mouthPop);
    }
  });

  const eyeBaseScale: [number, number, number] =
    face.eyeStyle === "sharp"
      ? [1.14, 0.96, 0.45]
      : face.eyeStyle === "sparkle"
        ? [1.08, 1.24, 0.45]
        : [1.02, 1.15, 0.45];

  const eyeSlantZ = face.eyeStyle === "sharp" ? 0.16 : 0;

  return (
    <group>
      {/* Front Face Features */}
      <group position={[0, 0, faceZ]}>
        {/* Eyes + Eyelid Cover Meshes */}
        {[-0.105, 0.105].map((x, idx) => {
          const isLeft = idx === 0;
          return (
            <group
              key={idx}
              position={[x, 0.015, 0]}
              rotation={[0, 0, isLeft ? -eyeSlantZ : eyeSlantZ]}
            >
              {/* Gaze-tracked eyeball + 2 sparkle highlights */}
              <group ref={isLeft ? leftEyeBallRef : rightEyeBallRef}>
                <mesh scale={eyeBaseScale}>
                  <sphereGeometry args={[0.044, 18, 16]} />
                  <meshPhysicalMaterial
                    color={face.eyeColor}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                    roughness={0.1}
                    metalness={0.05}
                  />
                </mesh>
                {/* Large upper-right specular highlight dot */}
                <mesh position={[0.017, 0.02, 0.022]}>
                  <sphereGeometry args={[0.014, 8, 8]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
                {/* Small lower-left specular highlight dot */}
                <mesh position={[-0.015, -0.015, 0.022]}>
                  <sphereGeometry args={[0.0075, 8, 8]} />
                  <meshBasicMaterial color="#FFFFFF" />
                </mesh>
                {/* Extra 3rd twinkle dot for "sparkle" eyeStyle */}
                {face.eyeStyle === "sparkle" && (
                  <mesh position={[-0.018, 0.016, 0.022]}>
                    <sphereGeometry args={[0.006, 8, 8]} />
                    <meshBasicMaterial color="#FFFDF5" />
                  </mesh>
                )}
              </group>

              {/* Upper Eyelid Cover Mesh (rotates down to blink smoothly in 120ms) */}
              <mesh
                ref={isLeft ? leftEyelidRef : rightEyelidRef}
                position={[0, 0.004, 0.004]}
                scale={[1.18, 1.24, 0.65]}
              >
                <sphereGeometry
                  args={[0.046, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]}
                />
                <meshStandardMaterial color={skinColor} {...VINYL_MAT} />
              </mesh>
            </group>
          );
        })}

        {/* Curved TubeGeometry Eyebrows */}
        {face.browStyle !== "none" && (
          <>
            <mesh
              ref={leftBrowRef}
              geometry={getBrowGeometry(face.browStyle)}
              position={[-0.105, 0.095, 0.006]}
            >
              <meshStandardMaterial color={hairColor} {...VINYL_MAT} />
            </mesh>
            <mesh
              ref={rightBrowRef}
              geometry={getBrowGeometry(face.browStyle)}
              position={[0.105, 0.095, 0.006]}
            >
              <meshStandardMaterial color={hairColor} {...VINYL_MAT} />
            </mesh>
          </>
        )}

        {/* Optional Tiny Vinyl Nose */}
        {face.nose && (
          <mesh position={[0, -0.025, 0.014]} scale={[1.1, 0.85, 0.85]}>
            <sphereGeometry args={[0.015, 10, 10]} />
            <meshStandardMaterial color={skinColor} {...VINYL_MAT} />
          </mesh>
        )}

        {/* Airbrushed Radial-Gradient Cheek Blush */}
        {face.blush &&
          [-0.155, 0.155].map((x, idx) => (
            <mesh key={idx} position={[x, -0.042, -0.004]}>
              <circleGeometry args={[0.056, 18]} />
              <meshBasicMaterial
                color="#F28FA3"
                alphaMap={blushAlphaMap ?? undefined}
                transparent
                opacity={0.58}
                depthWrite={false}
              />
            </mesh>
          ))}

        {/* Extras on face: Freckles, Beauty Mark, Short Beard */}
        {face.extras.includes("freckles") &&
          [-0.145, 0.145].map((cx, side) => (
            <group key={side} position={[cx, -0.038, 0.002]}>
              {[
                [-0.016, 0.006],
                [0, -0.005],
                [0.016, 0.004],
              ].map(([fx, fy], i) => (
                <mesh key={i} position={[fx, fy, 0]}>
                  <sphereGeometry args={[0.0045, 6, 6]} />
                  <meshBasicMaterial color="#9E6B4B" />
                </mesh>
              ))}
            </group>
          ))}

        {face.extras.includes("beautyMark") && (
          <mesh position={[0.115, -0.062, 0.004]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshBasicMaterial color="#4A352A" />
          </mesh>
        )}

        {face.extras.includes("shortBeard") && (
          <group position={[0, -0.14, -0.045]}>
            <mesh scale={[1.3, 0.72, 0.85]}>
              <sphereGeometry
                args={[0.11, 14, 10, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]}
              />
              <meshStandardMaterial color={hairColor} {...VINYL_MAT} />
            </mesh>
          </group>
        )}

        {/* Mouth (TubeGeometry or Open Celebratory Mouth with Pink Tongue) */}
        <group ref={mouthGroupRef} position={[0, -0.074, 0.008]}>
          {activeMouthStyle === "open" ? (
            <group>
              <mesh scale={[1.15, 0.95, 0.48]}>
                <sphereGeometry args={[0.042, 14, 12]} />
                <meshStandardMaterial color="#7C2D36" roughness={0.6} />
              </mesh>
              {/* Small pink tongue */}
              <mesh position={[0, -0.016, 0.014]} scale={[0.92, 0.55, 0.42]}>
                <sphereGeometry args={[0.027, 10, 8]} />
                <meshStandardMaterial color="#F28482" roughness={0.65} />
              </mesh>
            </group>
          ) : (
            <mesh geometry={getMouthTubeGeometry(activeMouthStyle)}>
              <meshStandardMaterial color="#5A3A2E" {...VINYL_MAT} />
            </mesh>
          )}
        </group>
      </group>

      {/* Head-Mounted Extras: Pointed Ears & Glowing Antennae */}
      {face.extras.includes("pointedEars") &&
        [-0.31, 0.31].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, -0.01, -0.01]}
            rotation={[0, 0, idx === 0 ? 1.25 : -1.25]}
            castShadow
          >
            <coneGeometry args={[0.055, 0.16, 10]} />
            <meshStandardMaterial color={skinColor} {...VINYL_MAT} />
          </mesh>
        ))}

      {face.extras.includes("glowAntennae") &&
        [-0.13, 0.13].map((x, idx) => (
          <group
            key={idx}
            position={[x, 0.26, 0]}
            rotation={[0, 0, idx === 0 ? 0.25 : -0.25]}
          >
            <mesh position={[0, 0.09, 0]}>
              <capsuleGeometry args={[0.016, 0.14, 4, 8]} />
              <meshStandardMaterial color={skinColor} {...VINYL_MAT} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial
                color="#D9FF7A"
                emissive="#B8F25A"
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        ))}
    </group>
  );
}
