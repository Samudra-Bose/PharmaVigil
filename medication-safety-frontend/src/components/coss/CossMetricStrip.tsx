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
 * COSS UI - High Density Metric Strip
 * Employs COSS UI's signature 1px crisp micro-borders, inner bevel highlights,
 * and compact tabular data presentation for operational clinical dashboards.
 */
export const CossMetricStrip: React.FC<CossMetricStripProps> = ({ metrics, className }) => {
  const getToneStyles = (tone: CossMetricItem["tone"]) => {
    switch (tone) {
      case "urgent":
        return {
          bar: "bg-rose-500",
          card: "bg-rose-50/20 border-rose-200/80",
          val: "text-rose-950",
          label: "text-rose-900",
        };
      case "success":
        return {
          bar: "bg-teal-600",
          card: "bg-teal-50/20 border-teal-200/80",
          val: "text-teal-950",
          label: "text-teal-900",
        };
      case "info":
        return {
          bar: "bg-blue-500",
          card: "bg-blue-50/20 border-blue-200/80",
          val: "text-blue-950",
          label: "text-blue-900",
        };
      default:
        return {
          bar: "bg-slate-700",
          card: "bg-white border-slate-200/90",
          val: "text-slate-900",
          label: "text-slate-500",
        };
    }
  };

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {metrics.map((m, idx) => {
        const styles = getToneStyles(m.tone);
        const Icon = m.icon;

        return (
          <div
            key={idx}
            className={cn(
              "relative rounded-lg p-3.5 border shadow-subtle flex flex-col justify-between transition-all",
              styles.card
            )}
          >
            <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-lg", styles.bar)} />

            <div className="flex items-center justify-between">
              <span className={cn("text-[11px] font-semibold tracking-tight uppercase", styles.label)}>
                {m.label}
              </span>
              {Icon && <Icon className={cn("w-4 h-4 shrink-0 opacity-70", styles.label)} />}
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              <span className={cn("text-2xl font-bold font-mono tracking-tight font-tabular", styles.val)}>
                {m.value}
              </span>
              {m.subtext && (
                <span className="text-[10px] text-slate-500 font-medium">
                  {m.subtext}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
