"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { RuleNoticeBanner } from "@/components/clinical/RuleNoticeBanner";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Play, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

export default function RunCheckPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCase() {
      try {
        const data = await api.getCase(caseId);
        setCaseData(data);
      } catch (err) {
        setError("Failed to load case data.");
      }
    }
    loadCase();
  }, [caseId]);

  const handleStartCheck = async () => {
    setEvaluating(true);
    setError(null);
    try {
      // Simulate server evaluation delay for visual feedback
      await new Promise((r) => setTimeout(r, 600));
      await api.runCheck(caseId);
      router.push(`/pharmacist/cases/${caseId}/results`);
    } catch (err) {
      setError((err as Error).message || "Rule engine execution failed. Fail-closed: No authorization permitted.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PipelineStepper currentStep={4} />

      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-700" />
          Deterministic Illustrative Safety Check
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Case: <span className="font-mono font-bold text-slate-800">{caseId}</span> • Revision {caseData?.currentRevisionNumber || 1}
        </p>
      </div>

      <RuleNoticeBanner ruleSetVersion="v1.0.0-illustrative" />

      {/* Input Verification Summary Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Evaluation Input Checklist
        </h3>

        <div className="space-y-2 text-xs divide-y divide-slate-100">
          <div className="pt-2 flex justify-between items-center">
            <span className="text-slate-600">Confirmed Prescription Items:</span>
            <span className="font-mono font-semibold text-slate-900">
              {caseData?.items.length || 2} items (Warfarin, Aspirin)
            </span>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-slate-600">Patient Allergy Profile Checked:</span>
            <span className="font-semibold text-slate-900">Penicillin, Sulfa</span>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-slate-600">Target Clinical Rule Engine:</span>
            <span className="font-mono font-semibold text-slate-800">
              Deterministic In-Memory Engine (v1.0.0)
            </span>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-slate-600">Failure Handling:</span>
            <span className="font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Fail-Closed Enforced
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 rounded-md border border-rose-300 text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button
            size="md"
            variant="primary"
            onClick={handleStartCheck}
            loading={evaluating}
            className="gap-2 text-xs"
          >
            {evaluating ? (
              <>Evaluating Seeded Rules...</>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" /> Execute Illustrative Check
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
