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

  // Interactive UI state for Charts, Calendar, and Filters
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "daily">("weekly");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(4); // Thursday
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(30);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const chartData = {
    weekly: [
      { day: "Su", taken: 3, total: 3, height: "h-28" },
      { day: "Mo", taken: 3, total: 3, height: "h-32" },
      { day: "Tu", taken: 3, total: 3, height: "h-36" },
      { day: "We", taken: 3, total: 3, height: "h-36" },
      { day: "Th", taken: 3, total: 3, height: "h-36" },
      { day: "Fr", taken: 3, total: 3, height: "h-36" },
      { day: "Sa", taken: 2, total: 3, height: "h-28" },
    ],
    monthly: [
      { day: "W1", taken: 21, total: 21, height: "h-32" },
      { day: "W2", taken: 20, total: 21, height: "h-30" },
      { day: "W3", taken: 21, total: 21, height: "h-36" },
      { day: "W4", taken: 21, total: 21, height: "h-36" },
    ],
    daily: [
      { day: "08h", taken: 1, total: 1, height: "h-36" },
      { day: "13h", taken: 1, total: 1, height: "h-36" },
      { day: "20h", taken: 1, total: 1, height: "h-36" },
    ],
  };

  const currentChartBars = chartData[timeRange];
  const safeActiveDayIndex = activeDayIndex >= currentChartBars.length ? 0 : activeDayIndex;
  const activeChartItem = currentChartBars[safeActiveDayIndex];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with calm typography & distinct button hierarchy */}
      <section
        aria-label="Patient Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
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

        {/* Primary Navigation Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/patient/appointments/new">
            <button className="h-9 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer">
              <CalendarIcon data-icon="inline-start" className="size-3.5 text-slate-500" />
              <span>Book Visit</span>
            </button>
          </Link>

          <Link href="/patient/prescriptions">
            <button className="h-9 px-4 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/10 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer">
              <Pill data-icon="inline-start" className="size-3.5 text-emerald-400" />
              <span>My Prescriptions</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 2. Prominent Active Regimen Focal Card (Calm Editorial Design) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-lux">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isReady 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isReady 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  {isReady ? "Ready for Pick-up" : "Awaiting Pharmacist Clinical Review (Fails Closed)"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  Ground Floor Counter 3
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Active Cardiology Maintenance Regimen
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Present Patient MRN: <span className="font-mono font-bold text-slate-800">{patient?.syntheticHospitalPatientId || "P-9021"}</span> at pickup counter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
              <button className="h-9 px-4 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer">
                <span>View Dosing Schedule</span>
                <ArrowRight data-icon="inline-end" className="size-3.5 text-emerald-400" />
              </button>
            </Link>
          </div>
        </div>

        {/* 3-Stat Pulse Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 pt-4">
          <div className="px-3 py-2 first:pl-0">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Prescribed Regimen</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
              Revision v{activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} Medicines
            </div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Attending Physician</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Dr. Arvind Patel, MD (Cardiology)
            </div>
          </div>
          <div className="px-3 py-2 last:pr-0">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Safety Status</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${isReady ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{isReady ? "Dispensing Authorized" : "Interaction Verification Pending"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Balanced Asymmetric 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Regimen Ledger, Daily Dosing Schedule, Baseline History */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section A: Verified Prescription Regimen */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-4">
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
                <Link href="/patient/medication-history">
                  <button className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer">
                    <PlusCircle data-icon="inline-start" className="size-3.5 text-slate-500" />
                    <span>Report Meds</span>
                  </button>
                </Link>

                <Link href="/patient/history">
                  <button className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 flex items-center gap-1.5 transition-all cursor-pointer">
                    <History data-icon="inline-start" className="size-3.5 text-slate-500" />
                    <span>History</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Prescribed Items Rows */}
            <div className="divide-y divide-slate-100">
              {activeRx?.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors rounded-xl px-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0">
                      <Pill className="size-4.5 text-emerald-800" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                        {item.brandText ? (
                          <span className="font-semibold text-slate-700">{item.brandText}</span>
                        ) : null}
                        {item.brandText ? <span>•</span> : null}
                        <span>{item.dosageForm}</span>
                        <span>•</span>
                        <span className="text-slate-600">Oral with water</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60">
                      {item.frequency}
                    </span>

                    <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
                      <button className="h-7 px-3 rounded-lg bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer">
                        <span>Details</span>
                        <ArrowRight data-icon="inline-end" className="size-3 text-emerald-400" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
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

          {/* Section B: Daily Dosing Schedule (Refined Editorial Timeline) */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daily Administration Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recommended daily dosing intervals</p>
              </div>
              <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                96.4% Course Adherence
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`} className="block group">
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16">08:00 AM</span>
                    <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
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
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16">01:00 PM</span>
                    <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
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
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16">08:00 PM</span>
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
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
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-600 w-16">INR LOG</span>
                    <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                      <HeartPulse className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
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

          {/* Section C: Long-term Baseline Medications */}
          {patient?.activeMedications && patient.activeMedications.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Long-Term Baseline Maintenance History</h3>
                <span className="text-xs font-mono text-slate-400">Baseline Records</span>
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
        </div>

        {/* Right Column (5 cols): Upcoming Visit, Adherence Chart, Mini Calendar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Upcoming Consultation Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900">Next Consultation</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Scheduled
              </span>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="size-11 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Dr. Arvind Patel, MD</div>
                <div className="text-xs text-slate-500">Cardiology Outpatient Clinic • Room 402</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Date & Time</div>
                <div className="font-bold text-slate-900 font-mono">Oct 30, 2026 • 10:00 AM</div>
              </div>
              <Link href="/patient/appointments">
                <button className="h-7 px-2.5 rounded-lg bg-white border border-slate-200/80 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer">
                  View Visit
                </button>
              </Link>
            </div>
          </div>

          {/* Dose Adherence Activity Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dose Adherence</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <TrendingUp className="size-3" />
                      100% adherence this week
                    </span>
                  </div>
                </div>
                <select
                  aria-label="Filter dose adherence by time range"
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value as "weekly" | "monthly" | "daily");
                    setActiveDayIndex(0);
                  }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              {/* Modern Minimal Bar Chart */}
              <div className="pt-5 pb-2">
                <div className="h-36 flex items-end justify-between gap-3 px-2 relative">
                  {/* Floating Tooltip */}
                  <div
                    className="absolute top-0 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1.5 z-20 pointer-events-none transition-all duration-200"
                    style={{
                      left: `${Math.max(15, Math.min(85, ((safeActiveDayIndex + 0.5) / currentChartBars.length) * 100))}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>
                      {activeChartItem.taken} of {activeChartItem.total} Taken
                    </span>
                  </div>

                  {/* Day Bars */}
                  {currentChartBars.map((item, i) => {
                    const isActive = i === safeActiveDayIndex;
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => setActiveDayIndex(i)}
                        aria-label={`${item.day}: ${item.taken} of ${item.total} doses taken`}
                        className="flex-1 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                      >
                        <div className="w-full max-w-[12px] bg-slate-100 rounded-full h-28 flex items-end">
                          <div
                            className={`w-full rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-emerald-600 ring-2 ring-emerald-300/50"
                                : "bg-slate-800 group-hover:bg-slate-700"
                            } ${item.height}`}
                          />
                        </div>
                        <span className={`text-[10px] font-mono transition-colors ${isActive ? "font-bold text-slate-900" : "text-slate-400"}`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Course Adherence:</span>
              <span className="font-semibold text-emerald-800 font-mono">96.4% Good</span>
            </div>
          </div>

          {/* Mini Calendar & Visits */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 text-xs">
                <span className="font-bold text-slate-900">
                  {monthNames[calendarMonth]}, {calendarYear}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
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
                  const isSelected = day === selectedCalendarDay;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedCalendarDay(day)}
                      className={`py-1 rounded-full text-[10px] flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Upcoming Clinic Visits */}
              <div className="mt-3">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-bold text-slate-900">Upcoming Visits</span>
                  <Link href="/patient/appointments/new">
                    <span className="size-4 rounded-full bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer transition-transform active:scale-95">
                      +
                    </span>
                  </Link>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <Link href="/patient/appointments" className="block group">
                    <div className="p-2 rounded-xl bg-slate-50/80 group-hover:bg-slate-100 border border-slate-100 flex items-center justify-between text-[11px] transition-colors">
                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-[130px] group-hover:text-emerald-800 transition-colors">Warfarin Follow-up</div>
                        <div className="text-[10px] text-slate-400 font-mono">Oct 30, 10:00 AM</div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Scheduled
                      </span>
                    </div>
                  </Link>

                  <Link href="/patient/appointments" className="block group">
                    <div className="p-2 rounded-xl bg-slate-50/80 group-hover:bg-slate-100 border border-slate-100 flex items-center justify-between text-[11px] transition-colors">
                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-[130px] group-hover:text-sky-800 transition-colors">INR Blood Test</div>
                        <div className="text-[10px] text-slate-400 font-mono">Nov 14, 08:30 AM</div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        Lab
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
              Clinic: Room 402
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
