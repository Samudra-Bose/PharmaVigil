"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Kbd } from "@/components/ui/Kbd";
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
      clinicalToast.success(
        "Demo State Reset",
        "Workspace restored to pristine synthetic baseline."
      );
      setTimeout(() => {
        router.push("/pharmacist");
      }, 1500);
    } catch (err) {
      setError(err as Error);
      clinicalToast.error(err, "Reset Failed");
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

      {/* Safety Warning Alert */}
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold text-rose-950">High-Consequence Administrative Action (REQ-SEC-006)</AlertTitle>
        <AlertDescription className="text-rose-900 mt-1 space-y-2">
          <p className="leading-relaxed">
            This operation will clear all captured outpatient prescriptions, re-seed the deterministic
            clinical scenario (Warfarin + Aspirin DDI for patient Rajan Sharma P-9021), and restore original staff personas.
            The reset is strictly scoped to the synthetic demo workspace.
          </p>
          <div className="font-mono text-[11px] text-rose-900/80 pt-1 border-t border-rose-200/80">
            Audit Guarantee: In accordance with clinical governance, the reset audit event itself is indelibly recorded and cannot be erased.
          </div>
        </AlertDescription>
      </Alert>

      {error && <ErrorDisplay error={error} />}

      {success ? (
        <Card className="p-6 bg-teal-50 border-teal-300 text-center space-y-2">
          <Check className="w-8 h-8 text-teal-600 mx-auto" />
          <h3 className="text-sm font-bold text-teal-950">
            Demo Workspace Successfully Reset
          </h3>
          <p className="text-xs text-teal-800">
            Deterministic fixtures restored. Redirecting to Pharmacist Pipeline...
          </p>
        </Card>
      ) : (
        <Card className="shadow-2xs">
          <CardContent className="p-6 space-y-4 text-xs">
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label htmlFor="confirm" className="block text-xs font-bold text-slate-800 mb-1.5">
                  Type the confirmation phrase <Kbd className="font-mono text-rose-700 bg-rose-50 border-rose-300">{REQUIRED_PHRASE}</Kbd> to execute:
                </label>
                <Input
                  id="confirm"
                  type="text"
                  required
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                  placeholder="RESET-DEMO-METRO"
                  className="font-mono text-xs uppercase bg-white border-slate-300 focus-visible:ring-rose-500 focus-visible:border-rose-500"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
