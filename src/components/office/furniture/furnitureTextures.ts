"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const HONEY_WOOD_COLOR = "#C99A5B";

const staticTexCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat?: [number, number]
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const existing = staticTexCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  draw(ctx, width, height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.needsUpdate = true;
  staticTexCache.set(key, tex);
  return tex;
}

/** Honey wood (#C99A5B) procedural staggered plank grain texture */
export function getHoneyWoodTexture(): THREE.CanvasTexture | null {
  return getOrCreateTexture(
    "honey-wood",
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = HONEY_WOOD_COLOR;
      ctx.fillRect(0, 0, w, h);

      const rows = 8;
      const rowH = h / rows;

      // Staggered wood planks with subtle tone variation & joints
      for (let i = 0; i < rows; i++) {
        const y = i * rowH;
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(154, 102, 46, 0.08)" : "rgba(255, 232, 190, 0.07)";
        ctx.fillRect(0, y, w, rowH);

        // Horizontal plank seam
        ctx.strokeStyle = "rgba(105, 66, 26, 0.24)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();

        // Staggered vertical plank joint
        const jointX = ((i * 97 + 42) % (w - 40)) + 20;
        ctx.beginPath();
        ctx.moveTo(jointX, y);
        ctx.lineTo(jointX, y + rowH);
        ctx.stroke();
      }

      // Organic wood grain lines
      ctx.strokeStyle = "rgba(128, 82, 34, 0.16)";
      ctx.lineWidth = 1.2;
      for (let y = 6; y < h; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) {
          const wave = Math.sin(x * 0.03 + y * 0.15) * 2.2;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
    },
    [2, 2]
  );
}

/** Executive round rug with golden crest emblem */
export function getExecutiveRugTexture(color: string): THREE.CanvasTexture | null {
  return getOrCreateTexture(`rug-exec-${color}`, 256, 256, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    // Outer & inner golden borders
    ctx.strokeStyle = "#E5C068";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, 114, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Central hexagonal crest emblem
    ctx.fillStyle = "rgba(229, 192, 104, 0.22)";
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      const x = cx + Math.cos(a) * 44;
      const y = cy + Math.sin(a) * 44;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner diamond
    ctx.fillStyle = "#E5C068";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22);
    ctx.lineTo(cx + 22, cy);
    ctx.lineTo(cx, cy + 22);
    ctx.lineTo(cx - 22, cy);
    ctx.closePath();
    ctx.fill();
  });
}

/** Content rug: burnt orange with film-strip sprocket border */
export function getContentRugTexture(color: string): THREE.CanvasTexture | null {
  return getOrCreateTexture(`rug-content-${color}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    // Film strip dark borders top & bottom
    ctx.fillStyle = "#3A2218";
    ctx.fillRect(0, 0, w, 30);
    ctx.fillRect(0, h - 30, w, 30);

    // Sprocket holes
    ctx.fillStyle = "#F5EFE0";
    for (let x = 10; x < w; x += 28) {
      ctx.fillRect(x, 8, 16, 14);
      ctx.fillRect(x, h - 22, 16, 14);
    }

    // Subtle warm inner frame
    ctx.strokeStyle = "rgba(250, 240, 220, 0.35)";
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 42, w - 28, h - 84);
  });
}

/** Marketing rug: blue with chevron zigzag pattern */
export function getMarketingRugTexture(color: string): THREE.CanvasTexture | null {
  return getOrCreateTexture(`rug-marketing-${color}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(245, 239, 224, 0.32)";
    ctx.lineWidth = 8;
    for (let y = 24; y < h + 24; y += 36) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 32) {
        const py = (x / 32) % 2 === 0 ? y : y - 16;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = "#F5EFE0";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
  });
}

/** IT rug: purple with circuit-board trace pattern */
export function getITRugTexture(color: string): THREE.CanvasTexture | null {
  return getOrCreateTexture(`rug-it-${color}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(120, 215, 255, 0.38)";
    ctx.fillStyle = "rgba(120, 215, 255, 0.65)";
    ctx.lineWidth = 3;

    const paths = [
      [
        [24, 32],
        [88, 32],
        [110, 54],
        [110, 110],
      ],
      [
        [232, 48],
        [170, 48],
        [148, 70],
        [148, 140],
      ],
      [
        [36, 216],
        [96, 216],
        [124, 188],
        [190, 188],
      ],
      [
        [220, 216],
        [196, 192],
        [196, 120],
        [232, 120],
      ],
      [
        [24, 130],
        [76, 130],
        [96, 150],
        [148, 150],
      ],
    ];

    paths.forEach((pts) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Solder pads at ends
      const start = pts[0];
      const end = pts[pts.length - 1];
      [start, end].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.strokeStyle = "rgba(220, 195, 255, 0.35)";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  });
}

export type ScreenMode =
  | "timeline"
  | "analyticsBlue"
  | "analyticsAmber"
  | "analyticsGreen"
  | "channelWall"
  | "code"
  | "network";

/**
 * Live animated CanvasTexture hook for room monitors.
 * Updates ~5 times/sec to stay lightweight while looking genuinely alive.
 */
export function useAnimatedScreenTexture(mode: ScreenMode): THREE.CanvasTexture | null {
  const { canvas, texture } = useMemo(() => {
    if (typeof document === "undefined") {
      return { canvas: null, texture: null };
    }
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 144;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, texture: t };
  }, []);

  const lastUpdateRef = useRef(0);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  useFrame(({ clock }) => {
    if (!canvas || !texture) return;
    const t = clock.getElapsedTime();
    if (t - lastUpdateRef.current < 0.18) return;
    lastUpdateRef.current = t;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#18202C";
    ctx.fillRect(0, 0, w, h);

    if (mode === "timeline") {
      // Video preview frame
      ctx.fillStyle = "#243247";
      ctx.fillRect(10, 10, 148, 72);
      ctx.fillStyle = "#D96B43";
      ctx.fillRect(22, 22, 64, 48);
      ctx.fillStyle = "#F2B857";
      ctx.beginPath();
      ctx.arc(118, 46, 18, 0, Math.PI * 2);
      ctx.fill();

      // Side inspector bars
      ctx.fillStyle = "#222E40";
      ctx.fillRect(166, 10, 80, 72);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#5BC0EB" : "#F2B857";
        ctx.fillRect(174, 18 + i * 15, 36 + ((i * 17) % 28), 8);
      }

      // Multi-color timeline clips
      const tracks = [
        { y: 92, color: "#E07A5F", segs: [[10, 68], [84, 72], [164, 78]] },
        { y: 108, color: "#38BDF8", segs: [[10, 110], [128, 112]] },
        { y: 124, color: "#81B29A", segs: [[18, 92], [118, 120]] },
      ];
      tracks.forEach((tr) => {
        ctx.fillStyle = tr.color;
        tr.segs.forEach(([sx, sw]) => ctx.fillRect(sx, tr.y, sw, 10));
      });

      // Moving red playhead
      const playX = 14 + ((t * 36) % (w - 28));
      ctx.fillStyle = "#FF5A5F";
      ctx.fillRect(playX, 86, 3, 52);
    } else if (
      mode === "analyticsBlue" ||
      mode === "analyticsAmber" ||
      mode === "analyticsGreen"
    ) {
      const palette =
        mode === "analyticsBlue"
          ? ["#38BDF8", "#60A5FA", "#818CF8"]
          : mode === "analyticsAmber"
            ? ["#F59E0B", "#FB923C", "#FBBF24"]
            : ["#34D399", "#10B981", "#6EE7B7"];

      // Header KPI cards
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#233044";
        ctx.fillRect(10 + i * 80, 10, 72, 28);
        ctx.fillStyle = palette[i];
        ctx.fillRect(16 + i * 80, 26, 44, 6);
      }

      // Animated rising bars
      for (let i = 0; i < 8; i++) {
        const barH = 26 + Math.abs(Math.sin(t * 1.6 + i * 0.7)) * 56;
        ctx.fillStyle = palette[i % palette.length];
        ctx.fillRect(14 + i * 29, h - 14 - barH, 20, barH);
      }
    } else if (mode === "channelWall") {
      const colors = [
        "#18181B",
        "#1877F2",
        "#E07A5F",
        "#34D399",
        "#F59E0B",
        "#A78BFA",
      ];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = r * 3 + c;
          const x = 10 + c * 80;
          const y = 10 + r * 64;
          ctx.fillStyle = "#233044";
          ctx.fillRect(x, y, 72, 54);
          ctx.fillStyle = colors[idx];
          ctx.fillRect(x + 6, y + 6, 60, 24);
          const pulseW = 24 + Math.abs(Math.sin(t * 2 + idx)) * 34;
          ctx.fillStyle = "#E2E8F0";
          ctx.fillRect(x + 6, y + 38, pulseW, 6);
        }
      }
    } else if (mode === "code") {
      const codeColors = ["#A78BFA", "#38BDF8", "#34D399", "#F59E0B", "#E2E8F0"];
      const scrollOffset = Math.floor(t * 2.5) % 8;
      for (let row = 0; row < 9; row++) {
        const lineIdx = (row + scrollOffset) % 12;
        const indent = (lineIdx % 3) * 16;
        ctx.fillStyle = codeColors[lineIdx % codeColors.length];
        ctx.fillRect(14 + indent, 12 + row * 14, 48 + ((lineIdx * 23) % 110), 7);
      }
      // Blinking cursor
      if (Math.floor(t * 3) % 2 === 0) {
        ctx.fillStyle = "#34D399";
        ctx.fillRect(14, 126, 8, 10);
      }
    } else if (mode === "network") {
      const nodes = [
        [44, 42],
        [128, 30],
        [212, 46],
        [72, 108],
        [176, 108],
      ];
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      const edges = [
        [0, 1],
        [1, 2],
        [0, 3],
        [1, 3],
        [1, 4],
        [2, 4],
        [3, 4],
      ];
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a][0], nodes[a][1]);
        ctx.lineTo(nodes[b][0], nodes[b][1]);
        ctx.stroke();
      });

      // Moving packet pulse along active edge
      const activeEdge = edges[Math.floor(t * 1.5) % edges.length];
      const frac = (t * 1.5) % 1;
      const px =
        nodes[activeEdge[0]][0] +
        (nodes[activeEdge[1]][0] - nodes[activeEdge[0]][0]) * frac;
      const py =
        nodes[activeEdge[0]][1] +
        (nodes[activeEdge[1]][1] - nodes[activeEdge[0]][1]) * frac;
      ctx.fillStyle = "#34D399";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      nodes.forEach(([nx, ny], i) => {
        ctx.fillStyle = i === 1 ? "#A78BFA" : "#38BDF8";
        ctx.beginPath();
        ctx.arc(nx, ny, 10, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    texture.needsUpdate = true;
  });

  return texture;
}
