"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import rawWorkflow from "@/data/workflow.json";
import { useOfficeData } from "@/hooks/useOfficeData";
import { useOfficeStore } from "@/store/useOfficeStore";
import type { Department, DepartmentId, WorkflowData } from "@/types/office";
import { RoomInteriorPreview } from "./RoomInteriorPreview";

const workflowData = rawWorkflow as WorkflowData;

/**
 * Top-down 2x2 single-story schematic around the central cross lobby,
 * highlighting the currently selected department.
 */
function ExteriorBuildingPreview({
  departments,
  selectedId,
}: {
  departments: Department[];
  selectedId: DepartmentId;
}) {
  const getColor = (id: DepartmentId) =>
    departments.find((d) => d.id === id)?.color ?? "#3F5B2F";
  const isSelected = (id: DepartmentId) => id === selectedId;

  const quadrants: Array<{
    id: DepartmentId;
    x: number;
    y: number;
    label: string;
  }> = [
      { id: "executive", x: 76, y: 24, label: "Ban Điều hành" },
      { id: "content", x: 194, y: 24, label: "Phòng Nội dung" },
      { id: "it", x: 76, y: 104, label: "Phòng IT" },
      { id: "marketing", x: 194, y: 104, label: "Marketing" },
    ];

  return (
    <svg
      viewBox="0 0 360 190"
      className="h-full w-full bg-[#EFE7D4]"
      aria-label="Mặt bằng văn phòng một tầng"
    >
      {/* Floating island circle */}
      <ellipse cx="180" cy="96" rx="154" ry="84" fill="#8EB162" opacity="0.55" />

      {/* Rectangular single-story wood floor */}
      <rect
        x="68"
        y="18"
        width="224"
        height="154"
        rx="10"
        fill="#D4AA72"
        stroke="#8F653E"
        strokeWidth="2"
      />

      {/* Cross-shaped central lobby */}
      <rect x="168" y="20" width="24" height="150" fill="#E6D9BE" />
      <rect x="70" y="84" width="220" height="22" fill="#E6D9BE" />
      <circle cx="180" cy="95" r="7" fill="#B8874E" />

      {/* 2x2 Rooms */}
      {quadrants.map((q) => {
        const active = isSelected(q.id);
        const color = getColor(q.id);
        return (
          <g
            key={q.id}
            opacity={active ? 1 : 0.45}
            style={{ transition: "opacity 220ms ease" }}
          >
            <rect
              x={q.x}
              y={q.y}
              width="90"
              height="58"
              rx="6"
              fill={active ? color : "#EFE3CE"}
              fillOpacity={active ? 0.28 : 0.9}
              stroke={active ? color : "#8F653E"}
              strokeWidth={active ? 3 : 1.5}
            />
            <rect
              x={q.x + 12}
              y={q.y + 42}
              width="66"
              height="8"
              rx="3"
              fill={color}
            />
            <text
              x={q.x + 45}
              y={q.y + 30}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill="#2A251D"
            >
              {q.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Executive-only mini hierarchy diagram: Lex -> Emma -> 3 phòng ban */
function ExecutiveOrgDiagram({ departments }: { departments: Department[] }) {
  const lowerDepts = departments.filter((d) => d.id !== "executive");

  return (
    <div className="mt-4 rounded-2xl border border-[#E5DEC9] bg-[#F5EFE0]/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6253]">
        Sơ đồ điều phối
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-lg bg-[#3F5B2F] px-2.5 py-1 font-bold text-[#FCF9F2]">
          Lex
        </span>
        <span className="font-bold text-[#7C715D]">→</span>
        <span className="rounded-lg bg-[#537640] px-2.5 py-1 font-bold text-[#FCF9F2]">
          Emma
        </span>
        <span className="font-bold text-[#7C715D]">→</span>
        <div className="flex flex-wrap gap-1.5">
          {lowerDepts.map((dept) => (
            <span
              key={dept.id}
              className="inline-flex items-center gap-1 rounded-lg border bg-[#FCF9F2] px-2 py-1 text-[11px] font-semibold text-[#2A251D]"
              style={{ borderColor: `${dept.color}66` }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              {dept.name.replace("Phòng ", "")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RoomDetailCard() {
  const { departments, getDepartmentById } = useOfficeData();
  const selectedDepartmentId = useOfficeStore((s) => s.selectedDepartmentId);
  const isWorkflowRunning = useOfficeStore((s) => s.isWorkflowRunning);
  const workflowStepIndex = useOfficeStore((s) => s.workflowStepIndex);
  const clearSelection = useOfficeStore((s) => s.clearSelection);

  const department = selectedDepartmentId
    ? getDepartmentById(selectedDepartmentId)
    : undefined;

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeSkillOverride, setActiveSkillOverride] = useState<string | null>(
    null
  );

  // Select the first member by default when switching rooms
  useEffect(() => {
    if (department && department.members.length > 0) {
      setSelectedMemberId(department.members[0].id);
      setActiveSkillOverride(department.members[0].skills[0] ?? null);
    } else {
      setSelectedMemberId(null);
      setActiveSkillOverride(null);
    }
  }, [department]);

  const selectedMember = department?.members.find(
    (m) => m.id === selectedMemberId
  );

  // Check if a skill is currently running in the active workflow step
  const runningWorkflowStep =
    isWorkflowRunning &&
      workflowStepIndex >= 0 &&
      workflowStepIndex < workflowData.steps.length
      ? workflowData.steps[workflowStepIndex]
      : null;

  const isSkillRunning = (memberId: string, skill: string) => {
    if (runningWorkflowStep?.activeSkills?.length) {
      return runningWorkflowStep.activeSkills.some(
        (s) => s.actorId === memberId && s.skill === skill
      );
    }
    return activeSkillOverride === skill;
  };

  return (
    <AnimatePresence>
      {department && !isWorkflowRunning && (
        <motion.section
          key={department.id}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          aria-label={`Chi tiết ${department.name}`}
          className="fixed inset-x-4 bottom-4 z-30 mx-auto max-h-[84vh] w-auto max-w-4xl overflow-y-auto rounded-3xl border border-[#DFD6BE] bg-[#FCF9F2]/96 p-5 shadow-2xl backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-6"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={clearSelection}
            aria-label="Đóng thẻ chi tiết"
            title="Đóng (Esc)"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DFD6BE] bg-[#F5EFE0] text-sm font-bold text-[#5C5343] transition-colors hover:bg-[#E9DFC8] hover:text-[#2A251D]"
          >
            ✕
          </button>

          {/* Top Row: Two Previews Side by Side ("Bên ngoài" & "Bên trong") */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Exterior View */}
            <div className="relative h-40 overflow-hidden rounded-2xl border border-[#E5DEC9] bg-[#EFE7D4] sm:h-44">
              <ExteriorBuildingPreview
                departments={departments}
                selectedId={department.id}
              />
              <span className="pointer-events-none absolute left-3 top-2.5 rounded-full bg-[#231F18]/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#FAF6EC] backdrop-blur-sm">
                Bên ngoài
              </span>
            </div>

            {/* Interior 3D Mini Canvas */}
            <div className="relative h-40 overflow-hidden rounded-2xl border border-[#E5DEC9] bg-[#F2EAD7] sm:h-44">
              <RoomInteriorPreview department={department} />
              <span className="pointer-events-none absolute left-3 top-2.5 rounded-full bg-[#231F18]/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#FAF6EC] backdrop-blur-sm">
                Bên trong
              </span>
            </div>
          </div>

          {/* Bottom Row: Left (Department Info) & Right (Members + Skill Chips) */}
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Bottom-Left: Room Header, Accent Left Border, ShortDesc & Optional Executive Diagram */}
            <div className="md:col-span-5">
              <span
                className="text-[11px] font-extrabold uppercase tracking-widest"
                style={{ color: department.color }}
              >
                PHÒNG
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#2A251D]">
                {department.name}
              </h2>
              <p
                className="mt-3 border-l-4 pl-3.5 text-sm leading-relaxed text-[#4A4235]"
                style={{ borderColor: department.color }}
              >
                {department.shortDesc}
              </p>

              {department.id === "executive" && (
                <ExecutiveOrgDiagram departments={departments} />
              )}
            </div>

            {/* Bottom-Right: Member List & Interactive Skill Chips */}
            <div className="flex flex-col justify-between md:col-span-7">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6253]">
                    Thành viên ({department.members.length})
                  </h3>
                  <span className="text-[11px] text-[#8E8472]">
                    Chọn thành viên để xem kỹ năng
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {department.members.map((member) => {
                    const isPicked = selectedMemberId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setActiveSkillOverride(member.skills[0] ?? null);
                        }}
                        className="flex cursor-pointer items-center gap-3 rounded-2xl border p-2.5 text-left transition-all"
                        style={{
                          backgroundColor: isPicked ? "#FFFFFF" : "#F7F2E6",
                          borderColor: isPicked ? department.color : "#E5DEC9",
                          boxShadow: isPicked
                            ? `0 4px 12px -4px ${department.color}40`
                            : undefined,
                        }}
                      >
                        {/* Circular Avatar */}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-inner"
                          style={{
                            backgroundColor: member.avatarStyle.shirtColor,
                          }}
                        >
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-[#2A251D]">
                            {member.name}
                          </div>
                          <div className="truncate text-xs text-[#6B6253]">
                            {member.role}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Member's Skills as Chips */}
                {selectedMember && (
                  <motion.div
                    key={selectedMember.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3.5 rounded-2xl border border-[#E5DEC9] bg-white p-3.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-[#2A251D]">
                        Kỹ năng của {selectedMember.name}
                      </span>
                      <span className="text-[11px] text-[#7C715D]">
                        {selectedMember.desc}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill) => {
                        const running = isSkillRunning(
                          selectedMember.id,
                          skill
                        );
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => setActiveSkillOverride(skill)}
                            className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-xs transition-all ${running ? "font-extrabold shadow-sm" : "font-medium hover:opacity-90"
                              }`}
                            style={{
                              backgroundColor: running
                                ? department.color
                                : `${department.color}12`,
                              borderColor: department.color,
                              color: running ? "#FCF9F2" : department.color,
                            }}
                          >
                            {running ? `✦ ${skill}` : skill}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
