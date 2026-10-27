import React from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  [key: string]: any;
}

/**
 * Aceternity UI - Radial Dot Grid Pattern
 * Renders an accessible, lightweight SVG medical matrix background
 * for the portal gateway and authentication card surfaces.
 */
export const GridPattern: React.FC<GridPatternProps> = ({
  width = 24,
  height = 24,
  x = -1,
  y = -1,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}) => {
  const id = React.useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-slate-300/40 stroke-slate-300/30",
        "[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
};
