import React from "react";
import type { AlertSummary } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface AlertCardProps {
  alert: AlertSummary;
  onAction?: () => void;
  actionLabel?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAction,
  actionLabel,
}) => {
  const getSeverityVariant = (sev: string): BadgeVariant => {
    switch (sev) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "high";
      case "MODERATE":
        return "moderate";
      default:
        return "info";
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-amber-300 shadow-xs overflow-hidden">
      {/* Alert Header */}
      <div className="bg-amber-50/80 p-3.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={getSeverityVariant(alert.severity)}>
            {alert.severity} SEVERITY
          </Badge>
          <span className="font-mono text-xs font-semibold text-slate-800">
            {alert.ruleId} (v{alert.ruleVersion})
          </span>
        </div>
        <Badge
          variant="moderate"
          icon={false}
          className="text-[10px] uppercase font-mono"
        >
          Status: {alert.status}
        </Badge>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Rationale */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Clinical Rationale & Mechanism
          </div>
          <p className="text-sm font-medium text-slate-900 leading-relaxed">
            {alert.rationale}
          </p>
        </div>

        {/* Evidence References */}
        {alert.evidenceReferences && alert.evidenceReferences.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              <BookOpen className="w-3.5 h-3.5 text-slate-600" /> Evidence
              Provenance
            </div>
            {alert.evidenceReferences.map((ref) => (
              <div key={ref.sourceId} className="space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  {ref.title}
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 underline text-[11px]"
                    >
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {ref.publisher && (
                  <div className="text-slate-600">
                    Publisher: {ref.publisher}
                  </div>
                )}
                {ref.locator && (
                  <div className="text-slate-500 font-mono text-[11px]">
                    Locator: {ref.locator}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-slate-400">Strength:</span>
                  <span className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
                    {ref.evidenceStrength || "NOT_ASSESSED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Limitations */}
        {alert.limitations && alert.limitations.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Known Rule Limitations
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
              {alert.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Action */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-amber-900 font-medium text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Doctor review required. This alert prevents dispensing
              authorization.
            </span>
          </div>

          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white font-medium hover:bg-slate-800 text-xs transition-colors shrink-0"
            >
              {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
