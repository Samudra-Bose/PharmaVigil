import React from "react";
import { cn } from "@/lib/utils";

interface PipelineStepperSkeletonProps {
  className?: string;
}

export const PipelineStepperSkeleton: React.FC<PipelineStepperSkeletonProps> = ({
  className,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading clinical workflow steps..."
      className={cn(
        "w-full bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-subtle mb-6 overflow-x-auto scrollbar-none select-none",
        className
      )}
    >
      <div className="flex items-center justify-between min-w-[580px] px-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-2.5 w-12 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>

            {idx < 4 && (
              <div className="flex-1 h-0.5 mx-3 rounded-full bg-slate-200/80 animate-pulse min-w-[24px]" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
