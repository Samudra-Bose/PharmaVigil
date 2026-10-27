"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  badgeTone?: "neutral" | "urgent" | "success";
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * HeroUI — Segmented Control Primitive
 * Implements accessible pill tabs with sliding visual thumb,
 * keyboard navigation, and dual-tone badge counters.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  ariaLabel = "Filter Options",
}: SegmentedControlProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      const nextIndex = (index + 1) % options.length;
      onChange(options[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      const prevIndex = (index - 1 + options.length) % options.length;
      onChange(options[prevIndex].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center p-0.5 rounded-lg bg-slate-100/90 border border-slate-200/80 gap-0.5 select-none",
        className
      )}
    >
      {options.map((opt, idx) => {
        const isSelected = value === opt.id;

        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900",
              isSelected
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-semibold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 font-medium"
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold",
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200/80 text-slate-600"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
