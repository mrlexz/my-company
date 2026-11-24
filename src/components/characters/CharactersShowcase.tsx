"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { OrbitControls, PerspectiveCamera, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Character,
  type CharacterHandle,
} from "@/components/office/Character";
import { renderProp } from "@/components/office/character/parts/propParts";
import { useOfficeData } from "@/hooks/useOfficeData";
import type {
  CharacterState,
  EmotionType,
  MemberWithDepartment,
  PropType,
} from "@/types/office";

const EMOTIONS: Array<{ value: EmotionType; label: string }> = [
  { value: "idle", label: "Idle" },
  { value: "happy", label: "Happy" },
  { value: "focused", label: "Focused" },
  { value: "surprised", label: "Surprised" },
  { value: "celebrating", label: "Celebrating" },
];

const STATES: Array<{ value: CharacterState; label: string }> = [
  { value: "idle", label: "Idle" },
  { value: "walking", label: "Walking" },
  { value: "working", label: "Working" },
  { value: "handover", label: "Handover" },
  { value: "celebrating", label: "Celebrating" },
];

const ALL_PROPS: Array<{
  type: Exclude<PropType, "none">;
  label: string;
  desc: string;
  primaryColor?: string;
  secondaryColor?: string;
}> = [
  {
    type: "scroll",
    label: "Scroll",
    desc: "Cuộn giấy có dấu sáp đỏ & ruy băng (mở khi working)",
    primaryColor: "#F5E7C6",
    secondaryColor: "#B83B2E",
  },
  {
    type: "notebook",
    label: "Notebook",
    desc: "Sổ da cài bút lông gáy (lật trang khi working)",
    primaryColor: "#8C5E3C",
    secondaryColor: "#E5C068",
  },
  {
    type: "quill",
    label: "Quill",
    desc: "Bút lông ngỗng lớn ngòi vàng",
    primaryColor: "#FAF6EC",
    secondaryColor: "#D9B35C",
  },
  {
    type: "clapperboard",
    label: "Clapperboard",
    desc: "Bảng clap phim vạch đen trắng khép mở nhẹ",
    primaryColor: "#23262E",
    secondaryColor: "#FAF7F0",
  },
  {
    type: "megaphone",
    label: "Megaphone",
    desc: "Loa nón LatheGeometry có vành nổi",
    primaryColor: "#3C82A6",
    secondaryColor: "#FAF7F0",
  },
  {
    type: "shoppingBag",
    label: "Shopping Bag",
    desc: "Túi giấy có cổ gập & quai dây đôi",
    primaryColor: "#D4A373",
    secondaryColor: "#FAF6EC",
  },
  {
    type: "priceSign",
    label: "Price Sign",
    desc: "Bảng giá gỗ bo viền gắn trên cọc",
    primaryColor: "#B88652",
    secondaryColor: "#FAF3DF",
  },
  {
    type: "wrench",
    label: "Wrench",
    desc: "Cờ lê to bản kim loại mờ",
    primaryColor: "#CBD5E1",
    secondaryColor: "#64748B",
  },
  {
    type: "blueprint",
    label: "Blueprint",
    desc: "Ống bản vẽ có giấy xanh thò ra",
    primaryColor: "#6D4C36",
    secondaryColor: "#2E6DB4",
  },
  {
    type: "bigBook",
    label: "Big Book",
    desc: "Sách dày bìa teal, 4 góc bọc vàng",
    primaryColor: "#2B7A78",
    secondaryColor: "#E0B85A",
  },
  {
    type: "miniChart",
    label: "Mini Chart",
    desc: "Bảng nhỏ có 4 cột biểu đồ màu",
    primaryColor: "#FAF7F0",
    secondaryColor: "#6B4F8A",
  },
  {
    type: "laptop",
    label: "Laptop",
    desc: "Mở, màn hình phát sáng, 3 sticker tròn sau nắp",
    primaryColor: "#475569",
    secondaryColor: "#38BDF8",
  },
  {
    type: "shieldF",
    label: "Shield F",
    desc: "Khiên tròn xanh đậm, viền vàng, chữ f nổi",
    primaryColor: "#1E4D8C",
    secondaryColor: "#E0B85A",
  },
  {
    type: "speechBubbles",
    label: "Speech Bubbles",
    desc: "3 bong bóng thoại trắng-xanh trôi nhấp nhô",
    primaryColor: "#FAF7F0",
    secondaryColor: "#72B8E2",
  },
];

const FLAGSHIP_IDS = new Set(["lex", "emma"]);

function PropTurntableCard({
  propInfo,
  isWorking,
}: {
  propInfo: (typeof ALL_PROPS)[number];
  isWorking: boolean;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-[#DFD6BE] bg-[#FCF9F2] shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-52 w-full bg-[#EFE7D4]">
        <View className="h-full w-full cursor-grab active:cursor-grabbing">
          <color attach="background" args={["#EFE7D4"]} />
          <PerspectiveCamera makeDefault position={[0, 0.25, 1.05]} fov={36} />
          <ambientLight intensity={0.9} color="#FFF8EC" />
          <hemisphereLight args={["#FFFDF7", "#C6B494", 0.55]} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={1.35}
            color="#FFF4DF"
            castShadow
          />
          <directionalLight
            position={[-3, 2, -3]}
            intensity={0.5}
            color="#DDE8F8"
          />

          <group scale={1.45}>
            {renderProp(propInfo.type, {
              primaryColor: propInfo.primaryColor,
              secondaryColor: propInfo.secondaryColor,
              isWorking,
            })}
          </group>

          <OrbitControls
            makeDefault
            enablePan={false}
            autoRotate
            autoRotateSpeed={1.2}
            minDistance={0.65}
            maxDistance={2.2}
          />
        </View>

        <span className="pointer-events-none absolute left-3 top-2.5 z-30 rounded-full bg-[#FCF9F2]/92 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#3F5B2F] shadow-sm">
          {propInfo.type}
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="text-sm font-extrabold text-[#2A251D]">
          {propInfo.label}
        </h3>
        <p className="mt-0.5 text-xs leading-snug text-[#6B6253]">
          {propInfo.desc}
        </p>
      </div>
    </article>
  );
}

function CharacterTurntableCard({
  member,
  activeState,
  activeEmotion,
  showFacingCone,
  featured,
  onSelectState,
  onSelectEmotion,
}: {
  member: MemberWithDepartment;
  activeState: CharacterState;
  activeEmotion: EmotionType;
  showFacingCone: boolean;
  featured: boolean;
  onSelectState: (state: CharacterState) => void;
  onSelectEmotion: (emotion: EmotionType) => void;
}) {
  const charRef = useRef<CharacterHandle>(null);
  const bp = member.character;

  const handleEmotionClick = (em: EmotionType) => {
    onSelectEmotion(em);
    charRef.current?.setEmotion(em);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-[#DFD6BE] bg-[#FCF9F2] shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`relative w-full bg-[#EFE7D4] ${featured ? "h-80" : "h-64"}`}
      >
        <View className="h-full w-full cursor-grab active:cursor-grabbing">
          <color attach="background" args={["#EFE7D4"]} />
          <PerspectiveCamera
            makeDefault
            position={[0, 1.18, featured ? 2.35 : 2.95]}
            fov={35}
          />
          <ambientLight intensity={0.85} color="#FFF8EC" />
          <hemisphereLight args={["#FFFDF7", "#C6B494", 0.5]} />
          <directionalLight
            position={[4, 6, 5]}
            intensity={1.3}
            color="#FFF4DF"
            castShadow
          />
          <directionalLight
            position={[-4, 3, -4]}
            intensity={0.45}
            color="#DDE8F8"
          />

          <mesh position={[0, -0.05, 0]} receiveShadow>
            <cylinderGeometry args={[0.72, 0.78, 0.1, 24]} />
            <meshStandardMaterial color="#E2D7BE" roughness={0.88} />
          </mesh>

          <Character
            ref={charRef}
            id={member.id}
            state={activeState}
            emotion={activeEmotion}
            showDebugFacing={showFacingCone}
            initialPosition={[0, 0, 0]}
            initialRotationY={0.18}
          />

          <OrbitControls
            makeDefault
            target={[0, featured ? 0.92 : 0.76, 0]}
            enablePan={false}
            minDistance={1.4}
            maxDistance={4.4}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.95}
          />
        </View>

        <span className="pointer-events-none absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-[#FCF9F2]/92 px-2.5 py-1 text-[11px] font-bold text-[#2A251D] shadow-sm backdrop-blur-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: member.departmentColor }}
          />
          {member.departmentName.replace("Phòng ", "")}
        </span>

        <span className="pointer-events-none absolute bottom-2.5 right-3 z-30 rounded-full bg-[#231F18]/78 px-2.5 py-0.5 font-mono text-[10px] text-[#FAF6EC]">
          {activeEmotion} · {activeState}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#2A251D]">
              {member.name}
            </h2>
            <span className="rounded bg-[#F5EFE0] px-1.5 py-0.5 font-mono text-[11px] text-[#6B6253]">
              {member.id}
            </span>
          </div>
          <p
            className="text-xs font-semibold"
            style={{ color: member.departmentColor }}
          >
            {member.role}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1 text-[10px] text-[#5C5343]">
            <span className="rounded-md bg-[#F2EAD7] px-2 py-0.5">
              mắt: <b>{bp.face.eyeStyle}</b>
            </span>
            <span className="rounded-md bg-[#F2EAD7] px-2 py-0.5">
              đạo cụ: <b>{bp.prop.type}</b>
            </span>
            {bp.face.extras.length > 0 && (
              <span className="rounded-md bg-[#F2EAD7] px-2 py-0.5">
                extras: <b>{bp.face.extras.join(", ")}</b>
              </span>
            )}
          </div>
        </div>

        <div className="mt-3.5 space-y-2.5 border-t border-[#ECE4D0] pt-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7C715D]">
              Cảm xúc (setEmotion)
            </p>
            <div className="flex flex-wrap gap-1">
              {EMOTIONS.map((em) => {
                const isSelected = activeEmotion === em.value;
                return (
                  <button
                    key={em.value}
                    type="button"
                    onClick={() => handleEmotionClick(em.value)}
                    className={`cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#3F5B2F] text-[#FCF9F2]"
                        : "bg-[#F5EFE0] text-[#5C5343] hover:bg-[#EAE0CA]"
                    }`}
                  >
                    {em.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7C715D]">
              Trạng thái
            </p>
            <div className="flex flex-wrap gap-1">
              {STATES.map((st) => {
                const isSelected = activeState === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => onSelectState(st.value)}
                    className={`cursor-pointer rounded-lg px-1.5 py-1 text-[11px] font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#2A251D] text-[#FCF9F2]"
                        : "bg-[#F5EFE0] text-[#5C5343] hover:bg-[#EAE0CA]"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CharactersShowcase() {
  const { allMembers, companyName } = useOfficeData();
  const [viewMode, setViewMode] = useState<"featured" | "all" | "props">(
    "all"
  );
  const [globalEmotion, setGlobalEmotion] = useState<EmotionType>("idle");
  const [propsWorking, setPropsWorking] = useState<boolean>(true);
  const [showFacingCone, setShowFacingCone] = useState<boolean>(true);
  const [cardEmotions, setCardEmotions] = useState<Record<string, EmotionType>>(
    {}
  );
  const [cardStates, setCardStates] = useState<Record<string, CharacterState>>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleMembers =
    viewMode === "featured"
      ? allMembers.filter((m) => FLAGSHIP_IDS.has(m.id))
      : allMembers;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#F5EFE0] px-4 py-8 sm:px-8"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <View.Port />
      </Canvas>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <header className="relative z-30 flex flex-col gap-4 border-b border-[#DFD6BE] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD6BE] bg-[#FCF9F2] px-3 py-1 text-xs font-semibold text-[#3F5B2F] transition-colors hover:bg-[#EFE7D4]"
            >
              ← Về văn phòng 3D
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2A251D]">
              Nhân vật & Thư viện Đạo cụ · {companyName}
            </h1>
            <p className="mt-1 text-sm text-[#6B6253]">
              Kiểm tra 360° từng đạo cụ, chuyển động khi working, hạt sáng
              sparkles, bánh răng quay và bong bóng thoại nhấp nhô.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 rounded-2xl border border-[#DFD6BE] bg-[#FCF9F2] p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("props")}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  viewMode === "props"
                    ? "bg-[#3F5B2F] text-[#FCF9F2]"
                    : "text-[#5C5343] hover:bg-[#F2EAD7]"
                }`}
              >
                14 Đạo cụ
              </button>
              <button
                type="button"
                onClick={() => setViewMode("featured")}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  viewMode === "featured"
                    ? "bg-[#3F5B2F] text-[#FCF9F2]"
                    : "text-[#5C5343] hover:bg-[#F2EAD7]"
                }`}
              >
                Lex & Emma
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  viewMode === "all"
                    ? "bg-[#3F5B2F] text-[#FCF9F2]"
                    : "text-[#5C5343] hover:bg-[#F2EAD7]"
                }`}
              >
                10 Nhân vật
              </button>
            </div>

            {viewMode === "props" ? (
              <button
                type="button"
                onClick={() => setPropsWorking((v) => !v)}
                className={`cursor-pointer rounded-2xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-colors ${
                  propsWorking
                    ? "border-[#3F5B2F] bg-[#3F5B2F] text-[#FCF9F2]"
                    : "border-[#DFD6BE] bg-[#FCF9F2] text-[#5C5343] hover:bg-[#F2EAD7]"
                }`}
              >
                Chuyển động Working: {propsWorking ? "BẬT" : "TẮT"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowFacingCone((v) => !v)}
                  className={`cursor-pointer rounded-2xl border px-3.5 py-2 text-xs font-bold shadow-sm transition-colors ${
                    showFacingCone
                      ? "border-[#059669] bg-[#059669] text-[#FCF9F2]"
                      : "border-[#DFD6BE] bg-[#FCF9F2] text-[#5C5343] hover:bg-[#F2EAD7]"
                  }`}
                >
                  Kiểm tra hướng: {showFacingCone ? "BẬT" : "TẮT"}
                </button>
                <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-[#DFD6BE] bg-[#FCF9F2] p-1 shadow-sm">
                  {EMOTIONS.map((em) => (
                    <button
                      key={em.value}
                      type="button"
                      onClick={() => {
                        setGlobalEmotion(em.value);
                        setCardEmotions({});
                      }}
                      className={`cursor-pointer rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        globalEmotion === em.value
                          ? "bg-[#3F5B2F] text-[#FCF9F2]"
                          : "text-[#5C5343] hover:bg-[#F2EAD7]"
                      }`}
                    >
                      {em.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        {viewMode === "props" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {ALL_PROPS.map((propInfo) => (
              <PropTurntableCard
                key={propInfo.type}
                propInfo={propInfo}
                isWorking={propsWorking}
              />
            ))}
          </div>
        ) : (
          <div
            className={
              viewMode === "featured"
                ? "mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2"
                : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            }
          >
            {visibleMembers.map((member) => (
              <CharacterTurntableCard
                key={member.id}
                member={member}
                featured={viewMode === "featured"}
                showFacingCone={showFacingCone}
                activeState={cardStates[member.id] ?? "idle"}
                activeEmotion={cardEmotions[member.id] ?? globalEmotion}
                onSelectState={(st) => {
                  setCardStates((prev) => ({ ...prev, [member.id]: st }));
                  if (st === "celebrating") {
                    setCardEmotions((prev) => ({
                      ...prev,
                      [member.id]: "celebrating",
                    }));
                  }
                }}
                onSelectEmotion={(em) =>
                  setCardEmotions((prev) => ({ ...prev, [member.id]: em }))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
