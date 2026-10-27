import React from "react";
import { Check } from "lucide-react";
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

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ currentStep }) => {
  return (
    <div className="w-full bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-6 overflow-x-auto scrollbar-none">
      <div className="flex items-center justify-between min-w-[550px]">
        {STEPS.map((s, idx) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <React.Fragment key={s.step}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  )}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCurrent ? "text-slate-900 font-semibold" : isCompleted ? "text-slate-700" : "text-slate-400"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3",
                    s.step < currentStep ? "bg-emerald-500" : "bg-slate-200"
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
