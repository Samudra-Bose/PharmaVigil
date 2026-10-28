import React from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineStepperProps {
  currentStep: number;
}

const STEPS = [
  { step: 1, label: "Confirm Patient" },
  { step: 2, label: "Capture & OCR" },
  { step: 3, label: "Match Medicines" },
  { step: 4, label: "Safety Check" },
  { step: 5, label: "Authorize Dispensing" },
];

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStep,
}) => {
  return (
    <div
      role="region"
      aria-label="Prescription Safety Progress"
      className="w-full bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-subtle mb-6 overflow-x-auto scrollbar-none"
    >
      <div className="flex items-center justify-between min-w-[580px] px-2">
        {STEPS.map((s, idx) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          const isLocked = s.step > currentStep;

          return (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : isCurrent
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-emerald-50 shadow-xs"
                        : "bg-slate-100 text-slate-400 border border-slate-200",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : isLocked ? (
                    <span className="font-mono text-[11px]">{s.step}</span>
                  ) : (
                    s.step
                  )}
                </div>

                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-xs font-semibold whitespace-nowrap leading-tight tracking-tight",
                      isCurrent
                        ? "text-emerald-950 font-bold"
                        : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400",
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono leading-none mt-0.5",
                      isCurrent
                        ? "text-emerald-600 font-semibold"
                        : isCompleted
                          ? "text-slate-500"
                          : "text-slate-400",
                    )}
                  >
                    {isCompleted
                      ? "Completed"
                      : isCurrent
                        ? "Active Step"
                        : "Gated"}
                  </span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3 rounded-full transition-colors",
                    s.step < currentStep ? "bg-emerald-500" : "bg-slate-200",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
