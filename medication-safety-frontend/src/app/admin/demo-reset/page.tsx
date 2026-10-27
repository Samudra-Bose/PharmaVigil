"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { RotateCcw, AlertTriangle, ShieldAlert, ArrowLeft, Check } from "lucide-react";

export default function ScopedDemoResetPage() {
  const router = useRouter();
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const REQUIRED_PHRASE = "RESET-DEMO-METRO";
  const isMatch = confirmPhrase.trim() === REQUIRED_PHRASE;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.resetDemoWorkspace();
      setSuccess(true);
      setTimeout(() => {
        router.push("/pharmacist");
      }, 1500);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-rose-950 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-600" />
            Scoped Demo Workspace Reset
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset synthetic demonstration data to clean deterministic fixtures
          </p>
        </div>

        <Link href="/admin">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </Button>
        </Link>
      </div>

      {/* Safety Warning */}
      <div className="p-4 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2">
        <div className="font-bold flex items-center gap-2 text-rose-900">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          High-Consequence Administrative Action (REQ-SEC-006)
        </div>
        <p className="leading-relaxed">
          This operation will clear all captured outpatient prescriptions, re-seed the deterministic
          clinical scenario (Warfarin + Aspirin DDI for patient Rajan Sharma P-9021), and restore original staff personas.
          The reset is strictly scoped to the synthetic demo workspace.
        </p>
        <div className="font-mono text-[11px] text-rose-900/80 pt-1 border-t border-rose-200">
          Audit Guarantee: In accordance with clinical governance, the reset audit event itself is indelibly recorded and cannot be erased.
        </div>
      </div>

      {error && <ErrorDisplay error={error} />}

      {success ? (
        <div className="p-6 rounded-lg bg-teal-50 border border-teal-300 text-center space-y-2">
          <Check className="w-8 h-8 text-teal-600 mx-auto" />
          <h3 className="text-sm font-bold text-teal-950">
            Demo Workspace Successfully Reset
          </h3>
          <p className="text-xs text-teal-800">
            Deterministic fixtures restored. Redirecting to Pharmacist Pipeline...
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
          <div>
            <label htmlFor="confirm" className="block text-xs font-bold text-slate-800 mb-1">
              Type the confirmation phrase <span className="font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{REQUIRED_PHRASE}</span> to execute:
            </label>
            <input
              id="confirm"
              type="text"
              required
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder="RESET-DEMO-METRO"
              className="w-full p-2.5 font-mono text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="danger"
              disabled={!isMatch}
              loading={submitting}
              className="gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Execute Scoped Reset
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
