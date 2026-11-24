"use client";

import { useEffect, useState } from "react";

export interface GraphicsSettings {
  isMobile: boolean;
  /** Portrait viewport (aspect < 1): camera pulls back and opens up. */
  isPortrait: boolean;
  /** Live viewport aspect (width / height), for camera framing. */
  aspect: number;
  enableSSAO: boolean;
  isTabVisible: boolean;
}

/**
 * Adaptive graphics & performance hook:
 * - Detects mobile/small touch screens to disable heavy SSAO automatically.
 * - Tracks Page Visibility API so Canvas pauses rendering (`frameloop="never"`) when tab is hidden.
 */
export function useGraphicsSettings(): GraphicsSettings {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const narrow = window.innerWidth < 768;
      const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
      setIsMobile(narrow || coarse);
      const nextAspect = window.innerWidth / Math.max(1, window.innerHeight);
      setAspect(nextAspect);
      setIsPortrait(nextAspect < 1);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return {
    isMobile,
    isPortrait,
    aspect,
    enableSSAO: !isMobile,
    isTabVisible,
  };
}
