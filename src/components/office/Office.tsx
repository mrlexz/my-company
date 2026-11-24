"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useGraphicsSettings } from "@/hooks/useGraphicsSettings";
import { useOfficeData } from "@/hooks/useOfficeData";
import { INTRO_CAMERA_POSITION } from "@/lib/officeLayout";
import { getStatusTone } from "@/lib/statusTone";
import { useOfficeStore } from "@/store/useOfficeStore";
import { CharacterInspectorCard } from "./CharacterInspectorCard";
import { DebugLifePanel } from "./DebugLifePanel";
import { IntroOverlay } from "./IntroOverlay";
import { OfficeScene } from "./OfficeScene";
import { RoomDetailCard } from "./RoomDetailCard";
import { StatusBoard } from "./StatusBoard";

export function Office() {
  const { companyName, departments, totalMembers, getDepartmentById } =
    useOfficeData();
  const { enableSSAO, isTabVisible } = useGraphicsSettings();

  const hasEnteredOffice = useOfficeStore((s) => s.hasEnteredOffice);
  const selectedDepartmentId = useOfficeStore((s) => s.selectedDepartmentId);
  const selectedMemberId = useOfficeStore((s) => s.selectedMemberId);
  const isWorkflowRunning = useOfficeStore((s) => s.isWorkflowRunning);
  const isStatusBoardOpen = useOfficeStore((s) => s.isStatusBoardOpen);
  const postProcessingEnabled = useOfficeStore((s) => s.postProcessingEnabled);
  const debugFacing = useOfficeStore((s) => s.debugFacing);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  const clearSelection = useOfficeStore((s) => s.clearSelection);
  const setSelectedMember = useOfficeStore((s) => s.setSelectedMember);
  const setStatusBoardOpen = useOfficeStore((s) => s.setStatusBoardOpen);
  const togglePostProcessing = useOfficeStore((s) => s.togglePostProcessing);
  const toggleDebugFacing = useOfficeStore((s) => s.toggleDebugFacing);

  const selectedDepartment = selectedDepartmentId
    ? getDepartmentById(selectedDepartmentId)
    : undefined;

  // Số việc đang chờ duyệt (badge trên nút bảng trạng thái).
  const waitingCount = useMemo(
    () =>
      departments.reduce(
        (n, dept) =>
          n +
          dept.members.filter(
            (member) => getStatusTone(member.status).key === "waiting",
          ).length,
        0,
      ),
    [departments],
  );

  // Bảng trạng thái tự đóng khi bấm nhân vật, chọn phòng hoặc chạy workflow
  // để khỏi chồng lên thẻ nhân vật / thẻ phòng.
  useEffect(() => {
    if (
      isStatusBoardOpen &&
      (selectedMemberId !== null ||
        selectedDepartmentId !== null ||
        isWorkflowRunning)
    ) {
      setStatusBoardOpen(false);
    }
  }, [
    isStatusBoardOpen,
    selectedMemberId,
    selectedDepartmentId,
    isWorkflowRunning,
    setStatusBoardOpen,
  ]);

  // Keyboard shortcuts: Esc to return to overview, D to toggle Debug Facing arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "Escape" && selectedDepartmentId !== null) {
        clearSelection();
      } else if (!isTyping && (e.key === "d" || e.key === "D")) {
        toggleDebugFacing();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDepartmentId, clearSelection, toggleDebugFacing]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-[#DCECF6] via-[#EFEAE0] to-[#F5EFE0]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={isTabVisible ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.04,
        }}
        camera={{
          position: INTRO_CAMERA_POSITION,
          fov: 38,
          near: 0.1,
          far: 120,
        }}
        onPointerMissed={() => {
          if (
            hasEnteredOffice &&
            !isWorkflowRunning &&
            selectedDepartmentId !== null
          ) {
            clearSelection();
          }
        }}
      >
        <OfficeScene enableSSAO={enableSSAO} />
      </Canvas>

      {/* Intro Overlay with Framer Motion */}
      <IntroOverlay />

      {/* Main Office HUD + Command Bar (fades in after leaving intro) */}
      {hasEnteredOffice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Top-Left Company Header + Compact Interactive Department Legend */}
          <header className="pointer-events-none fixed left-5 top-5 z-20 flex flex-col items-start gap-2.5">
            <div className="pointer-events-auto inline-flex flex-wrap items-center gap-3 rounded-2xl border border-[#DFD6BE] bg-[#FCF9F2]/90 px-4 py-2.5 shadow-sm backdrop-blur-sm">
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[#2A251D]">
                  {companyName}
                </h1>
                <p className="text-xs text-[#6B6253]">
                  {departments.length} phòng ban • {totalMembers} nhân sự
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/characters"
                  className="rounded-xl border border-[#DFD6BE] bg-[#F5EFE0] px-2.5 py-1.5 text-[11px] font-bold text-[#3F5B2F] transition-colors hover:bg-[#EAE0CA]"
                >
                  Nhân vật →
                </Link>
                <Link
                  href="/rooms"
                  className="rounded-xl border border-[#DFD6BE] bg-[#F5EFE0] px-2.5 py-1.5 text-[11px] font-bold text-[#5C5343] transition-colors hover:bg-[#EAE0CA]"
                >
                  4 Phòng →
                </Link>
              </div>
            </div>

            <aside className="hidden flex-col gap-1.5 sm:flex">
              {departments.map((dept) => {
                const isSelected = selectedDepartmentId === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    disabled={isWorkflowRunning}
                    onClick={() =>
                      isSelected ? clearSelection() : selectDepartment(dept.id)
                    }
                    className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-xl border bg-[#FCF9F2]/88 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm transition-all hover:bg-[#FCF9F2] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      borderColor: isSelected ? dept.color : "#DFD6BE",
                      boxShadow: isSelected
                        ? `0 0 0 1px ${dept.color}`
                        : undefined,
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="font-semibold text-[#2A251D]">
                      {dept.name}
                    </span>
                  </button>
                );
              })}
            </aside>
          </header>

          {/* Top-Right Scene Controls (Postprocessing toggle, Back to Overview) */}
          <div className="fixed right-5 top-5 z-20 flex flex-wrap items-center justify-end gap-2">
            {selectedDepartment && !isWorkflowRunning && (
              <button
                type="button"
                onClick={clearSelection}
                className="cursor-pointer rounded-xl border border-[#DFD6BE] bg-[#FCF9F2]/95 px-3.5 py-2 text-xs font-semibold text-[#2A251D] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#F0E7D4]"
              >
                ← Tổng quan (Esc)
              </button>
            )}

            <button
              type="button"
              disabled={isWorkflowRunning}
              onClick={() => {
                if (!isStatusBoardOpen) setSelectedMember(null);
                setStatusBoardOpen(!isStatusBoardOpen);
              }}
              className={`relative cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isStatusBoardOpen
                  ? "border-[#3F5B2F] bg-[#3F5B2F] text-[#FCF9F2]"
                  : "border-[#DFD6BE] bg-[#FCF9F2]/90 text-[#5C5343] hover:bg-[#FCF9F2]"
              }`}
              title="Xem trạng thái công việc của cả 10 người"
            >
              Trạng thái công việc
              {waitingCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D97706] px-1 text-[10px] font-extrabold text-white shadow">
                  {waitingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleDebugFacing}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-sm transition-colors ${
                debugFacing
                  ? "border-[#059669] bg-[#059669] text-[#FCF9F2]"
                  : "border-[#DFD6BE] bg-[#FCF9F2]/90 text-[#5C5343] hover:bg-[#FCF9F2]"
              }`}
              title="Phím D: hiện mũi tên hướng nhìn và điểm đến"
            >
              Hướng (D): {debugFacing ? "BẬT" : "TẮT"}
            </button>

            <button
              type="button"
              onClick={togglePostProcessing}
              className={`hidden cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-sm transition-colors sm:block ${
                postProcessingEnabled
                  ? "border-[#3F5B2F] bg-[#3F5B2F] text-[#FCF9F2]"
                  : "border-[#DFD6BE] bg-[#FCF9F2]/90 text-[#5C5343] hover:bg-[#FCF9F2]"
              }`}
            >
              Hậu kỳ: {postProcessingEnabled ? "BẬT" : "TẮT"}
            </button>
          </div>

          {/* Interactive Character Inspector Card (click a character) */}
          <CharacterInspectorCard />

          {/* Work Status Board: overview of all 10 members' live statuses */}
          <StatusBoard />

          {/* Debug AI & A* Grid Panel (Phím D) */}
          <DebugLifePanel />

          {/* Slide-Up Room Detail Card when a room is selected */}
          <RoomDetailCard />
        </motion.div>
      )}
    </div>
  );
}
