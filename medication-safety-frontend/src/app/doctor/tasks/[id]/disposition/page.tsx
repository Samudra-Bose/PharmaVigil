"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { 
  Stethoscope, 
  FileEdit, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  ArrowRight 
} from "lucide-react";

export default function RecordDispositionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const alertId = params.id as string;
  const caseId = searchParams.get("caseId") || "case_rx_9021_01";

  const [dispositionType, setDispositionType] = useState<"CHANGE_REQUIRED" | "CLINICALLY_REVIEWED">("CHANGE_REQUIRED");
  const [rationale, setRationale] = useState(
    "Discontinue Aspirin to eliminate gastrointestinal bleeding risk with Warfarin. Substitute with Paracetamol 500mg for analgesia."
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isRationaleValid = rationale.trim().length >= 15;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRationaleValid) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.recordDoctorDisposition(alertId, dispositionType, rationale.trim());
      if (dispositionType === "CHANGE_REQUIRED") {
        // Direct physician immediately to revision editor
        router.push(`/doctor/prescriptions/new?caseId=${caseId}`);
      } else {
        router.push("/doctor");
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-slate-700" />
            Record Physician Clinical Disposition
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alert: <span className="font-mono font-bold text-slate-800">{alertId}</span> • Case: {caseId}
          </p>
        </div>

        <Link href={`/doctor/tasks/${alertId}?caseId=${caseId}`}>
          <Button size="sm" variant="ghost" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Case
          </Button>
        </Link>
      </div>

      {error && <ErrorDisplay error={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Disposition Selector Radio Cards */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Clinical Action & Disposition Decision
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Change Required Card */}
            <div
              onClick={() => setDispositionType("CHANGE_REQUIRED")}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                dispositionType === "CHANGE_REQUIRED"
                  ? "border-slate-900 bg-slate-50/80 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="disposition"
                  checked={dispositionType === "CHANGE_REQUIRED"}
                  onChange={() => setDispositionType("CHANGE_REQUIRED")}
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-bold text-slate-900">
                  Prescription Change Required
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-6">
                Acknowledge the flagged concern and issue a revised prescription (e.g. substitute or discontinue interacting drug).
              </p>
            </div>

            {/* Clinically Reviewed Card */}
            <div
              onClick={() => setDispositionType("CLINICALLY_REVIEWED")}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                dispositionType === "CLINICALLY_REVIEWED"
                  ? "border-slate-900 bg-slate-50/80 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="disposition"
                  checked={dispositionType === "CLINICALLY_REVIEWED"}
                  onChange={() => setDispositionType("CLINICALLY_REVIEWED")}
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs font-bold text-slate-900">
                  Benefit Outweighs Risk
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-6">
                Clinical benefit justifies the combination under close physician monitoring (e.g. frequent INR and CBC checks).
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Rationale Textarea */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="rationale" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Mandatory Clinical Rationale <span className="text-rose-600">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                isRationaleValid ? "text-emerald-700 font-semibold" : "text-amber-700"
              }`}
            >
              {rationale.length} / 15 min chars
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Explain the clinical reasoning for this decision. This statement is recorded in the permanent audit trail.
          </p>

          <textarea
            id="rationale"
            rows={4}
            required
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            className="w-full p-3 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
            placeholder="Document rationale, clinical justification, or replacement therapy instructions..."
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={!isRationaleValid}
            loading={submitting}
            className="gap-2 text-xs"
          >
            {dispositionType === "CHANGE_REQUIRED" ? (
              <>
                <FileEdit className="w-4 h-4 text-emerald-400" /> Submit & Create Revised Prescription <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Record Disposition & Clear Triage
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
