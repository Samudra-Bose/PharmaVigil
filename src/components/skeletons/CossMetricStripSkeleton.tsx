import React from "react";
import { cn } from "@/lib/utils";

interface CossMetricStripSkeletonProps {
  columnCount?: number;
  className?: string;
}

export const CossMetricStripSkeleton: React.FC<CossMetricStripSkeletonProps> = ({
  columnCount = 4,
  className,
}) => {
  return (
    <section
      role="status"
      aria-label="Loading operational metrics..."
      className={cn(
        "bg-white border border-slate-200/80 rounded-lg shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100 flex flex-col sm:flex-row items-stretch select-none",
        className
      )}
    >
      {Array.from({ length: columnCount }).map((_, idx) => (
        <div
          key={idx}
          className="flex-1 px-4 py-3 flex flex-col justify-between min-h-[72px]"
        >
          {/* Top Row: Dot + Label + Icon */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse shrink-0" />
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="w-3.5 h-3.5 rounded bg-slate-200 animate-pulse shrink-0" />
          </div>

          {/* Bottom Row: Number + Subtext */}
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <div className="h-7 w-12 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
      ))}
    </section>
  );
};
