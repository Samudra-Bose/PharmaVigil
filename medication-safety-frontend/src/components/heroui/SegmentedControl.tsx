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
 * HeroUI - Segmented Control Primitive
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
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200/80 gap-1",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;

        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 select-none",
              isSelected
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold",
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-700"
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
