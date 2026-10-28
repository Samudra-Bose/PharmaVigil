"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DotMatrixWaveformProps {
  className?: string;
  variant?: "alert" | "normal" | "emerald" | "multi";
}

/**
 * High-Craft Dot Matrix Waveform Visualizer
 * Directly inspired by luxury medical hardware and the Rythea telemetry waveform.
 * Renders an animated SVG dot-matrix grid representing deterministic safety rule evaluations.
 */
export const DotMatrixWaveform: React.FC<DotMatrixWaveformProps> = ({
  className,
  variant = "multi",
}) => {
  // Columns of dot heights (number of dots active vertically out of 8)
  const columns = [
    { height: 3, tone: "emerald" },
    { height: 4, tone: "emerald" },
    { height: 6, tone: "rose" },
    { height: 8, tone: "rose" }, // DDI Peak
    { height: 7, tone: "rose" },
    { height: 4, tone: "amber" },
    { height: 2, tone: "slate" },
    { height: 3, tone: "emerald" },
    { height: 5, tone: "emerald" },
    { height: 7, tone: "rose" },
    { height: 5, tone: "amber" },
    { height: 3, tone: "emerald" },
    { height: 2, tone: "slate" },
    { height: 2, tone: "slate" },
    { height: 4, tone: "emerald" },
    { height: 6, tone: "emerald" },
    { height: 8, tone: "rose" }, // Secondary peak
    { height: 6, tone: "amber" },
    { height: 3, tone: "emerald" },
    { height: 2, tone: "slate" },
    { height: 4, tone: "emerald" },
    { height: 5, tone: "emerald" },
    { height: 7, tone: "rose" },
    { height: 6, tone: "rose" },
    { height: 4, tone: "amber" },
    { height: 3, tone: "emerald" },
    { height: 2, tone: "slate" },
    { height: 3, tone: "emerald" },
    { height: 4, tone: "emerald" },
    { height: 2, tone: "slate" },
  ];

  const getColor = (tone: string, rowIdx: number, activeHeight: number) => {
    const isLit = rowIdx < activeHeight;
    if (!isLit) return "rgba(148, 163, 184, 0.15)"; // dim background dot

    if (variant === "emerald") return "#10b981";
    if (variant === "alert") return "#ef4444";

    if (tone === "rose") return "#f43f5e";
    if (tone === "amber") return "#f59e0b";
    if (tone === "emerald") return "#10b981";
    return "#94a3b8";
  };

  return (
    <div
      className={cn("w-full overflow-hidden select-none py-1", className)}
      aria-label="Clinical Safety Dot Matrix Telemetry"
      role="img"
    >
      <svg
        viewBox="0 0 360 56"
        className="w-full h-12 md:h-14 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {columns.map((col, colIdx) => {
          const x = 12 + colIdx * 11.5;
          return Array.from({ length: 7 }).map((_, rowIdx) => {
            // rowIdx 0 is bottom, rowIdx 6 is top
            const y = 48 - rowIdx * 7.5;
            const fill = getColor(col.tone, rowIdx + 1, col.height);
            return (
              <circle
                key={`${colIdx}-${rowIdx}`}
                cx={x}
                cy={y}
                r={2.2}
                fill={fill}
                className="transition-colors duration-200"
              />
            );
          });
        })}
      </svg>
    </div>
  );
};
