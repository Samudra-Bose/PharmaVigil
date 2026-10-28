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
  Calendar as CalendarIcon,
  Phone,
  ArrowRight,
  PlusCircle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  User,
  History,
  FileText,
  AlertCircle,
  Stethoscope,
  TrendingUp,
  HeartPulse,
  Sparkles,
  ArrowUpRight,
  Check,
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
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with clean typography & distinct button hierarchy */}
      <section
        aria-label="Patient Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Patient Care Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              MRN: <span className="font-semibold text-slate-700 font-mono">{patient?.syntheticHospitalPatientId || "P-9021"}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Welcome back, {patient?.displayName || "Rajan Sharma"}</span>
            <span>👋</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Cardiology Outpatient Clinic • <span className="font-semibold text-slate-700">Metro General Hospital</span> (Room 402)
          </p>
        </div>

        {/* Existing primary actions without awkward wrapping */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/patient/appointments/new">
            <button className="h-9 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <CalendarIcon data-icon="inline-start" className="size-3.5 text-slate-500" />
              <span>Book Visit</span>
            </button>
          </Link>

          <Link href="/patient/prescriptions">
            <button className="h-9 px-4 rounded-2xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/10 flex items-center gap-2 transition-all whitespace-nowrap">
              <Pill data-icon="inline-start" className="size-3.5 text-emerald-400" />
              <span>My Prescriptions</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 2. TOP TIER: 4-Card Bento Grid (3 Pastel + 1 Dark Action Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pastel Coral / Peach Squircle */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                <Pill className="size-5 text-amber-600" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Revision v{activeRx?.currentRevisionNumber || 1}
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Active Regimen</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cardiology Maintenance Therapy</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Prescribed</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{activeRx?.items.length || 2} Medicines</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Frequency</span>
              <span className="font-bold text-emerald-700 font-mono">Once Daily</span>
            </div>
          </div>
        </div>

        {/* Card 2: Clinical Safety Status */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-5 text-slate-700" />
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isReady ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80" : "bg-amber-50 text-amber-800 border border-amber-200/80"}`}>
                {isReady ? "Clear" : "In Review"}
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Safety Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pharmacist Drug Screening</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Review</span>
              <span className="font-bold text-slate-900">{isReady ? "Authorized" : "Pharmacist Review"}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Gate</span>
              <span className="font-bold text-slate-700 font-mono">Fails Closed</span>
            </div>
          </div>
        </div>

        {/* Card 3: Consultation Schedule (Soft Slate) */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <Stethoscope className="size-5 text-slate-700" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80">
                Scheduled
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Next Consultation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dr. Arvind Patel, MD</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Date</span>
              <span className="font-bold text-slate-900 font-mono">Oct 30, 2026</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Time</span>
              <span className="font-bold text-slate-700 font-mono">10:00 AM UTC</span>
            </div>
          </div>
        </div>

        {/* Card 4: DARK ACTION CARD */}
        <div className="bg-[#111317] rounded-3xl p-5 shadow-lux-black border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                <Building2 className="size-3.5" />
                <span>Pharmacy Counter</span>
              </div>
              <span className="size-2 rounded-full bg-emerald-400" />
            </div>

            <h3 className="text-base font-extrabold text-white leading-tight">
              {isReady ? "Ready for Pick-up" : "Counter Pick-up"}
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Ground Floor Counter 3 • Present Patient MRN: <span className="font-mono text-white font-bold">{patient?.syntheticHospitalPatientId || "P-9021"}</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            <Link
              href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}
              className="block"
            >
              <button className="w-full h-8 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                <span>View Dosing Schedule</span>
                <ArrowRight data-icon="inline-end" className="size-3 text-slate-950" />
              </button>
            </Link>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 3. MIDDLE TIER: Asymmetric 3-Column Bento (Adherence Activity + Daily Schedule + Mini Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1: Medication Adherence Hours Activity Chart (~45% width: 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Dose Adherence</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="size-3" />
                    100% adherence this week
                  </span>
                </div>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600">
                Weekly ⌵
              </div>
            </div>

            {/* Stylized Modern Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 relative">
                {/* Floating Tooltip above Thursday Bar */}
                <div className="absolute top-1 left-[54%] -translate-x-1/2 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg flex items-center gap-1 z-20 pointer-events-none">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>3 of 3 Doses Taken</span>
                </div>

                {/* Day Bars */}
                {[
                  { day: "Su", height: "h-28", active: false },
                  { day: "Mo", height: "h-32", active: false },
                  { day: "Tu", height: "h-36", active: false },
                  { day: "We", height: "h-36", active: false },
                  { day: "Th", height: "h-36", active: true },
                  { day: "Fr", height: "h-36", active: false },
                  { day: "Sa", height: "h-28", active: false },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full max-w-[14px] bg-slate-100 rounded-full h-36 flex items-end">
                      <div
                        className={`w-full rounded-full transition-all ${
                          item.active
                            ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                            : "bg-[#111317] group-hover:bg-slate-700"
                        } ${item.height}`}
                      />
                    </div>
                    <span className={`text-[11px] font-mono ${item.active ? "font-bold text-slate-900" : "text-slate-400"}`}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Overall Course Adherence:</span>
            <span className="font-semibold text-emerald-800 font-mono">96.4% Good</span>
          </div>
        </div>

        {/* Col 2: Daily Dosing Schedule ("Daily Schedule" in ref, ~35% width: 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Daily Schedule</h3>
              <span className="text-xs text-slate-400 font-medium">Cardiology Regimen</span>
            </div>

            {/* List with intentional clinical squircles & right chevrons */}
            <div className="divide-y divide-slate-100 mt-2">
              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <Pill className="size-4 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Morning Dose (08:00 AM)</div>
                    <div className="text-[11px] text-slate-500">Coumadin 5mg with water</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <Pill className="size-4 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Midday Maintenance (01:00 PM)</div>
                    <div className="text-[11px] text-slate-500">Metformin 500mg with meal</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0">
                    <Pill className="size-4 text-emerald-800" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Evening Dose (08:00 PM)</div>
                    <div className="text-[11px] text-slate-500">Disprin 100mg with water</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
                    <HeartPulse className="size-4 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Health Check & INR Log</div>
                    <div className="text-[11px] text-slate-500">Target INR: 2.0 - 3.0</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Prescribed by:</span>
            <span className="text-slate-700 font-medium">Dr. Arvind Patel</span>
          </div>
        </div>

        {/* Col 3: Mini Calendar & Clinical Consultations (~20% width: 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Calendar Widget */}
            <div className="flex items-center justify-between pb-2 text-xs">
              <span className="font-bold text-slate-900">October, 2026</span>
              <div className="flex items-center gap-1 text-slate-400">
                <ChevronLeft className="size-3.5 cursor-pointer hover:text-slate-700" />
                <ChevronRight className="size-3.5 cursor-pointer hover:text-slate-700" />
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono py-2 border-b border-slate-100">
              <span className="text-slate-400 font-bold">S</span>
              <span className="text-slate-400 font-bold">M</span>
              <span className="text-slate-400 font-bold">T</span>
              <span className="text-slate-400 font-bold">W</span>
              <span className="text-slate-400 font-bold">T</span>
              <span className="text-slate-400 font-bold">F</span>
              <span className="text-slate-400 font-bold">S</span>

              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isConsultationDay = day === 30;
                return (
                  <span
                    key={i}
                    className={`py-1 rounded-full text-[10px] flex items-center justify-center ${
                      isConsultationDay
                        ? "bg-slate-900 text-white font-extrabold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            {/* Appointments Widget */}
            <div className="mt-3">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-bold text-slate-900">Visits</span>
                <Link href="/patient/appointments/new">
                  <span className="size-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer">
                    +
                  </span>
                </Link>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[110px]">Warfarin Follow-up</div>
                    <div className="text-[10px] text-slate-400 font-mono">Oct 30, 10:00 AM</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Scheduled
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[110px]">INR Blood Test</div>
                    <div className="text-[10px] text-slate-400 font-mono">Nov 14, 08:30 AM</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    Lab
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
            Clinic: Room 402
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TIER: Prescriptions & Meds Ledger */}
      <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col gap-4">
        {/* Ledger Header & Navigation Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Prescription Regimen Details</span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                (Revision v{activeRx?.currentRevisionNumber || 1})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical dosages, manufacturer brands, and oral administration instructions.
            </p>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-2">
            <Link href="/patient/allergies">
              <button className="h-8 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 flex items-center gap-1.5 transition-all">
                <PlusCircle data-icon="inline-start" className="size-3.5 text-slate-500" />
                <span>Report Meds & Allergies</span>
              </button>
            </Link>

            <Link href="/patient/history">
              <button className="h-8 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 flex items-center gap-1.5 transition-all">
                <History data-icon="inline-start" className="size-3.5 text-slate-500" />
                <span>History</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Prescribed Medications Rows */}
        <div className="divide-y divide-slate-100">
          {activeRx?.items.map((item, idx) => (
            <div
              key={idx}
              className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors rounded-2xl px-2"
            >
              {/* Left: Squircle Icon + Drug + Brand */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Pill className="size-5 text-emerald-800" />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    {item.brandText ? (
                      <span className="font-semibold text-slate-700">{item.brandText}</span>
                    ) : null}
                    {item.brandText ? <span>•</span> : null}
                    <span>{item.dosageForm}</span>
                    <span>•</span>
                    <span className="text-slate-600">Oral administration with water</span>
                  </div>
                </div>
              </div>

              {/* Right: Frequency + Action */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/60">
                  {item.frequency}
                </span>

                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 font-mono">
                  <span>98% Adherent</span>
                </div>

                <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
                  <button className="h-8 px-3.5 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1 transition-all">
                    <span>Details</span>
                    <ArrowRight data-icon="inline-end" className="size-3 text-emerald-300" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Long-term Baseline Medications */}
        {patient?.activeMedications && patient.activeMedications.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 mb-2">
              Long-Term Baseline Maintenance
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

        {/* Safety Gating Status Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-500 shrink-0" />
            <span>
              {isReady
                ? "Prescription cleared by pharmacy. Ready for pickup."
                : "Dispensing unlocks after pharmacist clinical interaction check."}
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            Pharmacy Helpline: +91 11 2345 6789 (Mon-Sat 8:00 AM - 8:00 PM)
          </div>
        </div>
      </div>
    </div>
  );
}