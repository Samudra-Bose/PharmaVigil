"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { PatientRecord, FixtureCase, AppointmentRecord } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/utils";
import { 
  Pill, 
  Clock, 
  Calendar, 
  Phone, 
  ArrowRight,
  PlusCircle,
  Building2,
  CheckCircle2
} from "lucide-react";

export default function PatientHomePage() {
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [p, c, apts] = await Promise.all([
          api.getPatient("P-9021"),
          api.getCases(),
          api.listAppointments({ patientId: "P-9021" }),
        ]);
        setPatient(p);
        setCases(c);
        setAppointments(apts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRx = cases[0];
  const isReady = activeRx?.status === "DISPENSING_AUTHORIZED";
  const upcomingApt = appointments.find((a) => a.status === "SCHEDULED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Warm Patient Welcome Header */}
      <section
        aria-label="Patient Welcome Header"
        className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              Patient Care
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {patient?.syntheticHospitalPatientId || "P-9021"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>
          <p className="text-xs text-slate-500">
            Outpatient care under <span className="font-medium text-slate-700">Metro General Hospital</span> • Cardiology Clinic
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href="/patient/appointments/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" /> Book Visit
            </Button>
          </Link>
          <Link href="/patient/prescriptions">
            <Button size="sm" variant="primary" className="gap-1.5 text-xs h-8 bg-slate-900 hover:bg-slate-800 shadow-2xs">
              <Pill className="w-3.5 h-3.5 text-teal-400" /> Prescriptions
            </Button>
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Medication Regimen Card */}
          <section
            aria-label="Active Medication Schedule"
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" /> Current Prescription
                </span>
                <Badge variant={isReady ? "authorized" : "moderate"} className="text-[11px]">
                  {isReady ? "Ready for Pharmacy Pick-up" : "Under Pharmacist Review"}
                </Badge>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Cardiology Regimen (Dr. Arvind Patel)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Prescription v{activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} medication{activeRx?.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-2">
                {activeRx?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-b-0">
                    <span className="font-semibold text-slate-900">{item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
                <Button size="sm" variant="outline" className="text-xs gap-1.5 font-medium h-8">
                  View Dosing Schedule <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Consultation Schedule or Pharmacy Counter */}
          <section
            aria-label="Appointments & Support"
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Appointment
                </span>
                {upcomingApt && <Badge variant="info">Scheduled</Badge>}
              </div>

              {upcomingApt ? (
                <div className="space-y-1.5">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {upcomingApt.reason}
                  </h2>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateTime(upcomingApt.slotStart)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Clinician: <span className="font-medium text-slate-800">{upcomingApt.clinicianDisplayName}</span> ({upcomingApt.department})
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-600">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Metro General Hospital Outpatient Pharmacy
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Open: 8:00 AM – 8:00 PM (Mon–Sat)
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Counter Helpline: +91 11 2345 6789
                  </div>
                </div>
              )}

              <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100 text-xs text-teal-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Always present synthetic patient ID <span className="font-mono font-semibold">P-9021</span> when collecting medicines at Counter 3.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link href="/patient/appointments" className="text-xs font-medium text-slate-600 hover:text-slate-900">
                All Consultations ({appointments.length})
              </Link>
              <Link href="/patient/history">
                <Button size="sm" variant="ghost" className="text-xs h-8">
                  Past Medication History
                </Button>
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
