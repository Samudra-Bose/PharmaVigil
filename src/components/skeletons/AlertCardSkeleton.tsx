import React from "react";
import { cn } from "@/lib/utils";

interface AlertCardSkeletonProps {
  className?: string;
}

export const AlertCardSkeleton: React.FC<AlertCardSkeletonProps> = ({
  className,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading clinical alert..."
      className={cn(
        "bg-white rounded-lg border-2 border-slate-200/90 shadow-xs overflow-hidden select-none",
        className,
      )}
    >
      {/* Alert Header Skeleton */}
      <div className="bg-slate-100/70 p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-28 rounded-md bg-slate-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="p-4 space-y-4">
        {/* Rationale Skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-4/5 rounded bg-slate-200 animate-pulse" />
        </div>

        {/* Evidence References Box Skeleton */}
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2.5">
          <div className="h-3.5 w-36 rounded bg-slate-200 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
          <div className="flex items-center gap-2 pt-0.5">
            <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
