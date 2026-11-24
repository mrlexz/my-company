"use client";

import { useCallback, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  type CameraFocusPreset,
  type ComputedRoom,
} from "@/lib/officeLayout";
import type { DepartmentId } from "@/types/office";

interface FocusOptions extends CameraFocusPreset {
  duration?: number;
  ease?: string;
  onComplete?: () => void;
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
    }: FocusOptions) => {
      killActiveTween();

      const controls = controlsRef.current;
      if (controls) {
        controls.minDistance = 3.5;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          onComplete?.();
        },
      });

      tl.to(
        camera.position,
        {
          x: position[0],
          y: position[1],
          z: position[2],
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
