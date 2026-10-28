import React from "react";
import { cn } from "@/lib/utils";

export interface CossMetricItem {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "urgent" | "success" | "info";
}

interface CossMetricStripProps {
  metrics: CossMetricItem[];
  className?: string;
}

/**
 * COSS UI — High-Craft Clinical Metric Rail
 * Inspired by Linear's operational dashboards and COSS UI's crisp 1px micro-borders.
 * Replaces fragmented "card soup" with a monolithic, high-density metric rail.
 */
export const CossMetricStrip: React.FC<CossMetricStripProps> = ({ metrics, className }) => {
  const getIndicatorDot = (tone: CossMetricItem["tone"]) => {
    switch (tone) {
      case "urgent":
        return <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" aria-hidden="true" />;
      case "success":
        return <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" aria-hidden="true" />;
      case "info":
        return <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <section
      aria-label="Operational Metrics"
      className={cn(
        "bg-white border border-slate-200/80 rounded-lg shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100 flex flex-col sm:flex-row items-stretch select-none",
        className
      )}
    >
      {metrics.map((m, idx) => {
        const Icon = m.icon;

        return (
          <div
            key={idx}
            className="flex-1 px-4 py-3 flex flex-col justify-between hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                {getIndicatorDot(m.tone)}
                <span className="truncate">{m.label}</span>
              </span>
              {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-70" />}
            </div>

            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 font-tabular">
                {m.value}
              </span>
              {m.subtext && (
                <span className="text-[10px] text-slate-400 font-mono font-medium truncate">
                  {m.subtext}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};
