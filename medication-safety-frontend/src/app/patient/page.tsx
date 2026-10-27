"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { PatientRecord, FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Pill, 
  Clock, 
  Calendar, 
  Building2, 
  Phone, 
  ArrowRight,
  ShieldCheck 
} from "lucide-react";

export default function PatientHomePage() {
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [p, c] = await Promise.all([
          api.getPatient("P-9021"),
          api.getCases(),
        ]);
        setPatient(p);
        setCases(c);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRx = cases[0];
  const isReady = activeRx?.status === "DISPENSING_AUTHORIZED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Welcome Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Patient Health Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hospital Patient ID: <span className="font-mono font-bold text-slate-800">{patient?.syntheticHospitalPatientId}</span> • Metro General Hospital
          </p>
        </div>

        <Link href="/patient/prescriptions">
          <Button size="sm" variant="outline" className="gap-2 text-xs">
            <Pill className="w-3.5 h-3.5" /> View My Medications
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton className="h-44 w-full" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Prescription Status Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" /> Active Outpatient Prescription
                </span>
                <Badge variant={isReady ? "authorized" : "moderate"}>
                  {isReady ? "Ready for Pharmacy Pick-up" : "Under Pharmacist Review"}
                </Badge>
              </div>

              <div>
                <div className="text-base font-bold text-slate-900">
                  Cardiology Outpatient Order (Dr. Arvind Patel)
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Revision {activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} prescribed medicines
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
                {activeRx?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="font-semibold text-slate-900">{item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}</span>
                    <span className="text-slate-500">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
                <Button size="sm" variant="primary" className="text-xs gap-1.5">
                  View Full Schedule & Instructions <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Pharmacy & Support Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Dispensing Hospital Pharmacy
              </span>

              <div className="text-sm font-semibold text-slate-900">
                Metro General Hospital Outpatient Pharmacy (Counter 3)
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Open Hours: 8:00 AM – 8:00 PM (Mon–Sat)
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Pharmacy Helpline: +91 11 2345 6789
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded border border-blue-200 text-xs text-blue-900">
                Have your synthetic patient ID <span className="font-mono font-bold">P-9021</span> ready when picking up your medicines at the counter.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link href="/patient/history">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  View Past Prescriptions History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
