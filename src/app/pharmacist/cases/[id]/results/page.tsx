"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  INITIAL_FIXTURE_CASE,
  type FixtureCase,
} from "@/lib/mock-data/fixtures";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { RuleNoticeBanner } from "@/components/clinical/RuleNoticeBanner";
import { CoverageMatrix } from "@/components/clinical/CoverageMatrix";
import { AlertCard } from "@/components/clinical/AlertCard";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertCardSkeleton } from "@/components/skeletons";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Clock,
  Info,
} from "lucide-react";

export default function CheckResultsPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<FixtureCase | null>(
    INITIAL_FIXTURE_CASE,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const data = await api.getCase(caseId);
        setCaseData(data);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  const outcome = caseData?.checkResult?.data.outcome || "FLAGGED";
  const hasAlerts = caseData?.alerts && caseData.alerts.length > 0;
  const isClear = outcome === "NO_MATCHING_RULE" && !hasAlerts;

  const getOutcomeBadge = (): { variant: BadgeVariant; label: string } => {
    switch (outcome) {
      case "FLAGGED":
        return {
          variant: "high",
          label: "FLAGGED — Clinical Alerts Identified",
        };
      case "NO_MATCHING_RULE":
        return {
          variant: "info",
          label: "NO_MATCHING_RULE — No seeded rule matched in limited dataset",
        };
      case "INCOMPLETE":
        return {
          variant: "incomplete",
          label: "INCOMPLETE — Missing Required Clinical Context",
        };
      case "UNSUPPORTED":
        return {
          variant: "incomplete",
          label: "UNSUPPORTED — Medicine outside supported dataset",
        };
      case "FAILED":
        return {
          variant: "failed",
          label: "FAILED — Evaluation Interrupted (Fail-Closed)",
        };
      default:
        return { variant: "neutral", label: outcome };
    }
  };

  const outcomeInfo = getOutcomeBadge();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PipelineStepper currentStep={4} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
            Evaluation Outcome & Evidence Findings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Case:{" "}
            <span className="font-mono font-bold text-slate-800">{caseId}</span>{" "}
            • Revision {caseData?.currentRevisionNumber || 1}
          </p>
        </div>

        <div>
          <Badge variant={outcomeInfo.variant} className="text-xs py-1 px-3">
            {outcomeInfo.label}
          </Badge>
        </div>
      </div>

      <RuleNoticeBanner
        ruleSetVersion={caseData?.checkResult?.data.ruleSetVersion}
      />

      {loading ? (
        <AlertCardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Flagged Alerts Section */}
          {hasAlerts ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />{" "}
                  Identified Clinical Concerns ({caseData?.alerts?.length})
                </h2>
                <span className="text-[11px] text-amber-800 font-medium">
                  Dispensing Authorization Locked until Doctor Review
                </span>
              </div>

              {caseData?.alerts?.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  actionLabel="Hand off to Doctor Triage"
                  onAction={() => {
                    api.switchDemoRole("DOCTOR");
                    router.push("/doctor");
                  }}
                />
              ))}
            </div>
          ) : (
            /* Clean Result Display */
            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-600" />
                No matching illustrative rule triggered for this revision.
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                This indicates only that no seeded rule in the limited
                demonstration dataset matched the prescribed items. It is not a
                certification that the prescription is completely free of risk.
              </p>
            </div>
          )}

          {/* Category Coverage Matrix */}
          {caseData?.checkResult?.data.coverageByCategory && (
            <CoverageMatrix
              coverage={caseData.checkResult.data.coverageByCategory}
              ruleSetVersion={caseData.checkResult.data.ruleSetVersion}
            />
          )}

          {/* Bottom Workflow Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/pharmacist/cases/${caseId}/check`)}
              className="text-xs"
            >
              Re-evaluate Case
            </Button>

            {isClear ? (
              <Button
                size="md"
                variant="primary"
                onClick={() =>
                  router.push(`/pharmacist/cases/${caseId}/authorize`)
                }
                className="gap-2 text-xs w-full sm:w-auto"
              >
                Proceed to Dispensing Authorization{" "}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="md"
                variant="primary"
                onClick={() => {
                  api.switchDemoRole("DOCTOR");
                  router.push("/doctor");
                }}
                className="gap-2 text-xs w-full sm:w-auto bg-slate-900"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" /> Switch to
                Doctor Portal to Review Triage{" "}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
