"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  INITIAL_FIXTURE_CASE,
  type FixtureCase,
} from "@/lib/mock-data/fixtures";
import type { AlertSummary } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { formatDateTime } from "@/lib/utils";
import {
  Stethoscope,
  AlertTriangle,
  FileText,
  ArrowRight,
  ShieldAlert,
  PlusCircle,
  Calendar as CalendarIcon,
  Lock,
  ChevronRight,
  ChevronLeft,
  User,
  Pill,
  CheckCircle2,
  Activity,
  TrendingUp,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";

export default function DoctorDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCases();
        if (data && data.length > 0) {
          setCases(data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tasks: Array<{
    caseId: string;
    alert: AlertSummary;
    revisionNumber: number;
    patientId: string;
  }> = [];
  cases.forEach((c) => {
    c.alerts?.forEach((a) => {
      tasks.push({
        caseId: c.id,
        alert: a,
        revisionNumber: c.currentRevisionNumber,
        patientId: c.patientId,
      });
    });
  });

  const severityRank: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MODERATE: 3,
    LOW: 4,
  };

  tasks.sort(
    (a, b) =>
      (severityRank[a.alert.severity] || 5) -
      (severityRank[b.alert.severity] || 5),
  );

  const countCritical = tasks.filter(
    (t) => t.alert.severity === "CRITICAL",
  ).length;

  const getSeverityVariant = (sev: string): BadgeVariant => {
    switch (sev) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "high";
      case "MODERATE":
        return "moderate";
      default:
        return "info";
    }
  };

  const primaryTask = tasks[0];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Eduplex-Style Greeting & Actions Header */}
      <section
        aria-label="Doctor Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Attending Physician Disposition
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Welcome back, Dr. Arvind Patel</span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Prioritized clinical triage of automated CDS safety checks requiring attending physician rationale.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/doctor/appointments">
            <button className="h-9 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Consultations</span>
            </button>
          </Link>

          <Link href="/doctor/prescriptions">
            <button className="h-9 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Prescriptions</span>
            </button>
          </Link>

          <Link href="/doctor/prescriptions/new">
            <button className="h-9 px-4 rounded-2xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/10 flex items-center gap-2 transition-all whitespace-nowrap">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ New Revision</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 2. TOP TIER: 4-Card Bento Grid (Direct match to Eduplex reference: 3 Pastel + 1 Dark Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pastel Peach Squircle */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                Critical Alert
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Critical Conflicts</h3>
              <p className="text-xs text-slate-500 mt-0.5">CYP3A4 Statin Contraindications</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Severity</span>
              <span className="font-bold text-rose-700 font-mono">High Hazard</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Requiring Sign-off</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{tasks.length} Cases</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pastel Lime Squircle */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Deck
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Clinical Triage</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated Safety Screening</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Resolution Rate</span>
              <span className="font-bold text-emerald-700 font-mono">94.2% Cleared</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Assigned</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">Cardiology Unit</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pastel Sky Squircle */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100/80 text-sky-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-sky-700" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                Inpatient
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Patient Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active Monitored Regimens</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Primary Bed</span>
              <span className="font-bold text-slate-900 font-mono">Room 402</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Patient</span>
              <span className="font-bold text-sky-700 font-mono">P-9021</span>
            </div>
          </div>
        </div>

        {/* Card 4: DARK EDU-ACTION CARD (Direct match to Eduplex "Go Premium" card) */}
        <div className="bg-[#111317] rounded-3xl p-5 shadow-lux-black border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Physician Gate</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <h3 className="text-base font-extrabold text-white leading-tight">
              Disposition Gate
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Dispensing locked. Requires attending physician override rationale (≥15 characters) or therapy revision.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            {primaryTask ? (
              <Link
                href={`/doctor/cases/${primaryTask.caseId}/disposition`}
                className="block"
              >
                <button className="w-full h-8 px-3 rounded-xl bg-[#bbf7d0] hover:bg-[#86efac] text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                  <span>Sign Disposition</span>
                  <ArrowRight className="w-3 h-3 text-slate-950" />
                </button>
              </Link>
            ) : (
              <span className="text-xs font-mono text-emerald-400">All alerts cleared</span>
            )}
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 3. MIDDLE TIER: Asymmetric 3-Column Bento (Hours Activity + Daily Schedule + Mini Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1: Resolution Activity Hours Chart (~45% width: 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Resolution Throughput</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="w-3 h-3" />
                    +8% faster disposition
                  </span>
                </div>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600">
                Weekly ⌵
              </div>
            </div>

            {/* Stylized Modern Bar Chart (Direct match to Eduplex Hours Activity Chart) */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 relative">
                {/* Floating Tooltip above Thursday Bar (Eduplex Feature) */}
                <div className="absolute top-1 left-[54%] -translate-x-1/2 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg flex items-center gap-1 z-20 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bbf7d0]" />
                  <span>4 Cases Resolved • 2h 15m</span>
                </div>

                {/* Day Bars */}
                {[
                  { day: "Su", height: "h-16", active: false },
                  { day: "Mo", height: "h-24", active: false },
                  { day: "Tu", height: "h-28", active: false },
                  { day: "We", height: "h-36", active: false },
                  { day: "Th", height: "h-36", active: true },
                  { day: "Fr", height: "h-20", active: false },
                  { day: "Sa", height: "h-12", active: false },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full max-w-[14px] bg-slate-100 rounded-full h-36 flex items-end">
                      <div
                        className={`w-full rounded-full transition-all ${
                          item.active
                            ? "bg-[#bbf7d0] shadow-sm shadow-emerald-400/30"
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Clinical Audit Standard:</span>
            <span className="font-semibold text-emerald-700">100% Deterministic</span>
          </div>
        </div>

        {/* Col 2: Daily Clinical Schedule ("Daily Schedule" in ref, ~35% width: 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Clinical Schedule</h3>
              <span className="text-[10px] font-mono text-slate-400">Cardiology Ward</span>
            </div>

            {/* List with squircle pastel icons & right chevrons (Eduplex "Daily Schedule" style) */}
            <div className="divide-y divide-slate-100 mt-2">
              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Morning Ward Rounds</div>
                    <div className="text-[11px] text-slate-500">Inpatient Unit (Room 402)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">DDI Triage & Disposition</div>
                    <div className="text-[11px] text-rose-600 font-medium">case_rx_9021_01 Conflict</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Therapy Re-authorization</div>
                    <div className="text-[11px] text-slate-500">3 Pending Attending Signatures</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Outpatient Consultation</div>
                    <div className="text-[11px] text-slate-500">10:00 AM UTC (Rajan Sharma)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Attending License:</span>
            <span className="text-slate-700 font-medium">MD-CARD-7491</span>
          </div>
        </div>

        {/* Col 3: Mini Calendar & Clinical Tasks (~20% width: 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Calendar Widget (Eduplex Mini Calendar) */}
            <div className="flex items-center justify-between pb-2 text-xs">
              <span className="font-bold text-slate-900">October, 2026</span>
              <div className="flex items-center gap-1 text-slate-400">
                <ChevronLeft className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700" />
                <ChevronRight className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700" />
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
                const isSelected = day === 28;
                return (
                  <span
                    key={i}
                    className={`py-1 rounded-full text-[10px] flex items-center justify-center ${
                      isSelected
                        ? "bg-[#bbf7d0] text-slate-950 font-extrabold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            {/* Tasks Widget */}
            <div className="mt-3">
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-bold text-slate-900">Triage Tasks</span>
                <span className="w-4 h-4 rounded-full bg-[#bbf7d0] text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  +
                </span>
              </div>

              <div className="space-y-2 mt-1">
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[110px]">Sign CYP3A4 Override</div>
                    <div className="text-[10px] text-slate-400 font-mono">case_rx_9021</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    High
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[110px]">Sign Discharge Rx</div>
                    <div className="text-[10px] text-slate-400 font-mono">P-9022</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Done
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
            Dept: Cardiology
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TIER: Clinical Safety Queue Ledger (Eduplex "Course You're Taking" Style) */}
      <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100 space-y-4">
        {/* Ledger Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Prioritized Safety Triage Queue</span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                ({tasks.length} cases requiring review)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review pharmacological evidence, drug alternatives, and provide required clinical rationale.
            </p>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-mono">Loading clinical cases...</div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="All clinical safety flags resolved"
            description="No active drug-drug interaction or contraindication flags currently require physician review."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((t) => (
              <div
                key={`${t.caseId}-${t.alert.ruleId}`}
                className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors rounded-2xl px-2"
              >
                {/* Left: Squircle Icon + Case ID + Rule */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-700" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 font-tabular">
                        {t.caseId}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-xs text-slate-600 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {t.patientId}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        v{t.revisionNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 truncate max-w-md font-medium">
                      Rule: {t.alert.ruleId} — {t.alert.rationale}
                    </div>
                  </div>
                </div>

                {/* Right: Severity Badge + Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <Badge
                    variant={getSeverityVariant(t.alert.severity)}
                    className="text-xs whitespace-nowrap"
                  >
                    {t.alert.severity}
                  </Badge>

                  <Link href={`/doctor/cases/${t.caseId}/disposition`}>
                    <button className="h-8 px-4 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                      <span>Disposition</span>
                      <ArrowRight className="w-3 h-3 text-emerald-300" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}