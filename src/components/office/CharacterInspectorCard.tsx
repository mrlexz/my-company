"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useOfficeData } from "@/hooks/useOfficeData";
import { useOfficeStore } from "@/store/useOfficeStore";

/**
 * Interactive Character Card shown when clicking any character in the 3D office:
 * - Self-introduction speech bubble
 * - Current activity & skill chips
 * - "Gọi đến sảnh" (call to lobby round table) & "Hối thúc" (temporary speed boost)
 */
export function CharacterInspectorCard() {
  const { getMemberById } = useOfficeData();
  const selectedMemberId = useOfficeStore((s) => s.selectedMemberId);
  const lifeSnapshots = useOfficeStore((s) => s.lifeSnapshots);
  const isWorkflowRunning = useOfficeStore((s) => s.isWorkflowRunning);
  const setSelectedMember = useOfficeStore((s) => s.setSelectedMember);
  const triggerCallToLobby = useOfficeStore((s) => s.triggerCallToLobby);
  const triggerHurry = useOfficeStore((s) => s.triggerHurry);

  const member = selectedMemberId ? getMemberById(selectedMemberId) : undefined;
  const snap = selectedMemberId ? lifeSnapshots[selectedMemberId] : undefined;

  return (
    <AnimatePresence>
      {member && !isWorkflowRunning && (
        <motion.aside
          key={member.id}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed bottom-24 right-5 z-30 w-80 max-w-[calc(100vw-2.5rem)] rounded-3xl border border-[#DFD6BE] bg-[#FCF9F2]/96 p-4 shadow-2xl backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setSelectedMember(null)}
            aria-label="Đóng thẻ nhân vật"
            className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#EFE7D4] text-xs font-bold text-[#5C5343] hover:bg-[#E2D6BC]"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-inner"
              style={{ backgroundColor: member.avatarStyle.shirtColor }}
            >
              {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2A251D]">
                {member.name}
              </h3>
              <p
                className="text-xs font-semibold"
                style={{ color: member.departmentColor }}
              >
                {member.role} · {member.departmentName}
              </p>
            </div>
          </div>

          {/* Self-introduction bubble */}
          <div className="mt-3 rounded-2xl border border-[#E6DEC8] bg-white p-3 text-xs leading-relaxed text-[#4A4235]">
            <p>
              &ldquo;Chào bạn! Mình là <b>{member.name}</b> — {member.desc.toLowerCase()}.&rdquo;
            </p>
            {snap && (
              <p className="mt-1.5 text-[11px] font-medium text-[#6B6253]">
                Hiện tại: <span className="font-bold text-[#3F5B2F]">{snap.activityLabel}</span>
                {snap.speedMultiplier > 1 && " ⚡ (đang vội!)"}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <code
                key={skill}
                className="rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold"
                style={{
                  borderColor: `${member.departmentColor}44`,
                  backgroundColor: `${member.departmentColor}12`,
                  color: member.departmentColor,
                }}
              >
                {skill}
              </code>
            ))}
          </div>

          {/* Viewer Actions: Call to Lobby & Hurry */}
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => triggerCallToLobby(member.id)}
              className="cursor-pointer rounded-xl bg-[#3F5B2F] px-3 py-2 text-xs font-bold text-[#FCF9F2] shadow-sm transition-colors hover:bg-[#334B25]"
            >
              Gọi đến sảnh
            </button>
            <button
              type="button"
              onClick={() => triggerHurry(member.id)}
              className="cursor-pointer rounded-xl border border-[#DFD6BE] bg-[#F5EFE0] px-3 py-2 text-xs font-bold text-[#2A251D] transition-colors hover:bg-[#E9DFC8]"
            >
              ⚡ Hối thúc
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
