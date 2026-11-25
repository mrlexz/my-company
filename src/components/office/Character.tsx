"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import { useOfficeData } from "@/hooks/useOfficeData";
import { getStatusTone } from "@/lib/statusTone";
import { getMemberRank } from "@/lib/memberRank";
import {
  characterRegistry,
  faceTo,
  faceToYaw,
  FACING_OFFSET,
} from "@/lib/facingUtils";
import {
  computeCharacterPath,
  getCharacterWalkSpeed,
  MEMBER_SEATS,
  type Vec3,
} from "@/lib/officePathfinding";
import type {
  CharacterAccessorySpec,
  CharacterBlueprint,
  CharacterState,
  EmotionType,
  SocketName,
  SpeechGesture,
} from "@/types/office";
import { SparkleParticles } from "./character/CharacterEffects";
import { CharacterFace } from "./character/CharacterFace";
import {
  OUTLINE_COLOR,
  OUTLINE_SCALE,
  VINYL_MAT,
} from "./character/geometryHelpers";
import { renderAccessory } from "./character/parts/accessoryParts";
import { renderHair } from "./character/parts/hairParts";
import { renderHeadgear } from "./character/parts/headgearParts";
import { renderCape, renderOutfitTop } from "./character/parts/outfitParts";
import { renderProp } from "./character/parts/propParts";

export interface CharacterHandle {
  setEmotion: (emotion: EmotionType) => void;
}

export interface CharacterProps {
  id: string;
  state?: CharacterState;
  emotion?: EmotionType;
  handoverRole?: "giver" | "receiver";
  talkPartnerId?: string | null;
  gesture?: SpeechGesture;
  speechText?: string | null;
  hoverLabel?: string | null;
  /** Hiện nhãn tên trên đầu nhân vật (chỉ bật ở văn phòng chính). */
  showNameLabel?: boolean;
  speedMultiplier?: number;
  isYielding?: boolean;
  isFocused?: boolean;
  showDebugFacing?: boolean;
  debugPath?: Vec3[];
  targetPosition?: Vec3;
  initialPosition?: Vec3;
  initialRotationY?: number;
  blueprintOverride?: Partial<CharacterBlueprint>;
  onHoverChange?: (hovered: boolean) => void;
  onSelect?: () => void;
  onArrive?: () => void;
}

/** Renders all accessories assigned to a given socket */
function SocketAccessories({
  socket,
  accessories,
  gearRef,
}: {
  socket: SocketName;
  accessories: CharacterAccessorySpec[];
  gearRef?: React.RefObject<Group | null>;
}) {
  const matching = accessories.filter((a) => a.attach === socket);
  if (matching.length === 0) return null;

  return (
    <group>
      {matching.map((acc, idx) =>
        acc.type === "gear" && gearRef ? (
          <group key={`${acc.type}-${idx}`} ref={gearRef}>
            {renderAccessory(acc.type, acc.color)}
          </group>
        ) : (
          <group key={`${acc.type}-${idx}`}>
            {renderAccessory(acc.type, acc.color)}
          </group>
        )
      )}
    </group>
  );
}

export const Character = forwardRef<CharacterHandle, CharacterProps>(
  function Character(
    {
      id,
      state = "idle",
      emotion: emotionProp,
      handoverRole = "giver",
      talkPartnerId = null,
      gesture = "none",
      speechText = null,
      hoverLabel = null,
      showNameLabel = false,
      speedMultiplier = 1,
      isYielding = false,
      isFocused = false,
      showDebugFacing = false,
      debugPath,
      targetPosition,
      initialPosition,
      initialRotationY,
      blueprintOverride,
      onHoverChange,
      onSelect,
      onArrive,
    },
    ref
  ) {
    const { getMemberById } = useOfficeData();
    const member = getMemberById(id);
    const nameTone = getStatusTone(member?.status);
    const rank = getMemberRank(member?.id ?? "");
    const seat = MEMBER_SEATS[id];

    const startPos = useMemo<Vec3>(
      () => initialPosition ?? seat?.position ?? [0, 0, 0],
      [initialPosition, seat]
    );
    const startRotY = initialRotationY ?? seat?.rotationY ?? 0;

    const bp = useMemo<CharacterBlueprint | null>(() => {
      if (!member?.character) return null;
      return {
        ...member.character,
        ...blueprintOverride,
      };
    }, [member, blueprintOverride]);

    const [imperativeEmotion, setImperativeEmotion] =
      useState<EmotionType | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        setEmotion: (nextEmotion: EmotionType) => {
          setImperativeEmotion(nextEmotion);
        },
      }),
      []
    );

    useEffect(() => {
      if (emotionProp !== undefined) {
        setImperativeEmotion(null);
      }
    }, [emotionProp]);

    // Fake-rig socket refs (no Three.js Skeleton)
    const rootRef = useRef<Group>(null);
    const rigRef = useRef<Group>(null);
    const headSocketRef = useRef<Group>(null);
    const hairSocketRef = useRef<Group>(null);
    const capeRef = useRef<Group>(null);
    const gearRef = useRef<Group>(null);
    const leftArmRef = useRef<Group>(null);
    const rightArmRef = useRef<Group>(null);
    const leftLegRef = useRef<Group>(null);
    const rightLegRef = useRef<Group>(null);
    const shadowRef = useRef<Mesh>(null);

    // Smooth CatmullRomCurve3 path-following state
    const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
    const curveLengthRef = useRef(0);
    const curveDistanceRef = useRef(0);
    const tempPoint = useMemo(() => new THREE.Vector3(), []);
    const tempTangent = useMemo(() => new THREE.Vector3(), []);

    // Blended pose state for smooth 0.25s transitions & secondary motion
    const poseRef = useRef({
      rigY: 0,
      rigRotX: 0,
      rigRotY: 0,
      rigRotZ: 0,
      headX: 0,
      headY: 0,
      headZ: 0,
      lArmX: 0,
      lArmZ: 0.15,
      rArmX: 0,
      rArmZ: -0.15,
      lLegX: 0,
      rLegX: 0,
      capeX: 0.14,
      capeZ: 0,
      hairX: 0,
      hairZ: 0,
    });

    const [isWalkingToTarget, setIsWalkingToTarget] = useState(false);
    const [arrivedIdle, setArrivedIdle] = useState(false);
    const passerbyTimerRef = useRef(0);
    const passerbyPosRef = useRef(new THREE.Vector3());
    const worldPosRef = useRef(new THREE.Vector3());

    // Register & clean up live position entry for 2m passerby detection
    useEffect(() => {
      characterRegistry.set(id, {
        position: new THREE.Vector3(startPos[0], startPos[1], startPos[2]),
        isWalking: false,
      });
      return () => {
        characterRegistry.delete(id);
      };
    }, [id, startPos]);

    const targetKey = targetPosition
      ? `${targetPosition[0].toFixed(2)},${targetPosition[1].toFixed(2)},${targetPosition[2].toFixed(2)}`
      : "";

    useEffect(() => {
      if (!targetPosition || !rootRef.current) return;
      const current: Vec3 = [
        rootRef.current.position.x,
        rootRef.current.position.y,
        rootRef.current.position.z,
      ];
      const waypoints = computeCharacterPath(current, targetPosition);
      if (waypoints.length > 0) {
        const pts = [
          new THREE.Vector3(current[0], current[1], current[2]),
          ...waypoints.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
        ];
        const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.22);
        const len = curve.getLength();
        if (len > 0.05) {
          curveRef.current = curve;
          curveLengthRef.current = len;
          curveDistanceRef.current = 0;
          setIsWalkingToTarget(true);
          setArrivedIdle(false);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetKey]);

    useEffect(() => {
      setArrivedIdle(false);
    }, [state]);

    const effectiveState: CharacterState = isWalkingToTarget
      ? "walking"
      : arrivedIdle
        ? "idle"
        : state;

    const derivedEmotion: EmotionType =
      imperativeEmotion ??
      emotionProp ??
      (effectiveState === "celebrating"
        ? "celebrating"
        : effectiveState === "working"
          ? "focused"
          : effectiveState === "handover"
            ? "happy"
            : "idle");

    useFrame(({ clock, camera }, delta) => {
      const root = rootRef.current;
      const rig = rigRef.current;
      if (!root || !rig) return;

      const dt = Math.min(delta, 0.05);
      const rawT = clock.getElapsedTime();
      // Character quirk: 8bit-video moves with a subtle retro stepped 8fps cadence
      const t = id === "8bit-video" ? Math.floor(rawT * 8) / 8 : rawT;
      const seed = id.length * 0.7;
      const propType = bp?.prop.type ?? "none";

      // Update live registry position for passerby detection
      root.getWorldPosition(worldPosRef.current);
      const regEntry = characterRegistry.get(id);
      if (regEntry) {
        regEntry.position.copy(worldPosRef.current);
        regEntry.isWalking = effectiveState === "walking";
      }

      // 1. Follow CatmullRomCurve3 spline when walking to targetPosition
      if (curveRef.current && curveLengthRef.current > 0) {
        if (!isYielding) {
          const baseSpeed = getCharacterWalkSpeed(id);
          curveDistanceRef.current += baseSpeed * speedMultiplier * dt;
        }
        const u = Math.min(1, curveDistanceRef.current / curveLengthRef.current);
        curveRef.current.getPointAt(u, tempPoint);
        curveRef.current.getTangentAt(u, tempTangent);

        root.position.copy(tempPoint);

        // Smoothly face direction of travel via faceTo
        if (Math.hypot(tempTangent.x, tempTangent.z) > 0.01) {
          faceTo(
            root,
            {
              x: root.position.x + tempTangent.x,
              z: root.position.z + tempTangent.z,
            },
            dt,
            6.5
          );
        }

        if (u >= 1) {
          curveRef.current = null;
          curveLengthRef.current = 0;
          setIsWalkingToTarget(false);
          setArrivedIdle(true);
          onArrive?.();
        }
      } else {
        // Situational root facing (slerp via faceTo / faceToYaw)
        if (isFocused) {
          // Clicked or hovered: face directly toward camera
          faceTo(root, { x: camera.position.x, z: camera.position.z }, dt, 5.2);
        } else if (talkPartnerId) {
          // Talking / handover: face each other
          const partner = characterRegistry.get(talkPartnerId);
          if (partner) {
            faceTo(
              root,
              { x: partner.position.x, z: partner.position.z },
              dt,
              5.0
            );
          }
        } else {
          // Default seated/idle: face workstation 3/4 outward yaw toward camera/lobby
          faceToYaw(root, startRotY, dt, 3.2);
        }
      }

      // Detect any walking passerby within 2m
      if (effectiveState !== "walking" && !isFocused) {
        let foundNear = false;
        characterRegistry.forEach((other, otherId) => {
          if (otherId === id || !other.isWalking) return;
          const dist = worldPosRef.current.distanceTo(other.position);
          if (dist <= 2.0) {
            passerbyPosRef.current.copy(other.position);
            passerbyTimerRef.current = 1.6;
            foundNear = true;
          }
        });
        if (!foundNear && passerbyTimerRef.current > 0) {
          passerbyTimerRef.current = Math.max(0, passerbyTimerRef.current - dt);
        }
      } else {
        passerbyTimerRef.current = 0;
      }

      // 2. Compute target pose for current state
      let rigY = 0;
      let rigRotX = 0;
      let rigRotY = 0;
      let rigRotZ = 0;
      let headX = 0;
      let headY = 0;
      let headZ = 0;
      let lArmX = 0;
      let lArmZ = 0.15;
      let rArmX = 0;
      let rArmZ = -0.15;
      let lLegX = 0;
      let rLegX = 0;
      let capeX = 0.14;
      let capeZ = 0;
      let hairX = 0;
      let hairZ = 0;

      if (effectiveState === "idle") {
        rigY = Math.sin(t * 2.4 + seed) * 0.028;
        headZ = Math.sin(t * 1.6 + seed) * 0.06;
        headY = Math.sin(t * 1.1 + seed) * 0.085;
        lArmX = Math.sin(t * 2.1 + seed) * 0.08;
        rArmX = -Math.sin(t * 2.1 + seed) * 0.08;
        // Delayed secondary motion for cape & hair
        capeX = 0.14 + Math.sin(t * 2.4 + seed - 0.65) * 0.07;
        capeZ = Math.sin(t * 1.6 + seed - 0.5) * 0.04;
        hairZ = Math.sin(t * 1.6 + seed - 0.55) * 0.045;
      } else if (effectiveState === "walking") {
        rigY = Math.abs(Math.sin(t * 10)) * 0.08;
        rigRotX = 0.1; // Slight forward lean along walking direction
        rigRotZ = Math.sin(t * 10) * 0.1;
        headZ = -Math.sin(t * 10) * 0.05;
        headX = 0.04;
        // Arms swing opposite to legs
        lArmX = Math.sin(t * 10) * 0.68;
        rArmX = -Math.sin(t * 10) * 0.68;
        lLegX = -Math.sin(t * 10) * 0.58;
        rLegX = Math.sin(t * 10) * 0.58;
        // Cape & hair stream backward opposite to travel
        capeX = 0.44 + Math.sin(t * 10 - 0.7) * 0.16;
        capeZ = -Math.sin(t * 10 - 0.6) * 0.1;
        hairX = -0.11 + Math.sin(t * 10 - 0.6) * 0.05;
        hairZ = -Math.sin(t * 10 - 0.5) * 0.06;
      } else if (effectiveState === "working") {
        rigY = 0.12 + Math.sin(t * 3.0 + seed) * 0.014;
        rigRotX = 0.09; // Slight lean toward desk
        headX = 0.15 + Math.sin(t * 2.2 + seed) * 0.03;
        headY = Math.sin(t * 1.4 + seed) * 0.05;
        headZ = Math.sin(t * 1.7 + seed) * 0.035;
        lLegX = -1.25;
        rLegX = -1.25;
        capeX = 0.22 + Math.sin(t * 2.5 + seed - 0.6) * 0.04;

        // Prop-specific working hand gestures
        if (propType === "notebook") {
          // Turning notebook pages periodically
          lArmX = -0.82;
          rArmX = -0.92 + Math.sin(t * 3.4) * 0.24;
          rArmZ = 0.14 + Math.cos(t * 3.4) * 0.16;
        } else if (propType === "quill" || propType === "scroll") {
          // Flowing calligraphy / writing strokes
          lArmX = -0.75;
          rArmX = -1.02 + Math.sin(t * 8.5) * 0.16;
          rArmZ = 0.12 + Math.cos(t * 13) * 0.14;
        } else if (propType === "wrench") {
          // Turning wrench back & forth
          lArmX = -0.7;
          rArmX = -1.05 + Math.sin(t * 6.5) * 0.3;
          rArmZ = 0.18 + Math.sin(t * 6.5) * 0.2;
        } else {
          // Typing on keyboard / laptop
          lArmX = -0.96 + Math.sin(t * 14 + seed) * 0.14;
          rArmX = -0.96 + Math.cos(t * 14 + seed) * 0.14;
          lArmZ = -0.12;
          rArmZ = 0.12;
        }
      } else if (effectiveState === "celebrating") {
        rigY = Math.abs(Math.sin(t * 7.5 + seed)) * 0.34;
        rigRotZ = Math.sin(t * 7.5 + seed) * 0.1;
        rigRotX = -0.04;
        headX = -0.09;
        headZ = Math.sin(t * 7.5 + seed) * 0.08;
        lArmX = -2.55 + Math.sin(t * 15) * 0.22;
        rArmX = -2.55 - Math.sin(t * 15) * 0.22;
        lArmZ = 0.36;
        rArmZ = -0.36;
        lLegX = rigY * 1.1;
        rLegX = -rigY * 0.85;
        capeX = 0.36 + Math.sin(t * 7.5 + seed - 0.7) * 0.22;
        hairX = -0.08 + Math.sin(t * 7.5 - 0.5) * 0.08;
      } else if (effectiveState === "handover") {
        rigY = Math.sin(t * 3.0 + seed) * 0.02;
        if (handoverRole === "giver") {
          // Presenting prop/work packet forward toward receiver
          rigRotX = 0.14;
          headX = 0.06;
          rArmX = -1.38 + Math.sin(t * 4.5) * 0.08;
          rArmZ = 0.18;
          lArmX = -0.82 + Math.sin(t * 4.5) * 0.06;
          lArmZ = -0.1;
          capeX = 0.24;
        } else {
          // Receiver nods warmly and reaches out gently
          rigRotX = 0.04;
          headX = 0.18 + Math.sin(t * 6.8) * 0.14;
          rArmX = -0.78 + Math.sin(t * 3.5) * 0.06;
          lArmX = -0.72;
          capeX = 0.16;
        }
      }

      // 3. Individual character personality quirks
      if (id === "lex") {
        // Lex: stands upright and composed
        rigRotX *= 0.35;
        rigRotZ *= 0.5;
      } else if (id === "emma" && (effectiveState === "idle" || effectiveState === "working")) {
        // Emma: frequently glances down toward her notebook in right hand
        const glance = (Math.sin(t * 1.2) + 1) * 0.5;
        headX += glance * 0.15;
        headY -= glance * 0.18;
      } else if (id === "alien") {
        // Alien: floats gently a few centimeters above the floor
        rigY += 0.11 + Math.sin(t * 2.8) * 0.04;
      } else if (id === "dev" && (effectiveState === "working" || effectiveState === "idle")) {
        // Dev: playfully swivels chair side-to-side
        rigRotY = Math.sin(t * 1.45) * 0.24;
      }

      // 3b. Conversation & Interaction Gestures (wave, point, nod, tilt, laugh, chin)
      const activeGesture: SpeechGesture = isFocused ? "wave" : gesture;
      if (activeGesture === "wave") {
        rArmX = -2.35 + Math.sin(t * 11) * 0.25;
        rArmZ = -0.32;
      } else if (activeGesture === "point") {
        rArmX = -1.35 + Math.sin(t * 6) * 0.12;
        rArmZ = 0.08;
      } else if (activeGesture === "nod") {
        headX = 0.14 + Math.sin(t * 6.5) * 0.14;
      } else if (activeGesture === "tilt") {
        headZ = 0.22;
      } else if (activeGesture === "laugh") {
        rigY += Math.abs(Math.sin(t * 9)) * 0.05;
        headX = -0.08;
      } else if (activeGesture === "chin") {
        rArmX = -1.65;
        rArmZ = 0.28;
        headZ = -0.1;
      }

      // 3c. Situational head/neck gaze overrides
      if (isFocused) {
        // Looking straight at the camera lens
        headX = -0.06;
        headY = 0;
        headZ = 0;
      } else if (passerbyTimerRef.current > 0) {
        // Turn head & neck toward nearby walking passerby (torso follows much slower)
        const dx = passerbyPosRef.current.x - worldPosRef.current.x;
        const dz = passerbyPosRef.current.z - worldPosRef.current.z;
        const desiredWorldYaw = Math.atan2(dx, dz) + FACING_OFFSET;
        let relYaw = desiredWorldYaw - root.rotation.y;
        while (relYaw > Math.PI) relYaw -= Math.PI * 2;
        while (relYaw < -Math.PI) relYaw += Math.PI * 2;
        headY = THREE.MathUtils.clamp(relYaw, -0.75, 0.75);
        rigRotY = THREE.MathUtils.clamp(relYaw * 0.25, -0.25, 0.25);
      } else if (effectiveState === "working" || effectiveState === "idle") {
        // Periodically glance toward desk/screen (~1.5s every 6s) then look back out
        const glanceCycle = Math.sin(t * 0.95 + seed);
        if (glanceCycle > 0.55) {
          headX += 0.14;
          headY += 0.22;
        }
      }

      // 4. Smooth 0.25-second state blending (exponential damp, ~95% in 0.24s)
      const blendAlpha =
        id === "8bit-video"
          ? 1 - Math.exp(-dt / 0.045) // snappier stepped feel for 8bit-video
          : 1 - Math.exp(-dt / 0.082);
      const secondaryAlpha = 1 - Math.exp(-dt / 0.13);
      const p = poseRef.current;

      p.rigY = THREE.MathUtils.lerp(p.rigY, rigY, blendAlpha);
      p.rigRotX = THREE.MathUtils.lerp(p.rigRotX, rigRotX, blendAlpha);
      p.rigRotY = THREE.MathUtils.lerp(p.rigRotY, rigRotY, blendAlpha);
      p.rigRotZ = THREE.MathUtils.lerp(p.rigRotZ, rigRotZ, blendAlpha);
      p.headX = THREE.MathUtils.lerp(p.headX, headX, blendAlpha);
      p.headY = THREE.MathUtils.lerp(p.headY, headY, blendAlpha);
      p.headZ = THREE.MathUtils.lerp(p.headZ, headZ, blendAlpha);
      p.lArmX = THREE.MathUtils.lerp(p.lArmX, lArmX, blendAlpha);
      p.lArmZ = THREE.MathUtils.lerp(p.lArmZ, lArmZ, blendAlpha);
      p.rArmX = THREE.MathUtils.lerp(p.rArmX, rArmX, blendAlpha);
      p.rArmZ = THREE.MathUtils.lerp(p.rArmZ, rArmZ, blendAlpha);
      p.lLegX = THREE.MathUtils.lerp(p.lLegX, lLegX, blendAlpha);
      p.rLegX = THREE.MathUtils.lerp(p.rLegX, rLegX, blendAlpha);

      // Delayed secondary motion on cape & hair
      p.capeX = THREE.MathUtils.lerp(p.capeX, capeX, secondaryAlpha);
      p.capeZ = THREE.MathUtils.lerp(p.capeZ, capeZ, secondaryAlpha);
      p.hairX = THREE.MathUtils.lerp(p.hairX, hairX, secondaryAlpha);
      p.hairZ = THREE.MathUtils.lerp(p.hairZ, hairZ, secondaryAlpha);

      // Apply blended transforms to fake-rig sockets
      rig.position.y = p.rigY;
      rig.rotation.set(p.rigRotX, p.rigRotY, p.rigRotZ);

      if (headSocketRef.current) {
        headSocketRef.current.rotation.set(p.headX, p.headY, p.headZ);
      }
      if (hairSocketRef.current) {
        hairSocketRef.current.rotation.set(p.hairX, 0, p.hairZ);
      }
      if (capeRef.current) {
        capeRef.current.rotation.set(p.capeX, 0, p.capeZ);
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.set(p.lArmX, 0, p.lArmZ);
        rightArmRef.current.rotation.set(p.rArmX, 0, p.rArmZ);
      }
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = p.lLegX;
        rightLegRef.current.rotation.x = p.rLegX;
      }

      // Rotating back gear (Automation)
      const isMoving =
        effectiveState === "walking" || effectiveState === "celebrating";
      if (gearRef.current) {
        gearRef.current.rotation.z = rawT * (isMoving ? 2.2 : 1.05);
      }

      // Contact shadow reacts smoothly to vertical lift (jumping / Alien hovering)
      if (shadowRef.current) {
        const s = Math.max(0.58, 1 - Math.max(0, p.rigY) * 0.8);
        shadowRef.current.scale.set(s, s, 1);
      }
    });

    if (!member || !bp) return null;

    const isPixel = bp.body.bodyShape === "pixel";
    const bodyScale = bp.body.height;
    const headScale = bp.body.headScale;
    const isWorking = effectiveState === "working";
    const isCelebrating =
      effectiveState === "celebrating" || derivedEmotion === "celebrating";
    const hasGlowAntennae =
      bp.face.extras.includes("glowAntennae") ||
      bp.headgear.type === "antennae";
    const propOptions = {
      primaryColor: bp.outfit.topColor,
      secondaryColor: bp.outfit.trim,
      isWorking,
    };

    return (
      <group>
        {/* Debug destination / lookAt wireframe marker (when Debug mode D is active) */}
        {showDebugFacing && (targetPosition || seat?.lookAt) && (
          <group
            position={
              targetPosition
                ? [targetPosition[0], 0.05, targetPosition[2]]
                : [seat!.lookAt[0], 0.05, seat!.lookAt[2]]
            }
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.3, 18]} />
              <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
              <meshBasicMaterial color="#10B981" />
            </mesh>
          </group>
        )}

        {/* Debug computed A* path dots on floor (when Debug mode D is active) */}
        {showDebugFacing && debugPath && debugPath.length > 0 && (
          <group>
            {debugPath.map((pt, idx) => (
              <mesh key={idx} position={[pt[0], 0.07, pt[2]]}>
                <sphereGeometry args={[0.075, 8, 8]} />
                <meshBasicMaterial color="#10B981" />
              </mesh>
            ))}
          </group>
        )}

        <group
          ref={rootRef}
          position={startPos}
          rotation={[0, startRotY + FACING_OFFSET, 0]}
          onPointerOver={(e) => {
            if (!onHoverChange) return;
            e.stopPropagation();
            onHoverChange(true);
          }}
          onPointerOut={(e) => {
            if (!onHoverChange) return;
            e.stopPropagation();
            onHoverChange(false);
          }}
          onClick={(e) => {
            if (!onSelect) return;
            e.stopPropagation();
            onSelect();
          }}
        >
          {/* Compact Speech Bubble (one sentence at a time, ivory rounded) */}
          {speechText && (
            <Html position={[0, 1.92, 0]} center zIndexRange={[25, 0]}>
              <div className="pointer-events-none max-w-[200px] rounded-2xl border border-[#DFD6BE] bg-[#FCF9F2]/96 px-3 py-1.5 text-center text-[11px] font-medium leading-snug text-[#2A251D] shadow-md backdrop-blur-sm">
                <span className="font-extrabold text-[#3F5B2F]">
                  {member.name}:{" "}
                </span>
                {speechText}
              </div>
            </Html>
          )}

          {/* Hover Activity Tooltip ("Alien · đang viết kịch bản") */}
          {hoverLabel && !speechText && (
            <Html position={[0, 1.78, 0]} center zIndexRange={[24, 0]}>
              <div className="pointer-events-none whitespace-nowrap rounded-full border border-[#DFD6BE] bg-[#231F18]/90 px-3 py-1 text-[11px] font-medium text-[#FAF6EC] shadow-md backdrop-blur-sm">
                <span className="font-bold text-[#E8C66D]">{member.name}</span>
                {" · "}
                {hoverLabel}
              </div>
            </Html>
          )}

          {/* Name Label: tên trên đầu nhân vật, màu theo trạng thái việc.
              Bấm được vào thẻ tên để mở thẻ nhân vật — trước đây thẻ tên
              xuyên thấu (pointer-events-none) nên bấm vào đó là bấm vào
              khoảng trống trên đầu nhân vật, không mở được gì, mà trên
              điện thoại thẻ tên là chỗ dễ bấm nhất.
              Badge cấp bậc nằm dưới tên, màu riêng theo cấp (vàng Chủ tịch /
              tím CEO / xanh dương Giám đốc / teal Chuyên viên) — không thay
              màu trạng thái của thẻ tên. */}
          {showNameLabel && member && (
            <Html position={[0, 2.14, 0]} center zIndexRange={[23, 0]}>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.();
                  }
                }}
                className="flex cursor-pointer flex-col items-center gap-1"
              >
                <span
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-md backdrop-blur-sm"
                  style={{
                    backgroundColor: nameTone.chipBg,
                    color: nameTone.chipText,
                    borderColor: nameTone.chipBorder,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: nameTone.dot }}
                  />
                  {member.name}
                </span>
                <span
                  className={`rank-badge inline-flex items-center whitespace-nowrap rounded-full font-extrabold tracking-wide shadow-sm ${
                    rank.prominent
                      ? "rank-badge--gold px-2.5 py-0.5 text-[10px]"
                      : "px-2 py-0.5 text-[9px]"
                  }`}
                  style={{
                    backgroundColor: rank.color,
                    color: rank.textColor,
                  }}
                >
                  {rank.label}
                </span>
              </div>
            </Html>
          )}
          {/* Debug Facing Arrow / Cone along local +Z */}
          {showDebugFacing && (
            <group position={[0, 1.05, 0.42]}>
              <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.36, 8]} />
                <meshBasicMaterial color="#10B981" />
              </mesh>
              <mesh position={[0, 0, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.09, 0.22, 10]} />
                <meshBasicMaterial color="#059669" />
              </mesh>
            </group>
          )}
        {/* Soft Contact Shadow under feet */}
        <group position={[0, 0.02, 0]}>
          <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.37, 22]} />
            <meshBasicMaterial
              color="#2B241D"
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.23, 18]} />
            <meshBasicMaterial
              color="#2B241D"
              transparent
              opacity={0.22}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Fake-Rig Hierarchy with Standard Sockets */}
        <group ref={rigRef} scale={bodyScale}>
          {/* SOCKET: chest */}
          <group name="socket-chest" position={[0, 0.56, 0]}>
            {renderOutfitTop(
              bp.outfit.top,
              bp.outfit.topColor,
              bp.outfit.trim,
              bp.outfit.belt
            )}
            <SocketAccessories socket="chest" accessories={bp.accessories} />

            {bp.prop.hand === "both" && bp.prop.type !== "none" && (
              <group position={[0, 0, 0.28]}>
                {renderProp(bp.prop.type, propOptions)}
              </group>
            )}
          </group>

          {/* SOCKET: neck */}
          <group name="socket-neck" position={[0, 0.78, 0]}>
            <SocketAccessories socket="neck" accessories={bp.accessories} />
          </group>

          {/* SOCKET: belt */}
          <group name="socket-belt" position={[0, 0.41, 0]}>
            <SocketAccessories socket="belt" accessories={bp.accessories} />
          </group>

          {/* SOCKET: backCenter */}
          <group name="socket-backCenter" position={[0, 0.72, -0.2]}>
            {bp.outfit.cape !== "none" && (
              <group ref={capeRef}>
                {renderCape(bp.outfit.cape, bp.outfit.topColor, bp.outfit.trim)}
              </group>
            )}
            <SocketAccessories
              socket="backCenter"
              accessories={bp.accessories}
              gearRef={gearRef}
            />
          </group>

          {/* SOCKET: head */}
          <group
            ref={headSocketRef}
            name="socket-head"
            position={[0, 1.07, 0]}
            scale={headScale}
          >
            {isPixel ? (
              <>
                <RoundedBox
                  args={[0.5, 0.46, 0.48]}
                  radius={0.07}
                  smoothness={4}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial
                    color={bp.body.skinColor}
                    {...VINYL_MAT}
                  />
                </RoundedBox>
                <RoundedBox
                  args={[
                    0.5 * OUTLINE_SCALE,
                    0.46 * OUTLINE_SCALE,
                    0.48 * OUTLINE_SCALE,
                  ]}
                  radius={0.07}
                  smoothness={3}
                >
                  <meshBasicMaterial
                    color={OUTLINE_COLOR}
                    side={THREE.BackSide}
                  />
                </RoundedBox>
              </>
            ) : (
              <>
                <mesh scale={[1.08, 0.94, 1.02]} castShadow receiveShadow>
                  <sphereGeometry args={[0.3, 24, 20]} />
                  <meshStandardMaterial
                    color={bp.body.skinColor}
                    {...VINYL_MAT}
                  />
                </mesh>
                <mesh
                  scale={[
                    1.08 * OUTLINE_SCALE,
                    0.94 * OUTLINE_SCALE,
                    1.02 * OUTLINE_SCALE,
                  ]}
                >
                  <sphereGeometry args={[0.3, 18, 14]} />
                  <meshBasicMaterial
                    color={OUTLINE_COLOR}
                    side={THREE.BackSide}
                  />
                </mesh>
              </>
            )}

            {/* Dedicated Expressive Facial Module */}
            <CharacterFace
              face={bp.face}
              skinColor={bp.body.skinColor}
              hairColor={bp.hair.color}
              isPixel={isPixel}
              emotion={derivedEmotion}
              isWalking={effectiveState === "walking"}
              headRef={headSocketRef}
            />

            {/* Hair group with secondary motion lag */}
            <group ref={hairSocketRef}>
              {renderHair(bp.hair.style, bp.hair.color)}
            </group>

            {renderHeadgear(
              bp.headgear.type,
              bp.headgear.color,
              bp.headgear.accentColor
            )}
            <SocketAccessories socket="head" accessories={bp.accessories} />

            {hasGlowAntennae && (
              <SparkleParticles variant="antennae" position={[0, 0.44, 0]} />
            )}
          </group>

          {isCelebrating && (
            <SparkleParticles variant="celebrating" position={[0, 0.85, 0]} />
          )}

          {/* SOCKET: leftHand */}
          <group ref={leftArmRef} position={[-0.27, 0.69, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.058, 0.14, 6, 12]} />
              <meshStandardMaterial color={bp.outfit.topColor} {...VINYL_MAT} />
            </mesh>
            <mesh position={[0, -0.11, 0]} scale={OUTLINE_SCALE}>
              <capsuleGeometry args={[0.058, 0.14, 6, 10]} />
              <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
            </mesh>
            <group name="socket-leftHand" position={[0, -0.23, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.065, 12, 12]} />
                <meshStandardMaterial color={bp.outfit.gloves} {...VINYL_MAT} />
              </mesh>
              <SocketAccessories
                socket="leftHand"
                accessories={bp.accessories}
              />
              {bp.prop.hand === "left" && bp.prop.type !== "none" && (
                <group position={[-0.03, -0.02, 0.11]}>
                  {renderProp(bp.prop.type, propOptions)}
                </group>
              )}
            </group>
          </group>

          {/* SOCKET: rightHand */}
          <group ref={rightArmRef} position={[0.27, 0.69, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.058, 0.14, 6, 12]} />
              <meshStandardMaterial color={bp.outfit.topColor} {...VINYL_MAT} />
            </mesh>
            <mesh position={[0, -0.11, 0]} scale={OUTLINE_SCALE}>
              <capsuleGeometry args={[0.058, 0.14, 6, 10]} />
              <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
            </mesh>
            <group name="socket-rightHand" position={[0, -0.23, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.065, 12, 12]} />
                <meshStandardMaterial color={bp.outfit.gloves} {...VINYL_MAT} />
              </mesh>
              <SocketAccessories
                socket="rightHand"
                accessories={bp.accessories}
              />
              {bp.prop.hand === "right" && bp.prop.type !== "none" && (
                <group position={[0.03, -0.02, 0.11]}>
                  {renderProp(bp.prop.type, propOptions)}
                </group>
              )}
            </group>
          </group>

          {/* SOCKET: leftFoot */}
          <group ref={leftLegRef} position={[-0.105, 0.34, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.066, 0.14, 6, 12]} />
              <meshStandardMaterial color={bp.outfit.belt} {...VINYL_MAT} />
            </mesh>
            <group name="socket-leftFoot" position={[0, -0.23, 0.035]}>
              <mesh scale={[1, 0.72, 1.38]} castShadow>
                <sphereGeometry args={[0.072, 12, 12]} />
                <meshStandardMaterial color={bp.outfit.boots} {...VINYL_MAT} />
              </mesh>
              <mesh
                scale={[
                  1 * OUTLINE_SCALE,
                  0.72 * OUTLINE_SCALE,
                  1.38 * OUTLINE_SCALE,
                ]}
              >
                <sphereGeometry args={[0.072, 10, 10]} />
                <meshBasicMaterial
                  color={OUTLINE_COLOR}
                  side={THREE.BackSide}
                />
              </mesh>
              <SocketAccessories
                socket="leftFoot"
                accessories={bp.accessories}
              />
            </group>
          </group>

          {/* SOCKET: rightFoot */}
          <group ref={rightLegRef} position={[0.105, 0.34, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.066, 0.14, 6, 12]} />
              <meshStandardMaterial color={bp.outfit.belt} {...VINYL_MAT} />
            </mesh>
            <group name="socket-rightFoot" position={[0, -0.23, 0.035]}>
              <mesh scale={[1, 0.72, 1.38]} castShadow>
                <sphereGeometry args={[0.072, 12, 12]} />
                <meshStandardMaterial color={bp.outfit.boots} {...VINYL_MAT} />
              </mesh>
              <mesh
                scale={[
                  1 * OUTLINE_SCALE,
                  0.72 * OUTLINE_SCALE,
                  1.38 * OUTLINE_SCALE,
                ]}
              >
                <sphereGeometry args={[0.072, 10, 10]} />
                <meshBasicMaterial
                  color={OUTLINE_COLOR}
                  side={THREE.BackSide}
                />
              </mesh>
              <SocketAccessories
                socket="rightFoot"
                accessories={bp.accessories}
              />
            </group>
          </group>
        </group>
      </group>
      </group>
    );
  }
);
