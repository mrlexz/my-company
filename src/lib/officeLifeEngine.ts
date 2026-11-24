import rawDialogues from "@/data/dialogues.json";
import rawRelations from "@/data/relations.json";
import { characterRegistry } from "@/lib/facingUtils";
import {
  computeCharacterPath,
  LOBBY_CHAT_SPOTS,
  LOBBY_COFFEE_SPOTS,
  LOBBY_MEETING_SPOTS,
  MEMBER_SEATS,
  ROOM_VISIT_POINTS,
  type Vec3,
} from "@/lib/officePathfinding";
import type {
  CharacterLifeSnapshot,
  CharacterState,
  LifeActivity,
  SpeechGesture,
} from "@/types/office";

interface RelationEdge {
  from: string;
  to: string;
  weight: number;
  topic: string;
}

interface DialogueTurn {
  speaker: string;
  text: string;
  gesture: SpeechGesture;
}

interface DialogueBank {
  pairs: Record<string, DialogueTurn[][]>;
  lobbyChat: DialogueTurn[][];
}

const relations = (rawRelations as { relations: RelationEdge[] }).relations;
const dialogues = rawDialogues as DialogueBank;

const MAX_CONCURRENT_WALKERS = 3;
const MAX_ACTIVE_CONVERSATIONS = 2;

const WORK_DESCRIPTIONS: Record<string, string> = {
  lex: "đang duyệt kế hoạch chiến lược",
  emma: "đang điều phối công việc các phòng",
  alien: "đang viết kịch bản video",
  "8bit-video": "đang dựng và cắt ghép video",
  threads: "đang lên bài & tương tác Threads",
  "8bit-fb": "đang chạy chiến dịch Facebook",
  "it-lead": "đang phân việc & review kiến trúc",
  automation: "đang thiết lập quy trình tự động",
  data: "đang tổng hợp số liệu & báo cáo",
  dev: "đang lập trình công cụ nội bộ",
};

interface ActiveConversation {
  id: string;
  participants: [string, string];
  turns: DialogueTurn[];
  currentTurnIndex: number;
  turnTimer: number;
}

interface InternalAgent {
  id: string;
  activity: LifeActivity;
  activityLabel: string;
  state: CharacterState;
  gesture: SpeechGesture;
  timer: number;
  targetPosition: Vec3 | null;
  path: Vec3[];
  talkPartnerId: string | null;
  speechText: string | null;
  hurryTimer: number;
  isYielding: boolean;
  yieldTimer: number;
  conversationId: string | null;
  pendingVisitPartner: string | null;
}

function pickWeighted<T>(items: Array<{ item: T; weight: number }>): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = Math.random() * total;
  for (const entry of items) {
    r -= entry.weight;
    if (r <= 0) return entry.item;
  }
  return items[items.length - 1].item;
}

function pickPairDialogue(a: string, b: string): DialogueTurn[] {
  const key1 = `${a}|${b}`;
  const key2 = `${b}|${a}`;
  const bank = dialogues.pairs[key1] ?? dialogues.pairs[key2];
  if (bank && bank.length > 0) {
    return bank[Math.floor(Math.random() * bank.length)];
  }
  // Fallback to fun lobby banter mapped to actual speaker IDs
  const template =
    dialogues.lobbyChat[Math.floor(Math.random() * dialogues.lobbyChat.length)];
  return template.map((turn) => ({
    ...turn,
    speaker: turn.speaker === "a" ? a : b,
  }));
}

/**
 * Centralized Office Life Simulation Engine (ticked at 10Hz from a single useFrame).
 */
export class OfficeLifeEngine {
  private agents = new Map<string, InternalAgent>();
  private conversations = new Map<string, ActiveConversation>();
  private paused = false;
  private version = 0;

  constructor(memberIds: string[]) {
    for (const id of memberIds) {
      this.agents.set(id, {
        id,
        activity: "working",
        activityLabel: WORK_DESCRIPTIONS[id] ?? "đang làm việc",
        state: "working",
        gesture: "none",
        // Stagger initial timers so characters don't all stand up at once
        timer: 3 + Math.random() * 10,
        targetPosition: null,
        path: [],
        talkPartnerId: null,
        speechText: null,
        hurryTimer: 0,
        isYielding: false,
        yieldTimer: 0,
        conversationId: null,
        pendingVisitPartner: null,
      });
    }
  }

  public setPaused(paused: boolean) {
    if (this.paused === paused) return;
    this.paused = paused;
    if (paused) {
      this.conversations.clear();
      this.agents.forEach((a) => {
        a.speechText = null;
        a.talkPartnerId = null;
        a.conversationId = null;
        a.pendingVisitPartner = null;
        a.gesture = "none";
      });
    } else {
      // Staggered resume after workflow ends so characters don't move simultaneously
      this.agents.forEach((a) => {
        const seat = MEMBER_SEATS[a.id];
        a.activity = "working";
        a.activityLabel = WORK_DESCRIPTIONS[a.id] ?? "đang làm việc";
        a.state = "working";
        a.targetPosition = seat ? [...seat.position] : null;
        a.timer = 2.5 + Math.random() * 8.5;
      });
    }
    this.version++;
  }

  public callToLobby(memberId: string) {
    const agent = this.agents.get(memberId);
    if (!agent) return;
    this.endAgentConversation(agent);
    const spot =
      LOBBY_MEETING_SPOTS[
        Math.floor(Math.random() * LOBBY_MEETING_SPOTS.length)
      ];
    this.dispatchWalk(agent, spot, "meeting", "được gọi ra bàn tròn sảnh", 10);
    this.version++;
  }

  public hurryCharacter(memberId: string) {
    const agent = this.agents.get(memberId);
    if (!agent) return;
    agent.hurryTimer = 8.0;
    agent.speechText = "Rõ, mình đi ngay đây!";
    agent.gesture = "wave";
    this.version++;
  }

  public notifyArrived(memberId: string) {
    const agent = this.agents.get(memberId);
    if (!agent) return;

    agent.path = [];
    agent.isYielding = false;
    agent.yieldTimer = 0;

    if (agent.activity === "working") {
      agent.state = "working";
      agent.activityLabel = WORK_DESCRIPTIONS[memberId] ?? "đang làm việc";
    } else if (agent.activity === "visit" && agent.pendingVisitPartner) {
      const partner = this.agents.get(agent.pendingVisitPartner);
      agent.pendingVisitPartner = null;
      agent.state = "idle";
      if (partner && !partner.conversationId && partner.state !== "walking") {
        this.startConversation(agent, partner);
      }
    } else if (agent.activity === "coffee") {
      agent.state = "idle";
      agent.activityLabel = "đang pha & thưởng thức cà phê";
      // Greet anyone else currently at the coffee corner
      const nearby = this.findNearbyFreeAgent(agent.id, 2.2);
      if (nearby) this.startConversation(agent, nearby);
    } else if (agent.activity === "meeting") {
      agent.state = "idle";
      agent.activityLabel = "đang họp nhanh tại bàn tròn";
      const nearby = this.findNearbyFreeAgent(agent.id, 2.6);
      if (nearby) this.startConversation(agent, nearby);
    } else if (agent.activity === "chat") {
      agent.state = "idle";
      agent.activityLabel = "đang trò chuyện ở sảnh";
      const nearby = this.findNearbyFreeAgent(agent.id, 2.4);
      if (nearby) this.startConversation(agent, nearby);
    } else {
      agent.state = "idle";
    }
    this.version++;
  }

  private countWalkers(): number {
    let count = 0;
    this.agents.forEach((a) => {
      if (a.state === "walking") count++;
    });
    return count;
  }

  private getCurrentPos(id: string): Vec3 {
    const reg = characterRegistry.get(id);
    if (reg) return [reg.position.x, 0, reg.position.z];
    return MEMBER_SEATS[id]?.position ?? [0, 0, 0];
  }

  private findNearbyFreeAgent(
    id: string,
    maxDist: number
  ): InternalAgent | null {
    const pos = this.getCurrentPos(id);
    for (const other of this.agents.values()) {
      if (
        other.id === id ||
        other.state === "walking" ||
        other.conversationId
      ) {
        continue;
      }
      const oPos = this.getCurrentPos(other.id);
      if (Math.hypot(pos[0] - oPos[0], pos[2] - oPos[2]) <= maxDist) {
        return other;
      }
    }
    return null;
  }

  private dispatchWalk(
    agent: InternalAgent,
    dest: Vec3,
    activity: LifeActivity,
    label: string,
    durationSec: number
  ) {
    const from = this.getCurrentPos(agent.id);
    const path = computeCharacterPath(from, dest);
    agent.activity = activity;
    agent.activityLabel = label;
    agent.timer = durationSec;
    agent.targetPosition = [...dest];
    agent.path = path;
    agent.state = path.length > 0 ? "walking" : activity === "working" ? "working" : "idle";
  }

  private startConversation(a: InternalAgent, b: InternalAgent) {
    if (this.conversations.size >= MAX_ACTIVE_CONVERSATIONS) return;
    if (a.conversationId || b.conversationId) return;

    const convId = `${a.id}-${b.id}-${Date.now()}`;
    const turns = pickPairDialogue(a.id, b.id);
    const conv: ActiveConversation = {
      id: convId,
      participants: [a.id, b.id],
      turns,
      currentTurnIndex: 0,
      turnTimer: 3.0,
    };

    this.conversations.set(convId, conv);
    a.conversationId = convId;
    b.conversationId = convId;
    a.talkPartnerId = b.id;
    b.talkPartnerId = a.id;
    a.timer = Math.max(a.timer, turns.length * 3.0 + 1);
    b.timer = Math.max(b.timer, turns.length * 3.0 + 1);

    this.applyConversationTurn(conv);
  }

  private applyConversationTurn(conv: ActiveConversation) {
    const [idA, idB] = conv.participants;
    const agentA = this.agents.get(idA);
    const agentB = this.agents.get(idB);
    const turn = conv.turns[conv.currentTurnIndex];
    if (!agentA || !agentB || !turn) return;

    const isASpeaker = turn.speaker === idA;
    agentA.speechText = isASpeaker ? turn.text : null;
    agentB.speechText = !isASpeaker ? turn.text : null;
    agentA.gesture = isASpeaker ? turn.gesture : "nod";
    agentB.gesture = !isASpeaker ? turn.gesture : "nod";
  }

  private endAgentConversation(agent: InternalAgent) {
    if (!agent.conversationId) return;
    const conv = this.conversations.get(agent.conversationId);
    if (conv) {
      for (const pid of conv.participants) {
        const p = this.agents.get(pid);
        if (p) {
          p.conversationId = null;
          p.talkPartnerId = null;
          p.speechText = null;
          p.gesture = "none";
        }
      }
      this.conversations.delete(conv.id);
    }
  }

  private pickNextActivity(agent: InternalAgent) {
    this.endAgentConversation(agent);
    agent.pendingVisitPartner = null;

    const walkers = this.countWalkers();
    const canWalk = walkers < MAX_CONCURRENT_WALKERS;

    // Weighted activity selection (~55% working)
    const nextActivity: LifeActivity = !canWalk
      ? "working"
      : pickWeighted<LifeActivity>([
          { item: "working", weight: 55 },
          { item: "wander", weight: 11 },
          { item: "coffee", weight: 10 },
          { item: "visit", weight: 10 },
          { item: "meeting", weight: 7 },
          { item: "chat", weight: 7 },
        ]);

    if (nextActivity === "working") {
      const seat = MEMBER_SEATS[agent.id];
      if (seat) {
        this.dispatchWalk(
          agent,
          seat.position,
          "working",
          WORK_DESCRIPTIONS[agent.id] ?? "đang làm việc",
          9 + Math.random() * 8
        );
      }
      return;
    }

    if (nextActivity === "coffee") {
      const spot =
        LOBBY_COFFEE_SPOTS[
          Math.floor(Math.random() * LOBBY_COFFEE_SPOTS.length)
        ];
      this.dispatchWalk(
        agent,
        spot,
        "coffee",
        "đi ra góc cà phê",
        7 + Math.random() * 5
      );
      return;
    }

    if (nextActivity === "meeting") {
      const spot =
        LOBBY_MEETING_SPOTS[
          Math.floor(Math.random() * LOBBY_MEETING_SPOTS.length)
        ];
      this.dispatchWalk(
        agent,
        spot,
        "meeting",
        "ra bàn tròn họp nhanh",
        9 + Math.random() * 5
      );
      return;
    }

    if (nextActivity === "chat") {
      const spot =
        LOBBY_CHAT_SPOTS[Math.floor(Math.random() * LOBBY_CHAT_SPOTS.length)];
      this.dispatchWalk(
        agent,
        spot,
        "chat",
        "ra sảnh trò chuyện",
        7 + Math.random() * 5
      );
      return;
    }

    if (nextActivity === "visit") {
      const rels = relations.filter((r) => r.from === agent.id);
      if (rels.length > 0) {
        const chosen = pickWeighted(
          rels.map((r) => ({ item: r, weight: r.weight }))
        );
        const targetSeat = MEMBER_SEATS[chosen.to];
        if (targetSeat) {
          const visitDest = ROOM_VISIT_POINTS[targetSeat.departmentId];
          agent.pendingVisitPartner = chosen.to;
          this.dispatchWalk(
            agent,
            visitDest,
            "visit",
            `sang trao đổi: ${chosen.topic}`,
            9 + Math.random() * 5
          );
          return;
        }
      }
    }

    // Fallback: wander around the central lobby
    const spot =
      LOBBY_CHAT_SPOTS[Math.floor(Math.random() * LOBBY_CHAT_SPOTS.length)];
    this.dispatchWalk(
      agent,
      spot,
      "wander",
      "đang đi dạo thư giãn",
      6 + Math.random() * 4
    );
  }

  /**
   * Single centralized 10Hz update tick. Returns true if snapshots changed for UI.
   */
  public tick(dt: number): boolean {
    if (this.paused) return false;

    const prevVersion = this.version;

    // 1. Update active conversations
    for (const conv of Array.from(this.conversations.values())) {
      conv.turnTimer -= dt;
      if (conv.turnTimer <= 0) {
        conv.currentTurnIndex++;
        if (conv.currentTurnIndex >= conv.turns.length) {
          const first = this.agents.get(conv.participants[0]);
          if (first) this.endAgentConversation(first);
          this.version++;
        } else {
          conv.turnTimer = 2.8 + Math.random() * 0.8;
          this.applyConversationTurn(conv);
          this.version++;
        }
      }
    }

    // 2. Update each agent's timers, hurry boosts & 0.6m personal-space collision yielding
    for (const agent of this.agents.values()) {
      if (agent.hurryTimer > 0) {
        agent.hurryTimer = Math.max(0, agent.hurryTimer - dt);
        if (agent.hurryTimer === 0 && !agent.conversationId) {
          agent.speechText = null;
          agent.gesture = "none";
          this.version++;
        }
      }

      // Collision avoidance: 0.6m personal space check while walking
      if (agent.state === "walking") {
        const myPos = this.getCurrentPos(agent.id);
        let blockedBy: Vec3 | null = null;
        for (const other of this.agents.values()) {
          if (other.id === agent.id) continue;
          const oPos = this.getCurrentPos(other.id);
          const dist = Math.hypot(myPos[0] - oPos[0], myPos[2] - oPos[2]);
          if (dist < 0.6 && agent.id > other.id) {
            blockedBy = oPos;
            break;
          }
        }

        if (blockedBy) {
          if (!agent.isYielding) {
            agent.isYielding = true;
            this.version++;
          }
          agent.yieldTimer += dt;
          // If blocked for > 1.2s, reroute around the obstacle
          if (agent.yieldTimer > 1.2 && agent.targetPosition) {
            agent.path = computeCharacterPath(myPos, agent.targetPosition, [
              blockedBy,
            ]);
            agent.yieldTimer = 0;
            agent.isYielding = false;
            this.version++;
          }
        } else if (agent.isYielding) {
          agent.isYielding = false;
          agent.yieldTimer = 0;
          this.version++;
        }
        continue;
      }

      // Count down activity timer when not walking
      agent.timer -= dt;
      if (agent.timer <= 0) {
        this.pickNextActivity(agent);
        this.version++;
      }
    }

    return this.version !== prevVersion;
  }

  public getSnapshots(): Record<string, CharacterLifeSnapshot> {
    const out: Record<string, CharacterLifeSnapshot> = {};
    this.agents.forEach((a, id) => {
      out[id] = {
        memberId: id,
        activity: a.activity,
        activityLabel: a.activityLabel,
        state: a.state,
        gesture: a.gesture,
        targetPosition: a.targetPosition,
        path: a.path,
        talkPartnerId: a.talkPartnerId,
        speechText: a.speechText,
        speedMultiplier: a.hurryTimer > 0 ? 1.65 : 1.0,
        isYielding: a.isYielding,
      };
    });
    return out;
  }
}
