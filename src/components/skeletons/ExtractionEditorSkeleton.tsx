import React from "react";
import { cn } from "@/lib/utils";

interface ExtractionEditorSkeletonProps {
  className?: string;
}

export const ExtractionEditorSkeleton: React.FC<ExtractionEditorSkeletonProps> = ({
  className,
}) => {
  return (
    <div
      role="status"
      aria-label="Loading prescription extraction editor..."
      className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 select-none", className)}
    >
      {/* Left Card: Prescription Scan Source Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs flex flex-col">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
        </div>

        <div className="p-6 bg-slate-100/50 flex-1 min-h-[350px] flex items-center justify-center">
          <div className="w-full max-w-sm bg-white p-6 rounded-lg border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="pt-2 space-y-2.5 border-t border-slate-100">
              <div className="h-3.5 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-3.5 w-5/6 rounded bg-slate-100 animate-pulse" />
              <div className="h-3.5 w-4/6 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Card: OCR Review Editor Placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs flex flex-col">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
        </div>

        <div className="p-4 space-y-3 flex-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-12 rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
                </div>
                <div className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
              </div>

              <div className="h-9 w-full rounded-md bg-slate-100 border border-slate-200 animate-pulse" />

              <div className="flex items-center justify-end gap-2 pt-1">
                <div className="h-7 w-20 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
