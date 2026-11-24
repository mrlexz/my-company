"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import rawWorkflow from "@/data/workflow.json";
import { useOfficeData } from "@/hooks/useOfficeData";
import { useOfficeStore } from "@/store/useOfficeStore";
import type { WorkflowData } from "@/types/office";

const workflowData = rawWorkflow as WorkflowData;

export function CommandBar() {
  const [inputValue, setInputValue] = useState("");
  const { getDepartmentById, companyStatus } = useOfficeData();

  // Lệnh mặc định là việc thật Lex đang chờ làm (từ API), không còn là
  // caption demo "video giới thiệu sản phẩm mới".
  const liveDefaultCommand =
    companyStatus?.executive.find((m) => m.id === "lex")?.focus ??
    workflowData.defaultCommand;

  const isWorkflowRunning = useOfficeStore((s) => s.isWorkflowRunning);
  const workflowStepIndex = useOfficeStore((s) => s.workflowStepIndex);
  const startWorkflow = useOfficeStore((s) => s.startWorkflow);
  const skipWorkflow = useOfficeStore((s) => s.skipWorkflow);

  const currentStep =
    isWorkflowRunning &&
    workflowStepIndex >= 0 &&
    workflowStepIndex < workflowData.steps.length
      ? workflowData.steps[workflowStepIndex]
      : null;

  const activeDepartment = currentStep?.activeDepartment
    ? getDepartmentById(currentStep.activeDepartment)
    : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isWorkflowRunning) return;
    const command = inputValue.trim() || liveDefaultCommand;
    startWorkflow(command);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex flex-col items-center gap-2.5 px-4">
      {/* Dark Caption Bar during Workflow Execution */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-[#231F18]/92 px-4 py-2.5 text-[#FAF6EC] shadow-lg backdrop-blur-md"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full"
              style={{
                backgroundColor: currentStep.isCelebration
                  ? "#E5C068"
                  : activeDepartment?.color ?? "#7FA660",
              }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C8BEAA]">
                Bước {workflowStepIndex + 1}/{workflowData.steps.length}
              </span>
              <span className="hidden text-[#6B6253] sm:inline">•</span>
              <span className="text-xs font-medium leading-snug sm:text-sm">
                {currentStep.caption}
              </span>
            </div>
            <button
              type="button"
              onClick={skipWorkflow}
              className="ml-auto shrink-0 cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#FAF6EC] transition-colors hover:bg-white/20"
            >
              Bỏ qua
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Input Container */}
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto flex w-full max-w-xl flex-col gap-1"
      >
        <div className="flex items-center justify-between px-3">
          <label
            htmlFor="lex-command-input"
            className="text-[11px] font-bold tracking-wide text-[#5C5343]"
          >
            Gửi lệnh · Chủ tịch Lex
          </label>
          {isWorkflowRunning && (
            <span className="text-[11px] font-medium text-[#3F5B2F]">
              Đang thực thi kịch bản...
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border bg-[#FCF9F2]/95 py-1.5 pl-5 pr-1.5 shadow-md backdrop-blur-md transition-all ${
            isWorkflowRunning
              ? "border-[#D6CEB8] opacity-80"
              : "border-[#DFD6BE] focus-within:border-[#3F5B2F] focus-within:shadow-lg"
          }`}
        >
          <input
            id="lex-command-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isWorkflowRunning}
            placeholder={liveDefaultCommand}
            className="w-full bg-transparent text-sm text-[#2A251D] placeholder:text-[#8E8472] focus:outline-none disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={isWorkflowRunning}
            aria-label="Gửi lệnh"
            title="Gửi lệnh"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#3F5B2F] text-[#FCF9F2] shadow-sm transition-all hover:bg-[#334B25] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#8A9A7E]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
