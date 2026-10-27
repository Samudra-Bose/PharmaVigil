"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { formatDateTime } from "@/lib/utils";
import { 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  FileCheck,
  Lock,
  ArrowRight 
} from "lucide-react";

export default function DispensingAuthorizePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

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

  const hasUnresolvedAlerts = caseData?.alerts && caseData.alerts.some((a) => a.status === "OPEN" || a.status === "CHANGE_REQUIRED");
  const isOutcomeClear = caseData?.checkResult?.data.outcome === "NO_MATCHING_RULE";
  const isAuthorized = caseData?.status === "DISPENSING_AUTHORIZED";

  const canAuthorize = !hasUnresolvedAlerts && isOutcomeClear && acknowledged && !isAuthorized;

  const handleAuthorize = async () => {
    if (!caseData || !canAuthorize) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.authorizeDispensing(caseId, caseData.currentRevisionNumber);
      const updated = await api.getCase(caseId);
      setCaseData(updated);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PipelineStepper currentStep={5} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-700" />
            Pharmacist Dispensing Workflow Authorization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Final workflow gate before physical medication dispensation at the hospital pharmacy
          </p>
        </div>

        {isAuthorized && (
          <Badge variant="authorized" className="text-xs py-1 px-3">
            Workflow Authorization Recorded
          </Badge>
        )}
      </div>

      {error && <ErrorDisplay error={error} title="Authorization Rejected by Safety Gates" />}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : isAuthorized ? (
        /* Successfully Authorized Card */
        <div className="bg-white rounded-lg border-2 border-teal-400 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dispensing Workflow Authorization Recorded
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Timestamp: {formatDateTime(caseData?.dispensingAuthorization?.authorizedAt)} • Authorized by: {caseData?.dispensingAuthorization?.authorizedBy}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Safety Notice:</span> This recorded state
            attests that all required workflow gates (patient identity confirmation, catalogue matching,
            rule check execution against Revision {caseData?.currentRevisionNumber}, and alert resolution)
            have been satisfied. It does not certify clinical infallibility or replace pharmacist professional vigilance.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/pharmacist/history`)}
              className="text-xs gap-1.5"
            >
              View Revision & Audit History <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => router.push("/pharmacist")}
              className="text-xs"
            >
              Return to Work Queue
            </Button>
          </div>
        </div>
      ) : (
        /* Authorization Checklist & Gate */
        <div className="space-y-6">
          {/* Gate Verification Checklist */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pre-Authorization Safety Gates (Server Revalidated)
            </h3>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-700">1. Patient Identity Confirmed:</span>
                <Badge variant="authorized">VERIFIED (P-9021)</Badge>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-700">2. Current Prescription Revision:</span>
                <span className="font-mono font-bold text-slate-900">Revision {caseData?.currentRevisionNumber}</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-700">3. Latest Check Outcome:</span>
                <Badge variant={isOutcomeClear ? "info" : "high"}>
                  {caseData?.checkResult?.data.outcome || "FLAGGED"}
                </Badge>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-700">4. Open Clinical Alerts Status:</span>
                {hasUnresolvedAlerts ? (
                  <Badge variant="critical">UNRESOLVED ALERTS PENDING</Badge>
                ) : (
                  <Badge variant="authorized">ZERO OPEN ALERTS</Badge>
                )}
              </div>
            </div>

            {hasUnresolvedAlerts && (
              <div className="p-3 bg-amber-50 rounded border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Authorization is locked because open clinical alerts exist on this case.
                  A doctor must review and record clinical disposition before dispensing can be authorized.
                </span>
              </div>
            )}

            {/* Mandatory Acknowledgement */}
            <div className="pt-3 border-t border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  disabled={hasUnresolvedAlerts || !isOutcomeClear}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">
                    I acknowledge that the workflow requirements have been satisfied (WORKFLOW_REQUIREMENTS_REVIEWED).
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    I have physically verified the dispensed medications against the confirmed items.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/pharmacist/cases/${caseId}/results`)}
              className="text-xs gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Findings
            </Button>

            <Button
              size="md"
              variant="primary"
              disabled={!canAuthorize}
              loading={submitting}
              onClick={handleAuthorize}
              className="gap-2 text-xs w-full sm:w-auto"
            >
              <Lock className="w-4 h-4 text-emerald-400" /> Record Workflow Authorization
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
