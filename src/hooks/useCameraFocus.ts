"use client";

import { useCallback, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  adaptCameraPreset,
  type CameraFocusPreset,
  type ComputedRoom,
} from "@/lib/officeLayout";
import type { DepartmentId } from "@/types/office";

interface FocusOptions extends CameraFocusPreset {
  duration?: number;
  ease?: string;
  onComplete?: () => void;
  /**
   * Half-width (world units) of the subject that must fit horizontally.
   * 8 = whole office overview, 4.5 = one department room. On portrait
   * phones the camera pulls back so the subject still fits; desktop is
   * unchanged.
   */
  halfWidth?: number;
}

export function useCameraFocus(
  controlsRef: React.RefObject<OrbitControlsImpl | null>,
  rooms?: ComputedRoom[]
) {
  const { camera } = useThree();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const killActiveTween = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
  }, []);

  const focusOn = useCallback(
    ({
      position,
      target,
      duration = 1.2,
      ease = "power3.inOut",
      onComplete,
      halfWidth = 9,
    }: FocusOptions) => {
      killActiveTween();

      const controls = controlsRef.current;
      if (controls) {
        controls.minDistance = 3.5;
      }

      // Portrait phones: pull the camera back so the subject fits the
      // narrow screen. Read the live aspect so an orientation change
      // mid-session is honoured by the next camera move.
      const aspect =
        typeof window !== "undefined"
          ? window.innerWidth / Math.max(1, window.innerHeight)
          : 1;
      const adaptedPosition = adaptCameraPreset(
        position,
        target,
        aspect,
        halfWidth,
      );

      const tl = gsap.timeline({
        onComplete: () => {
          onComplete?.();
        },
      });

      tl.to(
        camera.position,
        {
          x: adaptedPosition[0],
          y: adaptedPosition[1],
          z: adaptedPosition[2],
          duration,
          ease,
          onUpdate: () => {
            controls?.update();
          },
        },
        0
      );

      if (controls) {
        tl.to(
          controls.target,
          {
            x: target[0],
            y: target[1],
            z: target[2],
            duration,
            ease,
            onUpdate: () => {
              controls.update();
            },
          },
          0
        );
      }

      timelineRef.current = tl;
    },
    [camera, controlsRef, killActiveTween]
  );

  const focusDepartment = useCallback(
    (departmentId: DepartmentId, duration = 1.2) => {
      const room = rooms?.find((r) => r.department.id === departmentId);
      if (!room) return;
      focusOn({
        position: room.cameraFocus.position,
        target: room.cameraFocus.target,
        duration,
        halfWidth: 4.5,
      });
    },
    [focusOn, rooms]
  );

  const resetCamera = useCallback(
    (duration = 1.2) => {
      focusOn({
        position: DEFAULT_CAMERA_POSITION,
        target: DEFAULT_CAMERA_TARGET,
        duration,
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.minDistance = 12;
          }
        },
      });
    },
    [controlsRef, focusOn]
  );

  useEffect(() => {
    return () => {
      killActiveTween();
    };
  }, [killActiveTween]);

  return {
    focusOn,
    focusDepartment,
    resetCamera,
    killActiveTween,
  };
}
