"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOfficeData } from "@/hooks/useOfficeData";
import { useOfficeStore } from "@/store/useOfficeStore";
import type { MemberWithDepartment } from "@/types/office";

// Display order left-to-right with Lex & Emma centered
const DISPLAY_ORDER = [
  "alien",
  "8bit-video",
  "video",
  "threads",
  "8bit-fb",
  "research",
  "lex",
  "emma",
  "it-lead",
  "automation",
  "data",
  "dev",
];

// Appearance order by group: Executive -> Content -> Marketing -> IT
const APPEARANCE_ORDER = [
  "lex",
  "emma",
  "alien",
  "8bit-video",
  "video",
  "threads",
  "8bit-fb",
  "research",
  "it-lead",
  "automation",
  "data",
  "dev",
];

const STAGGER_SECONDS = 0.35;
const AUTO_ENTER_MS = 4000;

function ChibiAvatarSvg({
  member,
  isExecutive,
}: {
  member: MemberWithDepartment;
  isExecutive: boolean;
}) {
  const { id, avatarStyle } = member;
  const shirt = avatarStyle.shirtColor;
  const isPixel = id === "8bit-video" || id === "8bit-fb";
  const isAlien = id === "alien";
  const skin = isAlien ? "#72C44B" : "#F6D7B8";
  const sizeClass = isExecutive ? "h-24 w-20 sm:h-28 sm:w-24" : "h-20 w-16 sm:h-24 sm:w-20";

  return (
    <svg
      viewBox="0 0 80 100"
      className={`${sizeClass} overflow-visible drop-shadow-sm`}
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="40" cy="93" rx="18" ry="4.5" fill="#2A251D" opacity="0.16" />

      {/* Automation spinning gear behind back */}
      {id === "automation" && (
        <g transform="translate(56, 62)">
          <circle cx="0" cy="0" r="10" fill="#D4A84B" />
          <circle cx="0" cy="0" r="4" fill="#F5EFE0" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <rect
              key={deg}
              x="-2.5"
              y="-13.5"
              width="5"
              height="5"
              rx="1"
              fill="#D4A84B"
              transform={`rotate(${deg})`}
            />
          ))}
        </g>
      )}

      {/* Legs */}
      <rect x="30" y="76" width="7" height="15" rx="3.5" fill="#3A4150" />
      <rect x="43" y="76" width="7" height="15" rx="3.5" fill="#3A4150" />

      {/* Torso */}
      {isPixel ? (
        <rect x="24" y="52" width="32" height="27" rx="3" fill={shirt} />
      ) : (
        <rect x="25" y="52" width="30" height="27" rx="12" fill={shirt} />
      )}

      {/* Arms */}
      <rect x="17" y="55" width="7" height="18" rx="3.5" fill={shirt} />
      <rect x="56" y="55" width="7" height="18" rx="3.5" fill={shirt} />
      <circle cx="20.5" cy="74" r="3.5" fill={skin} />
      <circle cx="59.5" cy="74" r="3.5" fill={skin} />

      {/* Head */}
      {isPixel ? (
        <rect x="21" y="18" width="38" height="35" rx="4" fill={skin} />
      ) : (
        <circle cx="40" cy="36" r="19" fill={skin} />
      )}

      {/* Hair cap for non-alien, non-pixel */}
      {!isAlien && !isPixel && (
        <path
          d="M21 34 C21 19, 59 19, 59 34 C53 27, 27 27, 21 34 Z"
          fill={id === "lex" ? "#2E2A26" : "#443022"}
        />
      )}

      {/* Emma hair bun */}
      {id === "emma" && <circle cx="57" cy="24" r="6" fill="#443022" />}

      {/* Eyes */}
      <circle cx="33.5" cy="37" r={isAlien ? 3.5 : 2.3} fill="#18181B" />
      <circle cx="46.5" cy="37" r={isAlien ? 3.5 : 2.3} fill="#18181B" />
      {/* Gentle smile */}
      <path
        d="M36 44 Q40 47 44 44"
        fill="none"
        stroke="#4A3A2E"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Character-specific details */}
      {id === "lex" && (
        <>
          {/* White collar + moss-green tie */}
          <polygon points="35,52 45,52 40,62" fill="#FAF7F0" />
          <polygon points="38.5,55 41.5,55 42.5,70 40,74 37.5,70" fill="#3F5B2F" />
          {/* Gold glasses */}
          <circle cx="33.5" cy="37" r="4.5" fill="none" stroke="#D4AF37" strokeWidth="1.4" />
          <circle cx="46.5" cy="37" r="4.5" fill="none" stroke="#D4AF37" strokeWidth="1.4" />
          <line x1="38" y1="37" x2="42" y2="37" stroke="#D4AF37" strokeWidth="1.4" />
        </>
      )}

      {id === "emma" && (
        <>
          <polygon points="35,52 45,52 40,63" fill="#FAF3E3" />
          {/* Notebook */}
          <rect x="55" y="59" width="13" height="16" rx="2" fill="#E9D8B4" stroke="#B69F72" strokeWidth="1" />
          <line x1="58" y1="64" x2="65" y2="64" stroke="#8C7A5B" strokeWidth="1.2" />
          <line x1="58" y1="68" x2="65" y2="68" stroke="#8C7A5B" strokeWidth="1.2" />
        </>
      )}

      {id === "alien" && (
        <>
          <line x1="32" y1="18" x2="27" y2="7" stroke="#58A836" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="26.5" cy="6" r="3.5" fill="#B8F25A" />
          <line x1="48" y1="18" x2="53" y2="7" stroke="#58A836" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="53.5" cy="6" r="3.5" fill="#B8F25A" />
        </>
      )}

      {id === "8bit-video" && (
        <>
          {/* Camera viewfinder */}
          <rect x="42" y="29" width="16" height="12" rx="2" fill="#23262E" />
          <circle cx="50" cy="35" r="3.5" fill="#38BDF8" />
          <circle cx="45" cy="32" r="1.5" fill="#EF4444" />
          <rect x="20" y="15" width="40" height="4" rx="1" fill="#2C2F36" />
        </>
      )}

      {id === "threads" && (
        <text
          x="40"
          y="12"
          textAnchor="middle"
          fontSize="16"
          fontWeight="800"
          fill="#18181B"
        >
          @
        </text>
      )}

      {id === "8bit-fb" && (
        <g transform="translate(30, -3)">
          <rect x="0" y="0" width="20" height="20" rx="4" fill="#1877F2" />
          <text
            x="10.5"
            y="15.5"
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill="#FFFFFF"
          >
            f
          </text>
        </g>
      )}

      {id === "it-lead" && (
        <>
          {/* Hoodie strings */}
          <line x1="36" y1="53" x2="36" y2="66" stroke="#EAE4D3" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="44" y1="53" x2="44" y2="66" stroke="#EAE4D3" strokeWidth="1.8" strokeLinecap="round" />
          {/* Over-ear headphones */}
          <path d="M19 36 C19 16, 61 16, 61 36" fill="none" stroke="#252830" strokeWidth="3.2" />
          <rect x="15" y="31" width="6" height="12" rx="3" fill="#6B4F8A" />
          <rect x="59" y="31" width="6" height="12" rx="3" fill="#6B4F8A" />
        </>
      )}

      {id === "data" && (
        /* Mini bar chart board */
        <g transform="translate(52, 56)">
          <rect x="0" y="0" width="18" height="16" rx="2" fill="#FAF7F0" stroke="#D1C7B2" strokeWidth="1" />
          <rect x="3" y="9" width="3" height="5" fill="#38BDF8" />
          <rect x="7.5" y="6" width="3" height="8" fill="#A78BFA" />
          <rect x="12" y="3" width="3" height="11" fill="#34D399" />
        </g>
      )}

      {id === "dev" && (
        <>
          {/* Square glasses */}
          <rect x="28" y="33" width="9" height="7" rx="1.5" fill="none" stroke="#1E2028" strokeWidth="1.6" />
          <rect x="43" y="33" width="9" height="7" rx="1.5" fill="none" stroke="#1E2028" strokeWidth="1.6" />
          <line x1="37" y1="36.5" x2="43" y2="36.5" stroke="#1E2028" strokeWidth="1.6" />
          {/* Mini Laptop held in front */}
          <rect x="26" y="60" width="28" height="15" rx="2" fill="#475569" />
          <rect x="29" y="62.5" width="22" height="10" rx="1" fill="#38BDF8" opacity="0.85" />
        </>
      )}
    </svg>
  );
}

export function IntroOverlay() {
  const { companyName, allMembers } = useOfficeData();
  const hasEnteredOffice = useOfficeStore((s) => s.hasEnteredOffice);
  const enterOffice = useOfficeStore((s) => s.enterOffice);

  // Auto-enter after ~4 seconds
  useEffect(() => {
    if (hasEnteredOffice) return;
    const timer = window.setTimeout(() => {
      enterOffice();
    }, AUTO_ENTER_MS);
    return () => window.clearTimeout(timer);
  }, [hasEnteredOffice, enterOffice]);

  const orderedMembers = useMemo(() => {
    const map = new Map(allMembers.map((m) => [m.id, m]));
    return DISPLAY_ORDER.map((id) => map.get(id)).filter(
      (m): m is MemberWithDepartment => Boolean(m)
    );
  }, [allMembers]);

  // Split companyName so the second half highlights in moss green #3F5B2F
  const titleParts = useMemo(() => {
    const words = companyName.trim().split(/\s+/);
    if (words.length <= 1) return { first: companyName, accent: "" };
    const mid = Math.ceil(words.length / 2);
    return {
      first: words.slice(0, mid).join(" "),
      accent: words.slice(mid).join(" "),
    };
  }, [companyName]);

  return (
    <AnimatePresence>
      {!hasEnteredOffice && (
        <motion.div
          key="office-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto bg-[#F5EFE0] px-4 py-8 sm:px-8 sm:py-10"
        >
          {/* Top Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            {/* Small Geometric Company Logo */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DFD6BE] bg-[#FCF9F2] shadow-sm">
              <svg viewBox="0 0 36 36" className="h-7 w-7" aria-hidden="true">
                <polygon points="18,3 31,10.5 31,25.5 18,33 5,25.5 5,10.5" fill="#3F5B2F" />
                <rect
                  x="13"
                  y="13"
                  width="10"
                  height="10"
                  rx="1.5"
                  fill="#E5C068"
                  transform="rotate(45 18 18)"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#2A251D] sm:text-5xl">
              {titleParts.first}{" "}
              {titleParts.accent && (
                <span className="text-[#3F5B2F]">{titleParts.accent}</span>
              )}
            </h1>
            <p className="mt-2.5 max-w-md text-sm font-medium text-[#6B6253] sm:text-base">
              Đội ngũ làm việc cùng nhau trong một văn phòng
            </p>
          </motion.div>

          {/* Horizontal Lineup of all 10 Characters (Lex & Emma centered and larger).
              On phones the lineup wraps into a 5-column grid instead of a
              horizontal scroll with no affordance; desktop keeps the row. */}
          <div className="my-6 w-full max-w-6xl pb-2 sm:overflow-x-auto">
            <div className="mx-auto grid grid-cols-5 items-end justify-center gap-2 px-2 sm:flex sm:min-w-[780px] sm:gap-3 lg:gap-4">
              {orderedMembers.map((member) => {
                const isExecutive = member.departmentId === "executive";
                const appearIdx = APPEARANCE_ORDER.indexOf(member.id);
                const delay = Math.max(0, appearIdx) * STAGGER_SECONDS;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 26, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay,
                      type: "spring",
                      stiffness: 340,
                      damping: 18,
                    }}
                    className={`flex flex-col items-center text-center ${
                      isExecutive ? "mx-1.5 -translate-y-2 sm:mx-2.5" : ""
                    }`}
                  >
                    <ChibiAvatarSvg member={member} isExecutive={isExecutive} />

                    <div className="mt-2 flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: member.departmentColor }}
                        />
                        <span
                          className={`font-bold text-[#2A251D] ${
                            isExecutive ? "text-sm" : "text-xs"
                          }`}
                        >
                          {member.name}
                        </span>
                      </div>
                      <span className="mt-0.5 max-w-[92px] truncate text-[10px] text-[#7C715D] sm:text-[11px]">
                        {member.role}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Enter Action & Subtle 4s Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              type="button"
              onClick={enterOffice}
              className="cursor-pointer rounded-full bg-[#3F5B2F] px-7 py-3 text-sm font-bold text-[#FCF9F2] shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#334B25] hover:shadow-lg active:translate-y-0"
            >
              Vào văn phòng →
            </button>

            <div className="h-1 w-44 overflow-hidden rounded-full bg-[#DFD6BE]">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: AUTO_ENTER_MS / 1000, ease: "linear" }}
                style={{ transformOrigin: "0% 50%" }}
                className="h-full w-full bg-[#3F5B2F]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
