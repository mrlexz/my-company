import rawOfficeData from "@/data/office.json";
import type { CharacterState, DepartmentId, OfficeData } from "@/types/office";

export type Vec3 = [number, number, number];

export interface MemberSeat {
  position: Vec3;
  deskPosition: Vec3;
  rotationY: number;
  lookAt: Vec3;
  defaultState: CharacterState;
  departmentId: DepartmentId;
}

const officeData = rawOfficeData as unknown as OfficeData;

/**
 * Distinct walking speeds by character personality (units / sec).
 */
export const CHARACTER_WALK_SPEEDS: Record<string, number> = {
  emma: 3.15, // Brisk, energetic coordinator
  lex: 2.3, // Composed executive stride
  alien: 2.45, // Smooth hovering glide
  "8bit-video": 2.55,
  threads: 2.75,
  "8bit-fb": 2.6,
  "it-lead": 2.4,
  automation: 2.65,
  data: 1.9, // Unhurried, thoughtful pace
  dev: 2.35,
};

export function getCharacterWalkSpeed(id: string): number {
  return CHARACTER_WALK_SPEEDS[id] ?? 2.45;
}

/**
 * Dynamically derived desk seats from `office.json` workstations (single-story y = 0).
 */
export const MEMBER_SEATS: Record<string, MemberSeat> = (() => {
  const map: Record<string, MemberSeat> = {};
  for (const dept of officeData.departments) {
    for (const ws of dept.workstations) {
      map[ws.memberId] = {
        position: [ws.chair[0], 0, ws.chair[1]],
        deskPosition: [ws.desk[0], 0, ws.desk[1]],
        rotationY: ws.facing,
        lookAt: [ws.lookAt[0], 0.85, ws.lookAt[1]],
        defaultState: "working",
        departmentId: dept.id,
      };
    }
  }
  return map;
})();

/**
 * Standing spots inside each room near the doorway for visiting characters.
 */
export const ROOM_VISIT_POINTS: Record<DepartmentId, Vec3> = {
  executive: [-2.3, 0, -5],
  content: [2.3, 0, -5],
  it: [-2.3, 0, 5],
  marketing: [2.3, 0, 5],
};

/** Meeting spots around the central lobby round table [0, 0.2] */
export const LOBBY_MEETING_SPOTS: Vec3[] = [
  [-1.05, 0, 0.2],
  [1.05, 0, 0.2],
  [0, 0, 1.25],
  [0, 0, -0.85],
];

/** Standing spots near the lobby coffee corner [0, -6.5] */
export const LOBBY_COFFEE_SPOTS: Vec3[] = [
  [-0.55, 0, -5.65],
  [0.55, 0, -5.65],
  [0.0, 0, -5.45],
];

/** Casual lobby chat & wander spots */
export const LOBBY_CHAT_SPOTS: Vec3[] = [
  [-0.65, 0, -1.7],
  [0.65, 0, -1.7],
  [-0.65, 0, 2.1],
  [0.65, 0, 2.1],
  [-0.65, 0, 4.2],
  [0.65, 0, 4.2],
  [-0.65, 0, 6.3],
  [0.65, 0, 6.3],
];

const grid = officeData.lobby.grid;

function worldToGrid(x: number, z: number): [number, number] {
  const col = Math.max(
    0,
    Math.min(grid.cols - 1, Math.floor((x - grid.origin[0]) / grid.cellSize))
  );
  const row = Math.max(
    0,
    Math.min(grid.rows - 1, Math.floor((z - grid.origin[1]) / grid.cellSize))
  );
  return [col, row];
}

function gridToWorld(col: number, row: number): Vec3 {
  return [
    grid.origin[0] + (col + 0.5) * grid.cellSize,
    0,
    grid.origin[1] + (row + 0.5) * grid.cellSize,
  ];
}

function isWalkableCell(col: number, row: number): boolean {
  if (col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return false;
  return grid.walkable[row]?.[col] === 1;
}

/** Finds nearest walkable cell if a chair/destination lies on a furniture cell */
function findNearestWalkableCell(col: number, row: number): [number, number] {
  if (isWalkableCell(col, row)) return [col, row];
  for (let r = 1; r <= 4; r++) {
    for (let dr = -r; dr <= r; dr++) {
      for (let dc = -r; dc <= r; dc++) {
        if (Math.abs(dr) !== r && Math.abs(dc) !== r) continue;
        if (isWalkableCell(col + dc, row + dr)) {
          return [col + dc, row + dr];
        }
      }
    }
  }
  return [col, row];
}

/** Returns all walkable world points for wander/debug */
export function getWalkableWorldPoints(): Vec3[] {
  const pts: Vec3[] = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (isWalkableCell(c, r)) {
        pts.push(gridToWorld(c, r));
      }
    }
  }
  return pts;
}

function isNear(a: Vec3, b: Vec3): boolean {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return dx * dx + dz * dz < 0.04;
}

/**
 * A* pathfinding on the `office.json` lobby.grid (14x12), avoiding walls, desks, and furniture,
 * routing cleanly through room doors and the central cross lobby.
 */
export function computeCharacterPath(
  from: Vec3,
  to: Vec3,
  blockedWorldPoints: Vec3[] = []
): Vec3[] {
  if (isNear(from, to)) return [];

  const [startColRaw, startRowRaw] = worldToGrid(from[0], from[2]);
  const [goalColRaw, goalRowRaw] = worldToGrid(to[0], to[2]);

  const [startCol, startRow] = findNearestWalkableCell(startColRaw, startRowRaw);
  const [goalCol, goalRow] = findNearestWalkableCell(goalColRaw, goalRowRaw);

  const dynamicBlocked = new Set<string>();
  for (const bp of blockedWorldPoints) {
    const [bc, br] = worldToGrid(bp[0], bp[2]);
    if (
      !(bc === startCol && br === startRow) &&
      !(bc === goalCol && br === goalRow)
    ) {
      dynamicBlocked.add(`${bc},${br}`);
    }
  }

  const key = (c: number, r: number) => `${c},${r}`;
  const heuristic = (c: number, r: number) =>
    Math.hypot(goalCol - c, goalRow - r);

  const openSet = new Set<string>([key(startCol, startRow)]);
  const cameFrom = new Map<string, [number, number]>();
  const gScore = new Map<string, number>([[key(startCol, startRow), 0]]);
  const fScore = new Map<string, number>([
    [key(startCol, startRow), heuristic(startCol, startRow)],
  ]);

  const dirs: Array<[number, number, number]> = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, 1.414],
    [-1, 1, 1.414],
    [1, -1, 1.414],
    [-1, -1, 1.414],
  ];

  let found = false;

  while (openSet.size > 0) {
    let currentKey = "";
    let bestF = Infinity;
    for (const k of openSet) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentKey = k;
      }
    }

    const [cc, cr] = currentKey.split(",").map(Number);
    if (cc === goalCol && cr === goalRow) {
      found = true;
      break;
    }

    openSet.delete(currentKey);
    const currentG = gScore.get(currentKey) ?? Infinity;

    for (const [dc, dr, cost] of dirs) {
      const nc = cc + dc;
      const nr = cr + dr;
      if (!isWalkableCell(nc, nr)) continue;

      // Prevent diagonal corner cutting through blocked cells
      if (dc !== 0 && dr !== 0) {
        if (!isWalkableCell(cc + dc, cr) || !isWalkableCell(cc, cr + dr)) {
          continue;
        }
      }

      const nk = key(nc, nr);
      const extraCost = dynamicBlocked.has(nk) ? 5 : 0;
      const tentativeG = currentG + cost + extraCost;

      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, [cc, cr]);
        gScore.set(nk, tentativeG);
        fScore.set(nk, tentativeG + heuristic(nc, nr));
        openSet.add(nk);
      }
    }
  }

  const rawPoints: Vec3[] = [];

  if (found) {
    const gridChain: Array<[number, number]> = [];
    let cur: [number, number] | undefined = [goalCol, goalRow];
    while (cur) {
      gridChain.push(cur);
      cur = cameFrom.get(key(cur[0], cur[1]));
    }
    gridChain.reverse();

    // Skip collinear intermediate grid cells for cleaner CatmullRomCurve3 splines
    for (let i = 0; i < gridChain.length; i++) {
      if (i > 0 && i < gridChain.length - 1) {
        const prev = gridChain[i - 1];
        const curr = gridChain[i];
        const next = gridChain[i + 1];
        const dx1 = curr[0] - prev[0];
        const dy1 = curr[1] - prev[1];
        const dx2 = next[0] - curr[0];
        const dy2 = next[1] - curr[1];
        if (dx1 === dx2 && dy1 === dy2) continue;
      }
      rawPoints.push(gridToWorld(gridChain[i][0], gridChain[i][1]));
    }
  }

  rawPoints.push([to[0], 0, to[2]]);

  // Deduplicate very close consecutive points
  const cleaned: Vec3[] = [];
  let prev = from;
  for (const pt of rawPoints) {
    if (!isNear(prev, pt)) {
      cleaned.push(pt);
      prev = pt;
    }
  }
  return cleaned;
}
