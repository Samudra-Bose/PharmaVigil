import React from "react";
import { cn } from "@/lib/utils";

interface PrescriptionTableSkeletonProps {
  rowCount?: number;
  className?: string;
}

export const PrescriptionTableSkeleton: React.FC<
  PrescriptionTableSkeletonProps
> = ({ rowCount = 5, className }) => {
  return (
    <div
      role="status"
      aria-label="Loading prescription records..."
      className={cn(
        "bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle select-none",
        className,
      )}
    >
      {/* Table Header Placeholder */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4">
        <div className="h-3.5 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="h-3.5 w-40 rounded bg-slate-200 animate-pulse hidden sm:block" />
        <div className="h-3.5 w-24 rounded bg-slate-200 animate-pulse hidden md:block" />
        <div className="h-3.5 w-20 rounded bg-slate-200 animate-pulse" />
        <div className="h-3.5 w-16 rounded bg-slate-200 animate-pulse ml-auto" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rowCount }).map((_, idx) => (
          <div
            key={idx}
            className="px-4 py-3.5 flex items-center justify-between gap-4"
          >
            {/* Col 1: Case ID & Patient */}
            <div className="space-y-1.5 min-w-[120px]">
              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
            </div>

            {/* Col 2: Drugs / Description */}
            <div className="space-y-1.5 hidden sm:block flex-1 max-w-xs">
              <div className="h-4 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>

            {/* Col 3: Date / Meta */}
            <div className="hidden md:block">
              <div className="h-3.5 w-24 rounded bg-slate-200 animate-pulse" />
            </div>

            {/* Col 4: Status Badge */}
            <div>
              <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
            </div>

            {/* Col 5: Action Button */}
            <div className="ml-auto">
              <div className="h-7 w-20 rounded-md bg-slate-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
