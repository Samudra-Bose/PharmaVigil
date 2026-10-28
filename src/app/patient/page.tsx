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
import {
  Pill,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  ArrowRight,
  PlusCircle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  User,
  History,
  AlertCircle,
  Stethoscope,
  TrendingUp,
  HeartPulse,
  Sparkles,
} from "lucide-react";

function formatIngredientLabel(raw: string) {
  const map: Record<string, string> = {
    ing_warfarin: "Warfarin Sodium",
    ing_aspirin: "Aspirin Cardio",
    ing_atorvastatin: "Atorvastatin Calcium",
    ing_metformin: "Metformin HCl",
    ing_amoxicillin: "Amoxicillin",
    ing_lisinopril: "Lisinopril",
  };
  return map[raw] || raw.replace(/^ing_/, "").replace(/_/g, " ");
}

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

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Pinterest/Dribbble Modern Bento Header */}
      <section
        aria-label="Patient Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-violet-950 bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1 rounded-full border border-violet-300 shadow-xs flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600" />
              </span>
              Patient Care Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              MRN: <span className="font-semibold text-slate-700 font-mono">{patient?.syntheticHospitalPatientId || "P-9021"}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Cardiology Outpatient Clinic • <span className="font-semibold text-slate-700">Metro General Hospital</span> (Room 402)
          </p>
        </div>

        {/* Primary Navigation Actions with Radiant Glow */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/patient/appointments/new"
            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <CalendarIcon className="size-3.5 text-slate-500" />
            <span>Book Visit</span>
          </Link>

          <Link
            href="/patient/prescriptions"
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 via-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-glow-violet inline-flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Pill className="size-3.5 text-violet-100" />
            <span>My Prescriptions</span>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE HERO BENTO CARD: Royal Amethyst & Iris Ambient Regimen Card */}
      <section
        aria-label="Active Regimen"
        className="rounded-3xl bg-gradient-to-br from-[#1a0c32] via-[#2e1065] to-[#1e1b4b] border border-violet-500/30 text-white shadow-xl shadow-purple-950/20 p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Subtle Ambient Background Mesh */}
        <div className="absolute -right-20 -top-20 size-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 size-60 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-violet-800/40 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`size-13 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                isReady
                  ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-400/40 text-emerald-300"
                  : "bg-gradient-to-br from-amber-500/20 to-amber-600/30 border-amber-400/40 text-amber-300"
              }`}
            >
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs flex items-center gap-1.5 ${
                    isReady
                      ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                      : "bg-amber-500/20 text-amber-200 border-amber-400/30"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isReady ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                  {isReady ? "Ready for Pick-up" : "Awaiting Pharmacist Clinical Review (Fails Closed)"}
                </span>
                <span className="text-violet-400/40">•</span>
                <span className="text-xs font-mono font-medium text-violet-200">
                  Ground Floor Counter 3
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5 tracking-tight">
                Active Cardiology Maintenance Regimen
              </h2>
              <p className="text-xs sm:text-sm text-violet-200/80 mt-0.5 font-normal">
                Present Patient MRN: <span className="font-mono font-bold text-white">{patient?.syntheticHospitalPatientId || "P-9021"}</span> at pickup counter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-violet-400 to-fuchsia-300 hover:from-violet-300 hover:to-fuchsia-200 text-slate-950 font-extrabold text-xs shadow-lg shadow-violet-400/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>View Dosing Schedule</span>
              <ArrowRight className="size-3.5 text-slate-950" />
            </Link>
          </div>
        </div>

        {/* 3-Stat Pulse Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-violet-800/40 pt-4 relative z-10">
          <div className="px-3 py-2 first:pl-0">
            <div className="text-[11px] font-bold text-violet-300/70 uppercase tracking-wider">Prescribed Regimen</div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              Revision v{activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} Medicines
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[11px] font-bold text-violet-300/70 uppercase tracking-wider">Attending Physician</div>
            <div className="text-sm font-bold text-white mt-0.5">
              Dr. Arvind Patel, MD (Cardiology)
            </div>
          </div>
          <div className="px-3 py-2 last:pr-0">
            <div className="text-[11px] font-bold text-violet-300/70 uppercase tracking-wider">Safety Status</div>
            <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
              <span className={`size-2 rounded-full ${isReady ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              <span>{isReady ? "Dispensing Authorized" : "Interaction Verification Pending"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BALANCED BENTO GRID (8 Cols + 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Prescribed Items & Daily Administration Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section A: Verified Prescription Regimen Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Prescription Regimen Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified clinical dosages, manufacturer brands, and administration frequency.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/patient/medication-history"
                  className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="size-3.5 text-slate-500" />
                  <span>Report Meds</span>
                </Link>

                <Link
                  href="/patient/history"
                  className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <History className="size-3.5 text-slate-500" />
                  <span>History</span>
                </Link>
              </div>
            </div>

            {/* Prescribed Items Rows */}
            <div className="divide-y divide-slate-100">
              {activeRx?.items.map((item, idx) => {
                const ingredient = formatIngredientLabel(item.canonicalIngredientIds[0] || "");
                const primaryName = item.brandText ? `${item.brandText} (${ingredient})` : ingredient;
                return (
                  <div
                    key={idx}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-11 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <Pill className="size-5 text-violet-600" />
                      </div>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                          <span>{primaryName}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 border border-violet-200">
                            {item.strengthValue}{item.strengthUnit}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span>{item.dosageForm || "Oral Tablet"}</span>
                          <span>•</span>
                          <span className="text-slate-600">Take with water as prescribed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-800 border border-violet-200/80">
                        {item.frequency}
                      </span>

                      <Link
                        href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
                        className="h-8 px-3.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-all shadow-xs shadow-violet-600/15 cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight className="size-3 text-white/90" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Safety Gating Status Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500 shrink-0" />
                <span>
                  {isReady
                    ? "Prescription cleared by pharmacy. Ready for pickup."
                    : "Dispensing unlocks after pharmacist clinical interaction check."}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                Helpline: +91 11 2345 6789
              </div>
            </div>
          </div>

          {/* Section B: Daily Dosing Schedule (Clean Editorial Timeline) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daily Administration Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recommended daily dosing intervals</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                96.4% Adherence
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`} className="block group">
                <div className="py-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16">08:00 AM</span>
                    <div className="size-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                      <Pill className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        Morning Dose — Coumadin 5mg
                      </div>
                      <div className="text-[11px] text-slate-500">Oral tablet with water before breakfast</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>

              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`} className="block group">
                <div className="py-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16">01:00 PM</span>
                    <div className="size-8 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0">
                      <Pill className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        Midday Maintenance — Metformin 500mg
                      </div>
                      <div className="text-[11px] text-slate-500">Oral tablet with lunch</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>

              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`} className="block group">
                <div className="py-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16">08:00 PM</span>
                    <div className="size-8 rounded-lg bg-violet-50 border border-violet-200/80 text-violet-700 flex items-center justify-center shrink-0">
                      <Pill className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        Evening Dose — Disprin 100mg
                      </div>
                      <div className="text-[11px] text-slate-500">Oral tablet with water after dinner</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>

              <Link href="/patient/history" className="block group">
                <div className="py-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-rose-600 w-16">INR LOG</span>
                    <div className="size-8 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
                      <HeartPulse className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
                        Coagulation Monitoring (Target INR: 2.0 - 3.0)
                      </div>
                      <div className="text-[11px] text-slate-500">Last reported: 2.3 (Therapeutic window)</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Upcoming Visit & Clinical Adherence Bento */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Upcoming Consultation Bento Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Next Consultation</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Scheduled
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Dr. Arvind Patel, MD</div>
                <div className="text-xs text-slate-500">Cardiology Outpatient Clinic • Room 402</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Appointment Time</div>
                <div className="font-bold text-slate-900 font-mono mt-0.5">
                  {upcomingApt?.slotStart
                    ? new Date(upcomingApt.slotStart).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Oct 30, 2026 • 10:00 AM"}
                </div>
              </div>
              <Link
                href="/patient/appointments"
                className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors inline-flex items-center shadow-2xs cursor-pointer"
              >
                View
              </Link>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/patient/appointments"
                className="text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors"
              >
                All Visits ({appointments.length})
              </Link>
              <Link
                href="/patient/appointments/new"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                + Book Next Visit
              </Link>
            </div>
          </div>

          {/* Adherence & Health Stability Bento Card with SVG Conic Dial */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Course Adherence</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* SVG Radial Conic Ring */}
              <div className="relative size-16 shrink-0 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="96.4, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono text-[11px] font-extrabold text-slate-900">
                  96.4%
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">20 of 21 Doses</div>
                <p className="text-xs text-slate-500 mt-0.5">Zero missed doses recorded in the last 48 hours.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-bold">INR Status</div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5 font-mono">2.3 Optimal</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Safety Gate</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">Enforced</div>
              </div>
            </div>
          </div>

          {/* Pharmacy Helpline Bento */}
          <div className="bg-gradient-to-br from-slate-50 to-violet-50/30 rounded-2xl border border-slate-200 p-4 text-xs flex flex-col gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Phone className="size-3.5 text-violet-600" />
              <span>Pharmacy Care Helpline</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Questions regarding medication dosage or ground floor pickup counter?
            </p>
            <div className="font-mono font-bold text-slate-800 text-xs mt-1">
              +91 11 2345 6789 <span className="font-normal text-slate-400">(Ext. 402)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
