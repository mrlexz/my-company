export type DepartmentId = "executive" | "content" | "marketing" | "it";

export type CharacterState =
  | "idle"
  | "walking"
  | "working"
  | "celebrating"
  | "handover";

export type LifeActivity =
  | "working"
  | "wander"
  | "coffee"
  | "visit"
  | "meeting"
  | "chat";

export type SpeechGesture =
  | "none"
  | "point"
  | "nod"
  | "tilt"
  | "laugh"
  | "chin"
  | "wave";

export interface CharacterLifeSnapshot {
  memberId: string;
  activity: LifeActivity;
  activityLabel: string;
  state: CharacterState;
  gesture: SpeechGesture;
  targetPosition: [number, number, number] | null;
  path: Array<[number, number, number]>;
  talkPartnerId: string | null;
  speechText: string | null;
  speedMultiplier: number;
  isYielding: boolean;
}

export type BodyShape = "chibi" | "slim" | "sturdy" | "pixel";

export type EyeStyle = "round" | "sharp" | "sleepy" | "sparkle";
export type BrowStyle = "thick" | "thin" | "arched" | "none";
export type MouthStyle = "smile" | "smirk" | "neutral" | "open" | "focus";
export type EmotionType =
  | "idle"
  | "happy"
  | "focused"
  | "surprised"
  | "celebrating";

export type FaceExtra =
  | "pointedEars"
  | "glowAntennae"
  | "shortBeard"
  | "freckles"
  | "beautyMark";

export type HairStyle =
  | "shortSlick"
  | "ponytail"
  | "curly"
  | "bald"
  | "pixelBlock"
  | "pixelSpiky"
  | "bob"
  | "hoodedTop";

export type HeadgearType =
  | "none"
  | "wizardHat"
  | "hood"
  | "headphones"
  | "glasses"
  | "roundGlasses"
  | "antennae"
  | "viewfinder";

export type OutfitTopType =
  | "suit"
  | "knightCoat"
  | "robe"
  | "hoodie"
  | "engineerJacket"
  | "scholarRobe"
  | "astronautTunic"
  | "pixelArmor";

export type CapeType = "none" | "short" | "long";

export type SocketName =
  | "head"
  | "neck"
  | "chest"
  | "backCenter"
  | "leftHand"
  | "rightHand"
  | "belt"
  | "leftFoot"
  | "rightFoot";

export type AccessoryType =
  | "badge"
  | "ring"
  | "gear"
  | "shield"
  | "headsetMic"
  | "cheekBandage"
  | "notebookStrap";

export type PropType =
  | "none"
  | "scroll"
  | "notebook"
  | "quill"
  | "clapperboard"
  | "megaphone"
  | "shoppingBag"
  | "priceSign"
  | "wrench"
  | "blueprint"
  | "bigBook"
  | "miniChart"
  | "laptop"
  | "shieldF"
  | "speechBubbles";

export interface CharacterAccessorySpec {
  type: AccessoryType;
  color: string;
  attach: SocketName;
}

export interface CharacterBlueprint {
  id: string;
  name: string;
  body: {
    height: number;
    headScale: number;
    skinColor: string;
    bodyShape: BodyShape;
  };
  face: {
    eyeStyle: EyeStyle;
    eyeColor: string;
    browStyle: BrowStyle;
    mouthStyle: MouthStyle;
    blush: boolean;
    nose?: boolean;
    extras: FaceExtra[];
  };
  hair: {
    style: HairStyle;
    color: string;
  };
  headgear: {
    type: HeadgearType;
    color: string;
    accentColor: string;
  };
  outfit: {
    top: OutfitTopType;
    topColor: string;
    trim: string;
    cape: CapeType;
    belt: string;
    gloves: string;
    boots: string;
  };
  accessories: CharacterAccessorySpec[];
  prop: {
    type: PropType;
    hand: "left" | "right" | "both";
  };
}

export interface AvatarStyle {
  shirtColor: string;
  accessory: string;
}

export interface OfficeMember {
  id: string;
  name: string;
  role: string;
  desc: string;
  skills: [string, string, string];
  avatarStyle: AvatarStyle;
  character: CharacterBlueprint;
}

export type DoorDirection = "north" | "south" | "east" | "west";

export interface Workstation {
  memberId: string;
  desk: [number, number];
  chair: [number, number];
  facing: number;
  lookAt: [number, number];
}

export interface Department {
  id: DepartmentId;
  zone: DepartmentId;
  name: string;
  color: string;
  position: [number, number];
  rect: [number, number, number, number];
  door: [number, number, DoorDirection];
  shortDesc: string;
  workstations: Workstation[];
  members: OfficeMember[];
}

export interface LobbyGrid {
  cellSize: number;
  origin: [number, number];
  cols: number;
  rows: number;
  walkable: number[][];
}

export interface LobbyData {
  gatherPoints: {
    coffee: [number, number];
    roundTable: [number, number];
    noticeBoard: [number, number];
    plants: Array<[number, number]>;
  };
  grid: LobbyGrid;
}

export interface OfficeData {
  companyName: string;
  lobby: LobbyData;
  departments: Department[];
}

export interface MemberWithDepartment extends OfficeMember {
  departmentId: DepartmentId;
  departmentName: string;
  departmentColor: string;
  zone: DepartmentId;
}

export interface WorkflowSkillTag {
  actorId: string;
  actorName: string;
  skill: string;
}

export interface WorkflowPacketConfig {
  from: string;
  to: string;
}

export interface WorkflowStep {
  id: string;
  from: string | null;
  to: string | null;
  actors: string[];
  caption: string;
  durationMs: number;
  activeDepartment: DepartmentId | null;
  walkingActor?: string | null;
  walkDestination?: DepartmentId | "desk" | null;
  activeSkills?: WorkflowSkillTag[];
  packet?: WorkflowPacketConfig | null;
  isCelebration?: boolean;
}

export interface WorkflowData {
  defaultCommand: string;
  steps: WorkflowStep[];
}
