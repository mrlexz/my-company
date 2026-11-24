"use client";

import { useEffect, useState } from "react";

export interface GraphicsSettings {
  isMobile: boolean;
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
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const narrow = window.innerWidth < 768;
      const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
      setIsMobile(narrow || coarse);
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
    enableSSAO: !isMobile,
    isTabVisible,
  };
}
