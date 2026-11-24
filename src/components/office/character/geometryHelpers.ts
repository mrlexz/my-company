import * as THREE from "three";

export const OUTLINE_COLOR = "#2B241D";
export const OUTLINE_SCALE = 1.03;

const geometryCache = new Map<string, THREE.BufferGeometry>();

function cached(key: string, factory: () => THREE.BufferGeometry) {
  let geom = geometryCache.get(key);
  if (!geom) {
    geom = factory();
    geometryCache.set(key, geom);
  }
  return geom;
}

/** Soft matte vinyl material defaults (roughness 0.7–0.85, metalness 0) */
export const VINYL_MAT = {
  roughness: 0.78,
  metalness: 0,
} as const;

/** Satin metal material defaults for armor, gears, buckles */
export const METAL_MAT = {
  roughness: 0.4,
  metalness: 0.4,
} as const;

/** LatheGeometry: Wizard Hat (flared brim + curved conical crown) */
export function getWizardHatGeometry(): THREE.BufferGeometry {
  return cached("wizardHat", () => {
    const pts = [
      new THREE.Vector2(0.01, 0.48),
      new THREE.Vector2(0.08, 0.36),
      new THREE.Vector2(0.16, 0.2),
      new THREE.Vector2(0.24, 0.05),
      new THREE.Vector2(0.42, 0.02),
      new THREE.Vector2(0.44, -0.01),
      new THREE.Vector2(0.24, -0.02),
    ];
    return new THREE.LatheGeometry(pts, 24);
  });
}

/** LatheGeometry: Sculpted Hood dome */
export function getHoodGeometry(): THREE.BufferGeometry {
  return cached("hood", () => {
    const pts = [
      new THREE.Vector2(0.01, 0.34),
      new THREE.Vector2(0.18, 0.32),
      new THREE.Vector2(0.32, 0.2),
      new THREE.Vector2(0.35, 0.02),
      new THREE.Vector2(0.32, -0.14),
    ];
    return new THREE.LatheGeometry(pts, 22, -Math.PI * 0.65, Math.PI * 1.3);
  });
}

/** LatheGeometry: Flared Robe / Tunic Torso */
export function getRobeTorsoGeometry(): THREE.BufferGeometry {
  return cached("robeTorso", () => {
    const pts = [
      new THREE.Vector2(0.14, 0.24),
      new THREE.Vector2(0.19, 0.16),
      new THREE.Vector2(0.22, 0.0),
      new THREE.Vector2(0.27, -0.16),
      new THREE.Vector2(0.29, -0.25),
      new THREE.Vector2(0.01, -0.25),
    ];
    return new THREE.LatheGeometry(pts, 22);
  });
}

/** LatheGeometry: Tailored Suit / Coat Torso */
export function getCoatTorsoGeometry(): THREE.BufferGeometry {
  return cached("coatTorso", () => {
    const pts = [
      new THREE.Vector2(0.15, 0.23),
      new THREE.Vector2(0.205, 0.16),
      new THREE.Vector2(0.215, 0.0),
      new THREE.Vector2(0.24, -0.16),
      new THREE.Vector2(0.235, -0.23),
      new THREE.Vector2(0.01, -0.23),
    ];
    return new THREE.LatheGeometry(pts, 22);
  });
}

/** LatheGeometry: Megaphone bell */
export function getMegaphoneGeometry(): THREE.BufferGeometry {
  return cached("megaphone", () => {
    const pts = [
      new THREE.Vector2(0.025, 0),
      new THREE.Vector2(0.04, 0.08),
      new THREE.Vector2(0.085, 0.19),
      new THREE.Vector2(0.125, 0.24),
      new THREE.Vector2(0.115, 0.24),
      new THREE.Vector2(0.03, 0.05),
    ];
    return new THREE.LatheGeometry(pts, 18);
  });
}

/** ExtrudeGeometry: Swept Hair Bangs / Lock */
export function getHairLockGeometry(): THREE.BufferGeometry {
  return cached("hairLock", () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.14, 0.08);
    shape.quadraticCurveTo(0.0, 0.14, 0.15, 0.05);
    shape.quadraticCurveTo(0.12, -0.05, 0.02, -0.09);
    shape.quadraticCurveTo(-0.08, -0.04, -0.14, 0.08);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.022,
      bevelSegments: 4,
      curveSegments: 12,
    });
    geom.center();
    return geom;
  });
}

/** ExtrudeGeometry: Curved Vinyl Cape (short or long) */
export function getCapeGeometry(length: "short" | "long"): THREE.BufferGeometry {
  return cached(`cape-${length}`, () => {
    const h = length === "long" ? 0.44 : 0.26;
    const bottomW = length === "long" ? 0.25 : 0.21;
    const shape = new THREE.Shape();
    shape.moveTo(-0.16, 0);
    shape.lineTo(0.16, 0);
    shape.quadraticCurveTo(bottomW, -h * 0.65, bottomW * 0.95, -h);
    shape.quadraticCurveTo(0, -h - 0.04, -bottomW * 0.95, -h);
    shape.quadraticCurveTo(-bottomW, -h * 0.65, -0.16, 0);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 10,
    });
    // Slight backward drape curve along vertices
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const ratio = Math.min(1, Math.abs(y) / h);
      pos.setZ(i, pos.getZ(i) - ratio * ratio * 0.09);
    }
    geom.computeVertexNormals();
    return geom;
  });
}

/** ExtrudeGeometry: Heraldic Shield */
export function getShieldGeometry(): THREE.BufferGeometry {
  return cached("shield", () => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.15, 0.16);
    shape.quadraticCurveTo(0, 0.2, 0.15, 0.16);
    shape.lineTo(0.14, -0.02);
    shape.quadraticCurveTo(0.1, -0.15, 0, -0.2);
    shape.quadraticCurveTo(-0.1, -0.15, -0.14, -0.02);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.032,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.012,
      bevelSegments: 3,
    });
    geom.center();
    return geom;
  });
}

/** ExtrudeGeometry: Speech Bubble */
export function getSpeechBubbleGeometry(): THREE.BufferGeometry {
  return cached("speechBubble", () => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0.02, 0.13, 0.09, 0, Math.PI * 2, false, 0);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 3,
    });
    geom.center();
    return geom;
  });
}
