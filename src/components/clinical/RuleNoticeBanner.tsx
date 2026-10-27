import React from "react";
import { Info } from "lucide-react";

interface RuleNoticeBannerProps {
  ruleSetVersion?: string;
  className?: string;
}

export const RuleNoticeBanner: React.FC<RuleNoticeBannerProps> = ({
  ruleSetVersion = "v1.0.0-illustrative",
  className = "",
}) => {
  return (
    <div
      className={`p-3 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 ${className}`}
      role="note"
    >
      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="leading-relaxed">
        <span className="font-semibold text-slate-900">
          Illustrative rule set; not clinically validated.
        </span>{" "}
        Evaluation reflects a limited synthetic demonstration dataset (Rule Set Version:{" "}
        <span className="font-mono font-semibold text-slate-800">{ruleSetVersion}</span>).
        Absence of a matching rule is not a certification of clinical safety or drug compatibility.
      </div>
    </div>
  );
};
