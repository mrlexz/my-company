"use client";

import {
  Bloom,
  EffectComposer,
  N8AO,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

interface PostProcessingEffectsProps {
  enabled: boolean;
  enableSSAO: boolean;
}

/**
 * Adaptive postprocessing stack:
 * - Subtle SSAO (via N8AO, automatically disabled on mobile devices)
 * - Soft Bloom for glowing monitors, LEDs, lamps, and sparkles
 * - Very subtle Vignette
 * - ACES Filmic Tone Mapping
 */
export function PostProcessingEffects({
  enabled,
  enableSSAO,
}: PostProcessingEffectsProps) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      {enableSSAO ? (
        <N8AO aoRadius={0.65} intensity={1.15} distanceFalloff={0.8} />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        luminanceThreshold={1.0}
        intensity={0.32}
        radius={0.55}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.26} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
