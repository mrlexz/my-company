import { create } from "zustand";
import type { CharacterLifeSnapshot, DepartmentId } from "@/types/office";

export interface CharacterActionCommand {
  type: "callToLobby" | "hurry";
  memberId: string;
  nonce: number;
}

interface OfficeStoreState {
  hasEnteredOffice: boolean;
  selectedDepartmentId: DepartmentId | null;
  hoveredDepartmentId: DepartmentId | null;
  selectedMemberId: string | null;
  hoveredMemberId: string | null;

  // Building, visual & debug toggles
  showRoof: boolean;
  postProcessingEnabled: boolean;
  debugFacing: boolean;

  // Autonomous Office Life snapshots & commands
  lifeSnapshots: Record<string, CharacterLifeSnapshot>;
  characterAction: CharacterActionCommand | null;

  // Workflow simulation state
  isWorkflowRunning: boolean;
  workflowStepIndex: number;
  workflowCommand: string;

  enterOffice: () => void;
  selectDepartment: (id: DepartmentId) => void;
  clearSelection: () => void;
  setHoveredDepartment: (id: DepartmentId | null) => void;
  setSelectedMember: (id: string | null) => void;
  setHoveredMember: (id: string | null) => void;
  toggleRoof: () => void;
  togglePostProcessing: () => void;
  toggleDebugFacing: () => void;

  setLifeSnapshots: (snapshots: Record<string, CharacterLifeSnapshot>) => void;
  triggerCallToLobby: (memberId: string) => void;
  triggerHurry: (memberId: string) => void;

  startWorkflow: (command: string) => void;
  setWorkflowStepIndex: (index: number) => void;
  finishWorkflow: () => void;
  skipWorkflow: () => void;
}

export const useOfficeStore = create<OfficeStoreState>((set) => ({
  hasEnteredOffice: false,
  selectedDepartmentId: null,
  hoveredDepartmentId: null,
  selectedMemberId: null,
  hoveredMemberId: null,

  showRoof: false,
  postProcessingEnabled: true,
  debugFacing: false,

  lifeSnapshots: {},
  characterAction: null,

  isWorkflowRunning: false,
  workflowStepIndex: -1,
  workflowCommand: "",

  enterOffice: () => set({ hasEnteredOffice: true }),
  selectDepartment: (id) =>
    set({ selectedDepartmentId: id, selectedMemberId: null }),
  clearSelection: () =>
    set({ selectedDepartmentId: null, selectedMemberId: null }),
  setHoveredDepartment: (id) => set({ hoveredDepartmentId: id }),
  setSelectedMember: (id) =>
    set({ selectedMemberId: id, selectedDepartmentId: null }),
  setHoveredMember: (id) => set({ hoveredMemberId: id }),
  toggleRoof: () => set((s) => ({ showRoof: !s.showRoof })),
  togglePostProcessing: () =>
    set((s) => ({ postProcessingEnabled: !s.postProcessingEnabled })),
  toggleDebugFacing: () => set((s) => ({ debugFacing: !s.debugFacing })),

  setLifeSnapshots: (snapshots) => set({ lifeSnapshots: snapshots }),
  triggerCallToLobby: (memberId) =>
    set({
      characterAction: { type: "callToLobby", memberId, nonce: Date.now() },
    }),
  triggerHurry: (memberId) =>
    set({
      characterAction: { type: "hurry", memberId, nonce: Date.now() },
    }),

  startWorkflow: (command) =>
    set({
      selectedDepartmentId: null,
      selectedMemberId: null,
      isWorkflowRunning: true,
      workflowStepIndex: 0,
      workflowCommand: command,
    }),
  setWorkflowStepIndex: (index) => set({ workflowStepIndex: index }),
  finishWorkflow: () =>
    set({
      isWorkflowRunning: false,
      workflowStepIndex: -1,
    }),
  skipWorkflow: () =>
    set({
      isWorkflowRunning: false,
      workflowStepIndex: -1,
    }),
}));
