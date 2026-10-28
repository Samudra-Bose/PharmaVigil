"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  FIXTURE_PATIENT,
  INITIAL_FIXTURE_CASE,
  INITIAL_FIXTURE_APPOINTMENTS,
  type PatientRecord,
  type FixtureCase,
  type AppointmentRecord,
} from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import {
  Pill,
  Clock,
  Calendar,
  Phone,
  ArrowRight,
  PlusCircle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  User,
  History,
  FileText,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

export default function PatientHomePage() {
  const [patient, setPatient] = useState<PatientRecord>(FIXTURE_PATIENT);
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(
    INITIAL_FIXTURE_APPOINTMENTS,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [p, c, apts] = await Promise.all([
          api.getPatient("P-9021"),
          api.getCases(),
          api.listAppointments({ patientId: "P-9021" }),
        ]);
        if (p) setPatient(p);
        if (c && c.length > 0) setCases(c);
        if (apts) setAppointments(apts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRx = cases[0];
  const isReady = activeRx?.status === "DISPENSING_AUTHORIZED";
  const upcomingApt = appointments.find((a) => a.status === "SCHEDULED");
  const pastAppointments = appointments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* 1. Editorial Patient Introduction (Directly on Canvas, No Outer Card) */}
      <section aria-label="Patient Greeting" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider font-mono">
              Patient Care Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              MRN: <span className="font-semibold text-slate-700">{patient?.syntheticHospitalPatientId || "P-9021"}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Cardiology Outpatient Clinic • <span className="font-semibold text-slate-700">Metro General Hospital</span> (Room 402)
          </p>
        </div>

        {/* Existing primary actions, aligned cleanly without wrapping */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/patient/appointments/new">
            <button className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Book Visit</span>
            </button>
          </Link>

          <Link href="/patient/prescriptions">
            <button className="h-9 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-all whitespace-nowrap">
              <Pill className="w-3.5 h-3.5 text-emerald-300" />
              <span>My Prescriptions</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 2. Asymmetric Two-Column Main Workspace (Section 3.C & 3.D) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Distinctive Active-Therapy Section (Main Visual Focus) */}
        <div className="lg:col-span-8 space-y-6">
          <section
            aria-label="Current Prescription Regimen"
            className="bg-white rounded-2xl shadow-lux border border-slate-100 p-6 sm:p-7 space-y-6"
          >
            {/* Regimen Header & Clinical Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                    Active Treatment Regimen
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-mono font-semibold text-slate-600">
                    Revision v{activeRx?.currentRevisionNumber || 1}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Cardiology Regimen (Dr. Arvind Patel)
                </h2>
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                {isReady ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-forest-900 border border-emerald-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Ready for Pharmacy Pick-up
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Under Pharmacist Safety Review
                  </span>
                )}
              </div>
            </div>

            {/* Prescribed Medications: Arranged as ELEGANT READABLE ROWS with subtle separators (NO NESTED CARDS) */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Prescribed Cardiovascular Medications ({activeRx?.items.length || 2})
              </div>

              <div className="divide-y divide-slate-100">
                {activeRx?.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-forest-50 border border-forest-100 text-forest-900 flex items-center justify-center shrink-0 mt-0.5">
                        <Pill className="w-4 h-4 text-forest-900" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.brandText ? (
                            <span className="font-semibold text-slate-700">{item.brandText}</span>
                          ) : null}
                          {item.brandText ? " • " : ""}
                          <span>{item.dosageForm}</span>
                          <span className="text-slate-300 mx-1.5">|</span>
                          <span className="text-slate-600">Oral administration with water</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60">
                        {item.frequency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Baseline Maintenance Therapy Section (from patient record) */}
            {patient?.activeMedications && patient.activeMedications.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Long-Term Baseline Medications
                </div>
                <div className="divide-y divide-slate-100">
                  {patient.activeMedications.map((med) => (
                    <div key={med.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{med.ingredientName} {med.dosage}</span>
                        <span className="text-slate-400 ml-1.5">({med.brandName})</span>
                        <span className="text-slate-500 ml-2">— {med.frequency}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Since {new Date(med.startedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Gating Status Notice & Footer Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {isReady
                    ? "Prescription cleared by pharmacy. Ready for pickup."
                    : "Dispensing unlocks after pharmacist clinical interaction check."}
                </span>
              </div>

              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`} className="shrink-0">
                <button className="h-8 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                  <span>View Dosing Schedule</span>
                  <ArrowRight className="w-3 h-3 text-emerald-300" />
                </button>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Balanced Secondary Modules (Upcoming Visit & Pickup Notice) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Module 1: Upcoming Clinical Consultation */}
          <section
            aria-label="Upcoming Consultation"
            className="bg-white rounded-2xl shadow-lux border border-slate-100 p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-900" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Upcoming Consultation
                </h3>
              </div>
              {upcomingApt && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Scheduled
                </span>
              )}
            </div>

            {upcomingApt ? (
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {upcomingApt.reason}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-forest-900 shrink-0" />
                  <span>{formatDateTime(upcomingApt.slotStart)}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Clinician: <span className="font-semibold text-slate-800">{upcomingApt.clinicianDisplayName}</span> ({upcomingApt.department})
                </div>
                {upcomingApt.notes && (
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100 italic">
                    "{upcomingApt.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">
                No upcoming consultations scheduled.
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link href="/patient/appointments" className="text-xs font-semibold text-slate-600 hover:text-forest-900 transition-colors">
                All Consultations ({appointments.length})
              </Link>
              <Link href="/patient/appointments/new" className="text-xs font-semibold text-forest-900 hover:text-forest-800 flex items-center gap-1">
                <span>Reschedule</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* Module 2: Pharmacy Counter Next-Step Notice (Distinctive high-craft surface) */}
          <section
            aria-label="Pharmacy Counter Pickup Notice"
            className="bg-forest-950 text-white rounded-2xl p-5 shadow-lux-black space-y-3"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Pharmacy Counter Pickup</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When your prescription is cleared, present your synthetic Patient MRN <span className="font-mono font-bold text-white">P-9021</span> at Outpatient Counter 3.
            </p>

            <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center justify-between">
                <span>Location:</span>
                <span className="text-slate-200">Ground Floor, Counter 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hours:</span>
                <span className="text-slate-200">8:00 AM – 8:00 PM (Mon–Sat)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Helpline:</span>
                <span className="text-slate-200">+91 11 2345 6789</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3. Care & Medication History Timeline (Section 3.E) */}
      <section
        aria-label="Care Timeline and Medication History"
        className="bg-white rounded-2xl shadow-lux border border-slate-100 p-6 sm:p-7 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Care & Medication Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of verified clinical appointments, prescription revisions, and dispensed therapies
            </p>
          </div>

          <Link href="/patient/history">
            <button className="h-8 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Full History</span>
            </button>
          </Link>
        </div>

        {/* Timeline Items */}
        <div className="space-y-4 pt-1">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-forest-900 flex items-center justify-center shrink-0 mt-0.5">
              <Pill className="w-4 h-4 text-forest-900" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">Prescription Issued (v1)</span>
                <span className="text-[11px] font-mono text-slate-400">Oct 27, 2026</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Dr. Arvind Patel prescribed Warfarin Sodium 5mg and Aspirin 100mg for cardiovascular anticoagulation management.
              </p>
            </div>
          </div>

          {pastAppointments.map((apt) => (
            <div key={apt.id} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Stethoscope className="w-4 h-4 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{apt.reason}</span>
                  <span className="text-[11px] font-mono text-slate-400">{new Date(apt.slotStart).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Completed consultation with {apt.clinicianDisplayName} ({apt.department}). {apt.notes || ""}
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">Chronic Maintenance Regimen Initiated</span>
                <span className="text-[11px] font-mono text-slate-400">Jan 15, 2024</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Started on Metformin HCl 500mg twice daily with meals for metabolic control.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
