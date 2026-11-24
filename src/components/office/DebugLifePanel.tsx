"use client";

import { useOfficeData } from "@/hooks/useOfficeData";
import { useOfficeStore } from "@/store/useOfficeStore";

/**
 * Debug Overlay Panel toggled with key `D`:
 * Displays each character's live Office Life activity, state, speed multiplier, and active dialogue.
 */
export function DebugLifePanel() {
  const { allMembers } = useOfficeData();
  const debugFacing = useOfficeStore((s) => s.debugFacing);
  const lifeSnapshots = useOfficeStore((s) => s.lifeSnapshots);

  if (!debugFacing) return null;

  return (
    <aside className="fixed right-5 top-16 z-30 max-h-[65vh] w-72 overflow-y-auto rounded-2xl border border-[#059669]/40 bg-[#1B1914]/92 p-3.5 text-[#FAF6EC] shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/15 pb-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#34D399]">
          Debug AI & Lưới A* (Phím D)
        </span>
        <span className="font-mono text-[10px] text-[#A8A08E]">10 Hz</span>
      </div>

      <div className="mt-2.5 space-y-1.5 text-[11px]">
        {allMembers.map((m) => {
          const snap = lifeSnapshots[m.id];
          return (
            <div
              key={m.id}
              className="flex flex-col rounded-xl bg-white/5 px-2.5 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#FCF9F2]">{m.name}</span>
                <span className="rounded bg-[#059669]/30 px-1.5 py-0.5 font-mono text-[10px] text-[#6EE7B7]">
                  {snap?.activity ?? "working"} · {snap?.state ?? "working"}
                  {snap && snap.speedMultiplier > 1 ? " ⚡" : ""}
                </span>
              </div>
              <span className="truncate text-[10px] text-[#C8BEAA]">
                {snap?.speechText
                  ? `💬 "${snap.speechText}"`
                  : snap?.activityLabel ?? "đang làm việc"}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
