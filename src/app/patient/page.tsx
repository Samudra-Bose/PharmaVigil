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
  HeartPulse,
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* 1. Clean, Minimal Header */}
      <section
        aria-label="Patient Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2 border-b border-slate-200/80"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-teal-600" />
              Patient Care Hub
            </span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => copyPatientMRN(patient?.syntheticHospitalPatientId || "P-9021")}
              className="text-xs text-slate-500 font-medium inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
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

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Cardiology Outpatient Clinic • <span className="font-semibold text-slate-700">Metro General Hospital</span> (Room 402)
          </p>
        </div>

        {/* Primary Navigation Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/patient/appointments/new"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <CalendarIcon className="size-3.5 text-slate-500" />
            <span>Book Visit</span>
          </Link>

          <Link
            href="/patient/prescriptions"
            className="h-9 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Pill className="size-3.5 text-teal-100" />
            <span>My Prescriptions</span>
          </Link>
        </div>
      </section>

      {/* 2. Current Regimen & Pharmacy Pickup Status Card (Clean & Airy) */}
      <section
        aria-label="Active Regimen"
        className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div
              className={`size-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                isReady
                  ? "bg-teal-50 border-teal-200 text-teal-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    isReady
                      ? "bg-teal-50 text-teal-800 border-teal-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isReady ? "bg-teal-600" : "bg-amber-500 animate-pulse"}`} />
                  {isReady ? "Ready for Pharmacy Pick-up" : "Under Pharmacist Clinical Review (Fails Closed)"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">Ground Floor Counter 3</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Active Cardiology Maintenance Regimen
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Present Patient MRN <span className="font-mono font-bold text-slate-800">{patient?.syntheticHospitalPatientId || "P-9021"}</span> at pickup counter.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
              className="h-9 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>View Prescription Details</span>
              <ArrowRight className="size-3 text-teal-100" />
            </Link>
          </div>
        </div>

        {/* 3-Stat Pulse Bar (Clean, Light Minimal Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs text-slate-600">
          <div className="py-1 sm:pr-4">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">Prescribed Regimen</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              Revision v{activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} Medicines
            </span>
          </div>
          <div className="py-1 sm:px-4">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">Attending Physician</span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              Dr. Arvind Patel, MD (Cardiology)
            </span>
          </div>
          <div className="py-1 sm:pl-4">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">Safety Status</span>
            <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${isReady ? "bg-teal-600" : "bg-amber-500"}`} />
              <span>{isReady ? "Dispensing Authorized" : "Safety Check Pending"}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Daily Administration & Dose Tracker (Clean, Satisfying Checklist) */}
      <section
        aria-label="Daily Dosing Schedule"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col gap-4"
      >
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
        </div>
      </section>

      {/* 4. Upcoming Care & Appointments (Clean 2-Column Row) */}
      <section aria-label="Appointments and Care" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Visit Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-teal-600" />
              <span>Next Consultation</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Scheduled
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">
              {upcomingApt?.reason || "Cardiology Post-Discharge Follow-up"}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dr. Arvind Patel, MD • Friday, Nov 14 at 10:30 AM
            </p>
          </div>

          <Link
            href="/patient/appointments"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 pt-1"
          >
            <span>Manage Appointments</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Report Meds Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-teal-600" />
              <span>Medication Safety</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Up to date
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">
              Report Over-The-Counter Medicines & Allergies
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your record updated so our automated safety engine can screen new prescriptions against all your medications.
            </p>
          </div>

          <Link
            href="/patient/medication-history"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 pt-1"
          >
            <span>Report Medicines / Allergies</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
