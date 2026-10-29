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
  Check,
  Copy,
} from "lucide-react";
import { clinicalToast } from "@/lib/toast";

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

  const [dosesTaken, setDosesTaken] = useState<Record<string, boolean>>({
    morning: true,
    midday: true,
    evening: false,
  });
  const [copiedMRN, setCopiedMRN] = useState(false);

  const toggleDose = (id: string, name: string) => {
    setDosesTaken((prev) => {
      const nextVal = !prev[id];
      const updated = { ...prev, [id]: nextVal };
      if (nextVal) {
        clinicalToast.success(`Dose Logged: ${name}`, "Recorded as taken on schedule.");
      }
      return updated;
    });
  };

  const copyPatientMRN = (mrn: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(mrn);
      setCopiedMRN(true);
      clinicalToast.info("Patient MRN Copied", `${mrn} copied to clipboard.`);
      setTimeout(() => setCopiedMRN(false), 2000);
    }
  };

  const doseKeys = ["morning", "midday", "evening"];
  const completedDosesCount = doseKeys.filter((k) => dosesTaken[k]).length;
  const adherenceProgressPercent = Math.round((completedDosesCount / doseKeys.length) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Pinterest/Dribbble Modern Bento Header */}
      <section
        aria-label="Patient Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-900 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 shadow-2xs flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal-600" />
              Patient Care Hub
            </span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => copyPatientMRN(patient?.syntheticHospitalPatientId || "P-9021")}
              className="text-xs text-slate-500 font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full hover:bg-slate-100 transition-colors group cursor-pointer border border-transparent hover:border-slate-200"
              title="Click to copy Patient MRN"
              aria-label="Copy Patient MRN"
            >
              <span>MRN:</span>
              <span className="font-semibold text-slate-700 font-mono">
                {patient?.syntheticHospitalPatientId || "P-9021"}
              </span>
              {copiedMRN ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3 text-slate-400 group-hover:text-slate-600" />
              )}
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Cardiology Outpatient Clinic • <span className="font-semibold text-slate-700">Metro General Hospital</span> (Room 402)
          </p>
        </div>

        {/* Primary Navigation Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/patient/appointments/new"
            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <CalendarIcon className="size-3.5 text-slate-500" />
            <span>Book Visit</span>
          </Link>

          <Link
            href="/patient/prescriptions"
            className="h-10 px-5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-sm shadow-teal-800/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Pill className="size-3.5 text-teal-100" />
            <span>My Prescriptions</span>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE HERO BENTO CARD: Obsidian & Deep Surgical Teal */}
      <section
        aria-label="Active Regimen"
        className="rounded-3xl bg-gradient-to-br from-[#0c181b] via-[#112429] to-[#0a1417] border border-teal-500/25 text-white shadow-xl shadow-slate-950/20 p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Subtle Ambient Background Mesh */}
        <div className="absolute -right-20 -top-20 size-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 size-60 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-teal-900/40 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`size-13 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                isReady
                  ? "bg-teal-500/20 border-teal-400/30 text-teal-300"
                  : "bg-amber-500/20 border-amber-400/30 text-amber-300"
              }`}
            >
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1.5 ${
                    isReady
                      ? "bg-teal-500/20 text-teal-200 border-teal-400/30"
                      : "bg-amber-500/20 text-amber-200 border-amber-400/30"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isReady ? "bg-teal-400" : "bg-amber-400 animate-pulse"}`} />
                  {isReady ? "Ready for Pick-up" : "Awaiting Pharmacist Clinical Review (Fails Closed)"}
                </span>
                <span className="text-teal-400/40">•</span>
                <span className="text-xs font-mono font-medium text-teal-200">
                  Ground Floor Counter 3
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5 tracking-tight">
                Active Cardiology Maintenance Regimen
              </h2>
              <p className="text-xs sm:text-sm text-teal-200/80 mt-0.5 font-normal">
                Present Patient MRN: <span className="font-mono font-bold text-white">{patient?.syntheticHospitalPatientId || "P-9021"}</span> at pickup counter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
              className="h-11 px-6 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>View Dosing Schedule</span>
              <ArrowRight className="size-3.5 text-slate-950" />
            </Link>
          </div>
        </div>

        {/* 3-Stat Pulse Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-teal-900/40 pt-4 relative z-10">
          <div className="px-3 py-2 first:pl-0">
            <div className="text-[11px] font-bold text-teal-300/70 uppercase tracking-wider">Prescribed Regimen</div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              Revision v{activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} Medicines
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[11px] font-bold text-teal-300/70 uppercase tracking-wider">Attending Physician</div>
            <div className="text-sm font-bold text-white mt-0.5">
              Dr. Arvind Patel, MD (Cardiology)
            </div>
          </div>
          <div className="px-3 py-2 last:pr-0">
            <div className="text-[11px] font-bold text-teal-300/70 uppercase tracking-wider">Safety Status</div>
            <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
              <span className={`size-2 rounded-full ${isReady ? "bg-teal-400" : "bg-amber-400 animate-pulse"}`} />
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
                      <div className="size-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <Pill className="size-5 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                          <span>{primaryName}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
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
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        {item.frequency}
                      </span>

                      <Link
                        href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
                        className="h-8 px-3.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1 transition-all shadow-xs shadow-teal-700/20 cursor-pointer"
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

          {/* Section B: Daily Dosing Schedule (Interactive Adherence Checklist) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Daily Administration & Dose Tracker</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap any scheduled dose to record your administration on schedule
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  {completedDosesCount} of 3 Taken ({adherenceProgressPercent}%)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden -mt-1">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${adherenceProgressPercent}%` }}
              />
            </div>

            <div className="divide-y divide-slate-100">
              {/* Morning Dose */}
              <div
                className={`py-3 flex items-center justify-between rounded-xl px-2.5 transition-all ${
                  dosesTaken.morning ? "bg-teal-50/40" : "hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 w-16">08:00 AM</span>
                  <div className="size-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                    <Pill className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className={dosesTaken.morning ? "line-through text-slate-500" : ""}>
                        Morning Dose — Coumadin 5mg
                      </span>
                      {dosesTaken.morning && (
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          Taken
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">Oral tablet with water before breakfast</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleDose("morning", "Coumadin 5mg")}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      dosesTaken.morning
                        ? "bg-teal-600 text-white shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {dosesTaken.morning ? (
                      <>
                        <Check className="size-3 stroke-[3]" />
                        <span>Taken</span>
                      </>
                    ) : (
                      <span>Log Dose</span>
                    )}
                  </button>
                  <Link
                    href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>

              {/* Midday Maintenance */}
              <div
                className={`py-3 flex items-center justify-between rounded-xl px-2.5 transition-all ${
                  dosesTaken.midday ? "bg-teal-50/40" : "hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 w-16">01:00 PM</span>
                  <div className="size-8 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0">
                    <Pill className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className={dosesTaken.midday ? "line-through text-slate-500" : ""}>
                        Midday Maintenance — Metformin 500mg
                      </span>
                      {dosesTaken.midday && (
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          Taken
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">Oral tablet with lunch</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleDose("midday", "Metformin 500mg")}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      dosesTaken.midday
                        ? "bg-teal-600 text-white shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {dosesTaken.midday ? (
                      <>
                        <Check className="size-3 stroke-[3]" />
                        <span>Taken</span>
                      </>
                    ) : (
                      <span>Log Dose</span>
                    )}
                  </button>
                  <Link
                    href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>

              {/* Evening Dose */}
              <div
                className={`py-3 flex items-center justify-between rounded-xl px-2.5 transition-all ${
                  dosesTaken.evening ? "bg-teal-50/40" : "hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 w-16">08:00 PM</span>
                  <div className="size-8 rounded-lg bg-violet-50 border border-violet-200/80 text-violet-700 flex items-center justify-center shrink-0">
                    <Pill className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className={dosesTaken.evening ? "line-through text-slate-500" : ""}>
                        Evening Dose — Disprin 100mg
                      </span>
                      {dosesTaken.evening && (
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                          Taken
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">Oral tablet with water after dinner</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleDose("evening", "Disprin 100mg")}
                    className={`h-7 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      dosesTaken.evening
                        ? "bg-teal-600 text-white shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {dosesTaken.evening ? (
                      <>
                        <Check className="size-3 stroke-[3]" />
                        <span>Taken</span>
                      </>
                    ) : (
                      <span>Log Dose</span>
                    )}
                  </button>
                  <Link
                    href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title="View details"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>

              {/* INR Log Entry */}
              <Link href="/patient/history" className="block group">
                <div className="py-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2.5 transition-colors">
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
                <TrendingUp className="size-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Course Adherence</h3>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
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
                    className="text-teal-600"
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
                <div className="text-xs font-bold text-teal-800 mt-0.5 font-mono">2.3 Optimal</div>
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
