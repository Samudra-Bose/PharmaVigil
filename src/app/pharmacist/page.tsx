"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  INITIAL_FIXTURE_CASE,
  type FixtureCase,
} from "@/lib/mock-data/fixtures";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Camera,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  User,
  Pill,
  X,
  Lock,
  ChevronRight,
  ChevronLeft,
  Activity,
  Layers,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Stethoscope,
  Building2,
  Check,
  Plus,
} from "lucide-react";

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadCases() {
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
    loadCases();
  }, []);

  const getStatusBadge = (
    status: FixtureCase["status"],
  ): { variant: BadgeVariant; label: string } => {
    switch (status) {
      case "CHECK_FLAGGED":
        return { variant: "high", label: "Flagged Concerns (DDI)" };
      case "DOCTOR_REVIEW":
        return { variant: "moderate", label: "Awaiting MD Review" };
      case "CHECK_PASSED":
        return { variant: "info", label: "Ready to Authorize" };
      case "DISPENSING_AUTHORIZED":
        return { variant: "authorized", label: "Dispensing Authorized" };
      case "DRAFT_CAPTURE":
        return { variant: "neutral", label: "Capture Draft" };
      case "MEDICINES_CONFIRMED":
        return { variant: "neutral", label: "Medicines Confirmed" };
      case "REVISED":
        return { variant: "moderate", label: "Doctor Revised" };
      default:
        return { variant: "neutral", label: status };
    }
  };

  const countFlagged = cases.filter(
    (c) => c.status === "CHECK_FLAGGED" || c.status === "REVISED",
  ).length;
  const countReady = cases.filter((c) => c.status === "CHECK_PASSED").length;
  const countAuthorized = cases.filter(
    (c) => c.status === "DISPENSING_AUTHORIZED",
  ).length;

  const filteredCases = cases.filter((c) => {
    let matchesStatus = true;
    if (filter === "NEEDS_ACTION") {
      matchesStatus =
        c.status === "CHECK_FLAGGED" ||
        c.status === "DRAFT_CAPTURE" ||
        c.status === "REVISED";
    } else if (filter === "READY") {
      matchesStatus = c.status === "CHECK_PASSED";
    } else if (filter === "AUTHORIZED") {
      matchesStatus = c.status === "DISPENSING_AUTHORIZED";
    }

    if (!matchesStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchPatient = c.patientId.toLowerCase().includes(q);
      const matchMed = c.items.some(
        (i) =>
          i.canonicalIngredientIds.some((ing) =>
            ing.toLowerCase().includes(q),
          ) ||
          (i.brandText && i.brandText.toLowerCase().includes(q)),
      );
      return matchId || matchPatient || matchMed;
    }

    return true;
  });

  const activeFlaggedCase = cases.find(
    (c) => c.status === "CHECK_FLAGGED" || c.status === "REVISED",
  );

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with clean typography & distinct button hierarchy */}
      <section
        aria-label="Welcome and Quick Actions"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              CDS Deterministic Verification
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Welcome back, Priya Sharma</span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Deterministic clinical safety verification, drug-drug interaction screening, and gated dispensing authorization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/pharmacist/patients/search">
            <button className="h-9 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <User data-icon="inline-start" className="size-3.5 text-slate-500" />
              <span>Search Patient</span>
            </button>
          </Link>

          <Link href="/pharmacist/capture">
            <button className="h-9 px-4 rounded-2xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/10 flex items-center gap-2 transition-all whitespace-nowrap">
              <Camera data-icon="inline-start" className="size-3.5 text-emerald-400" />
              <span>+ New Capture</span>
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
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                Requires Action
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Flagged Concerns</h3>
              <p className="text-xs text-slate-500 mt-0.5">DDI CYP3A4 Contraindications</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Severity</span>
              <span className="font-bold text-rose-700 font-mono">Severe DDI</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Cases</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{countFlagged} Blocked</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pastel Lime / Mint Squircle */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <Layers className="size-5 text-emerald-700" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active Queue
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Total Work Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Inpatient & Outpatient Rx</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Throughput</span>
              <span className="font-bold text-emerald-700 font-mono">98.6% Target</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Queue</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{cases.length} Total</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pastel Sky / Indigo Squircle */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-sky-50 border border-sky-100/80 text-sky-700 flex items-center justify-center shrink-0">
                <FileCheck2 className="size-5 text-sky-700" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                Deterministic
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Ready to Dispense</h3>
              <p className="text-xs text-slate-500 mt-0.5">Checks Cleared for Release</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Verified</span>
              <span className="font-bold text-sky-700 font-mono">100% Gated</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Released</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{countAuthorized} Authorized</span>
            </div>
          </div>
        </div>

        {/* Card 4: DARK ACTION CARD (Direct match to Eduplex reference) */}
        <div className="bg-[#111317] rounded-3xl p-5 shadow-lux-black border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                <ShieldCheck className="size-3.5" />
                <span>Gated Safety Engine</span>
              </div>
              <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <h3 className="text-base font-extrabold text-white leading-tight">
              Dispensing Gated
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Deterministic rule checks enforced. Dispensing fails closed until attending disposition.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 relative z-10 flex items-center justify-between gap-2">
            {activeFlaggedCase ? (
              <Link
                href={`/pharmacist/cases/${activeFlaggedCase.id}/results`}
                className="w-full"
              >
                <button className="w-full h-8 px-3 rounded-xl bg-[#bbf7d0] hover:bg-[#86efac] text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                  <span>Review Hazard</span>
                  <ArrowRight data-icon="inline-end" className="size-3 text-slate-950" />
                </button>
              </Link>
            ) : (
              <span className="text-xs font-mono text-emerald-400">All checks clear</span>
            )}
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 3. MIDDLE TIER: Asymmetric 3-Column Bento (Hours Activity + Daily Schedule + Mini Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1: Hours Activity / Verification Trends (~45% width: 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hours Activity</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="size-3" />
                    +14% vs last week
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
                  <span className="size-1.5 rounded-full bg-[#bbf7d0]" />
                  <span>6h 45 min • 14 Rx</span>
                </div>

                {/* Day Bars */}
                {[
                  { day: "Su", height: "h-14", active: false },
                  { day: "Mo", height: "h-28", active: false },
                  { day: "Tu", height: "h-20", active: false },
                  { day: "We", height: "h-36", active: false },
                  { day: "Th", height: "h-36", active: true },
                  { day: "Fr", height: "h-16", active: false },
                  { day: "Sa", height: "h-24", active: false },
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Safety Throughput:</span>
            <span className="font-semibold text-emerald-700 font-mono">100% Deterministic</span>
          </div>
        </div>

        {/* Col 2: Daily Schedule / Verification Pipeline (~35% width: 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Clinical Pipeline</h3>
              <span className="text-xs text-slate-400 font-medium">Deterministic CDS</span>
            </div>

            {/* List with squircle pastel icons & right chevrons */}
            <div className="divide-y divide-slate-100 mt-2">
              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Camera className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">OCR Capture</div>
                    <div className="text-[11px] text-slate-500">99.4% Confidence Score</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">DDI Interaction Check</div>
                    <div className="text-[11px] text-rose-600 font-medium">CYP3A4 Flagged (Severe)</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Stethoscope className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Physician Review</div>
                    <div className="text-[11px] text-slate-500">Attending: Dr. Sarah Chen</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Dispensing Gate</div>
                    <div className="text-[11px] text-amber-700 font-medium">Locked (Fails Closed)</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Audit Trail:</span>
            <span className="text-slate-700 font-mono">v1.0 Immutable</span>
          </div>
        </div>

        {/* Col 3: Mini Calendar & Priority Tasks (~20% width: 3 cols) */}
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
                <span className="text-xs font-bold text-slate-900">Tasks</span>
                <button
                  type="button"
                  className="size-4 rounded-full bg-[#bbf7d0] text-slate-950 flex items-center justify-center text-[10px] font-bold"
                  title="Add task"
                >
                  +
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900">Review case_rx_9021</div>
                    <div className="text-[10px] text-slate-400 font-mono">10:30 AM UTC</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Blocked
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-slate-900">Stock Reorder</div>
                    <div className="text-[10px] text-slate-400 font-mono">02:00 PM UTC</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Done
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
            Shift: Morning Clinical
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TIER: Active Prescriptions & Cases Ledger */}
      <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col gap-4">
        {/* Ledger Header & Segmented Pill Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Prescription Cases Ledger</span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                ({filteredCases.length} records)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review OCR extracts, deterministic checks, and authorized dispensing records.
            </p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl select-none self-start sm:self-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              All ({cases.length})
            </button>
            <button
              onClick={() => setFilter("NEEDS_ACTION")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === "NEEDS_ACTION"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Needs Action ({countFlagged})
            </button>
            <button
              onClick={() => setFilter("READY")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === "READY"
                  ? "bg-white text-teal-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Ready ({countReady})
            </button>
            <button
              onClick={() => setFilter("AUTHORIZED")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filter === "AUTHORIZED"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              Authorized ({countAuthorized})
            </button>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <PrescriptionTableSkeleton rowCount={4} className="my-2" />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title="No prescription cases match this filter"
            description="Search for a synthetic patient or create a new capture to begin the outpatient safety workflow."
            actionLabel="Search Patient (P-9021)"
            onAction={() =>
              (window.location.href = "/pharmacist/patients/search")
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              return (
                <div
                  key={c.id}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors rounded-2xl px-2"
                >
                  {/* Left: Squircle Icon + Case ID + Patient */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                      <Pill className="size-5 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900 font-tabular">
                          {c.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-600 flex items-center gap-1">
                          <User className="size-3 text-slate-400" />
                          {c.patientId}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          v{c.currentRevisionNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate max-w-md font-mono">
                        {c.items
                          .map((i) => i.canonicalIngredientIds.join(", "))
                          .join("; ")}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Badge + Date + CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <Badge
                      variant={statusInfo.variant}
                      className="text-xs whitespace-nowrap"
                    >
                      {statusInfo.label}
                    </Badge>

                    <span className="text-slate-400 font-mono text-[11px] hidden sm:inline-block">
                      {formatDateTime(c.updatedAt)}
                    </span>

                    <Link
                      href={
                        c.status === "CHECK_PASSED"
                          ? `/pharmacist/cases/${c.id}/authorize`
                          : c.status === "CHECK_FLAGGED"
                            ? `/pharmacist/cases/${c.id}/results`
                            : `/pharmacist/cases/${c.id}/medicines`
                      }
                    >
                      <button className="h-8 px-4 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                        <span>Review</span>
                        <ArrowRight data-icon="inline-end" className="size-3 text-emerald-300" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Synthetic Demo Patient Links */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Synthetic Patient Records:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/pharmacist/patients/confirm?id=P-9021"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-xl hover:bg-white text-slate-700 transition-colors shadow-2xs"
            >
              P-9021 (Rajan Sharma)
            </Link>
            <Link
              href="/pharmacist/patients/confirm?id=P-9022"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-xl hover:bg-white text-slate-700 transition-colors shadow-2xs"
            >
              P-9022 (Sunita Verma)
            </Link>
            <Link
              href="/pharmacist/patients/confirm?id=P-9023"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-xl hover:bg-white text-slate-700 transition-colors shadow-2xs"
            >
              P-9023 (Amit Kumar)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}