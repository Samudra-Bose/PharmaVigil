import React from "react";
import { cn } from "@/lib/utils";

interface PatientIdentityCardSkeletonProps {
  className?: string;
}

export const PatientIdentityCardSkeleton: React.FC<
  PatientIdentityCardSkeletonProps
> = ({ className }) => {
  return (
    <div
      role="status"
      aria-label="Loading patient identity..."
      className={cn(
        "bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden select-none",
        className,
      )}
    >
      {/* Header */}
      <div className="bg-slate-100/70 p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
              <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-3.5 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-3.5 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Clinical Context Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Allergies */}
        <div className="space-y-2.5">
          <div className="h-3.5 w-44 rounded bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="p-2 rounded bg-slate-50 border border-slate-200 h-11 flex items-center justify-between">
              <div className="h-3.5 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 h-11 flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right: Active Medications */}
        <div className="space-y-2.5">
          <div className="h-3.5 w-44 rounded bg-slate-200 animate-pulse" />
          <div className="space-y-2">
            <div className="p-2 rounded bg-slate-50 border border-slate-200 h-11 flex items-center justify-between">
              <div className="h-3.5 w-36 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-12 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 h-11 flex items-center justify-between">
              <div className="h-3.5 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-12 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
