import React from "react";
import type { CheckEnvelope } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface CoverageMatrixProps {
  coverage: CheckEnvelope["data"]["coverageByCategory"];
  ruleSetVersion: string;
}

export const CoverageMatrix: React.FC<CoverageMatrixProps> = ({
  coverage,
  ruleSetVersion,
}) => {
  const getBadgeVariant = (status?: string): BadgeVariant => {
    switch (status) {
      case "EVALUATED_WITH_MATCHES":
        return "high";
      case "NO_MATCHING_SEEDED_RULE":
        return "info";
      case "NOT_EVALUATED":
        return "neutral";
      case "INCOMPLETE":
        return "incomplete";
      case "UNSUPPORTED":
        return "incomplete";
      case "FAILED":
        return "failed";
      default:
        return "neutral";
    }
  };

  const categories = [
    {
      title: "Drug–Drug Interactions",
      code: "DRUG_DRUG",
      info: coverage.drugDrug,
    },
    {
      title: "Drug–Allergy / Hypersensitivity",
      code: "ALLERGY",
      info: coverage.allergy,
    },
    {
      title: "Food / Drink Interactions",
      code: "FOOD_DRINK",
      info: coverage.foodDrink,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      <div className="bg-slate-100/70 p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Category Coverage & Boundary Matrix
          </h3>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Rule Set: {ruleSetVersion}
        </span>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {categories.map((cat) => (
          <div
            key={cat.code}
            className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-900">{cat.title}</div>
              <div className="text-slate-500 text-[11px] leading-relaxed">
                {cat.info?.limitation ||
                  "Coverage not evaluated in this illustrative run."}
              </div>
            </div>
            <div className="shrink-0">
              <Badge variant={getBadgeVariant(cat.info?.status)}>
                {cat.info?.status || "NOT_EVALUATED"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-slate-50/80 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Categories with "NO_MATCHING_SEEDED_RULE" reflect absence of a match
          in the illustrative subset, not a safety clearance.
        </span>
      </div>
    </div>
  );
};
