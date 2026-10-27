"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase, PatientRecord } from "@/lib/mock-data/fixtures";
import type { AlertSummary } from "@/types";
import { PatientIdentityCard } from "@/components/clinical/PatientIdentityCard";
import { AlertCard } from "@/components/clinical/AlertCard";
import { RuleNoticeBanner } from "@/components/clinical/RuleNoticeBanner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stethoscope, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function DoctorTaskDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const alertId = params.id as string;
  const caseId = searchParams.get("caseId") || "case_rx_9021_01";

  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const c = await api.getCase(caseId);
        setCaseData(c);
        const p = await api.getPatient(c.patientId);
        setPatient(p);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  const targetAlert = caseData?.alerts?.find((a) => a.id === alertId) || caseData?.alerts?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-slate-700" />
            Clinical Concern Case Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Case: <span className="font-mono font-bold text-slate-800">{caseId}</span> • Alert ID: {alertId}
          </p>
        </div>

        <Link href="/doctor">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Task Deck
          </Button>
        </Link>
      </div>

      <RuleNoticeBanner ruleSetVersion="v1.0.0-illustrative" />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient Context */}
          {patient && <PatientIdentityCard patient={patient} />}

          {/* Current Flagged Prescription Summary */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medications Under Evaluation (Revision {caseData?.currentRevisionNumber})
              </h3>
              <span className="font-mono text-[11px] text-slate-500">{caseData?.items.length} item(s)</span>
            </div>

            <div className="space-y-2">
              {caseData?.items.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.canonicalIngredientIds.join(", ")}</span>
                    {item.brandText && <span className="text-slate-500"> ({item.brandText})</span>}
                    <div className="text-[11px] text-slate-600 font-mono">
                      {item.strengthValue}{item.strengthUnit} • {item.dosageForm} • {item.frequency}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{item.durationValue} {item.durationUnit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged Alert Deep Dive */}
          {targetAlert && (
            <AlertCard
              alert={targetAlert}
              actionLabel="Proceed to Record Clinical Disposition"
              onAction={() =>
                router.push(`/doctor/tasks/${alertId}/disposition?caseId=${caseId}`)
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
