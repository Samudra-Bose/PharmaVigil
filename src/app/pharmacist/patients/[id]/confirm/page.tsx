"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import type { PatientRecord } from "@/lib/mock-data/fixtures";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { PatientIdentityCard } from "@/components/clinical/PatientIdentityCard";
import { PatientIdentityCardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import {
  AlertCircle,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ConfirmPatientPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  useEffect(() => {
    async function fetchPatient() {
      try {
        setLoading(true);
        const data = await api.getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      } finally {
        setLoading(false);
      }
    }
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleProceed = () => {
    if (!confirmedCheck) return;
    clinicalToast.success(
      "Patient Identity Confirmed",
      `Linked to capture pipeline for ${patient?.displayName || "Patient"}`,
    );
    router.push(
      `/pharmacist/capture?patientId=${patient?.syntheticHospitalPatientId}`,
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PipelineStepper currentStep={1} />

      {/* Safety Gate Alert */}
      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">
            Mandatory Safety Gate (REQ-SAFE-001):
          </span>{" "}
          Explicit patient confirmation is required before linking any physical
          prescription image or manual capture. Verify patient name, synthetic
          ID, and DOB with a physical ID badge or verbal verification.
        </div>
      </div>

      {loading ? (
        <PatientIdentityCardSkeleton />
      ) : !patient ? (
        <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
          Patient record not found for ID "{patientId}".
        </div>
      ) : (
        <div className="space-y-6">
          <PatientIdentityCard patient={patient} />

          {/* Pharmacist Explicit Attestation Checkbox */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedCheck}
                onChange={(e) => setConfirmedCheck(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900">
                  I confirm that the prescription being processed belongs to{" "}
                  {patient.displayName} ({patient.syntheticHospitalPatientId}).
                </span>
                <p className="text-slate-500 mt-0.5">
                  This confirmation will be logged in the immutable audit trail
                  along with the pharmacist user ID and timestamp.
                </p>
              </div>
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs">
              <Link href="/pharmacist/patients/search">
                <ArrowLeft className="w-3.5 h-3.5" /> Cancel / Wrong Patient
              </Link>
            </Button>

            <Button
              size="md"
              variant="primary"
              disabled={!confirmedCheck}
              onClick={handleProceed}
              className="gap-2 text-xs w-full sm:w-auto"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" /> Confirm
              Identity & Proceed to Capture <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
