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
import { clinicalToast } from "@/lib/toast";
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

  // Interactive UI state for Charts, Calendar, and Tasks
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "daily">("weekly");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(4); // Thursday
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(28);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [tasksList, setTasksList] = useState([
    { id: "task-1", title: "Review case_rx_9021", time: "10:30 AM UTC", status: "Blocked", href: "/pharmacist/cases/case_rx_9021_01/results" },
    { id: "task-2", title: "Stock Reorder", time: "02:00 PM UTC", status: "Done", href: "" },
  ]);

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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      time: "Just now",
      status: "In Progress",
      href: "",
    };
    setTasksList([newTask, ...tasksList]);
    setNewTaskTitle("");
    setShowAddTask(false);
    clinicalToast.success("Task Added", `Scheduled: ${newTask.title}`);
  };

  const toggleTaskStatus = (id: string) => {
    setTasksList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "Done" ? "Blocked" : t.status === "Blocked" ? "In Progress" : "Done";
          clinicalToast.info("Task Updated", `${t.title} is now ${nextStatus}`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

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
      {/* 1. Header with Editorial Elegance & Clear Primary CTA */}
      <section
        aria-label="Welcome and Quick Actions"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              CDS Deterministic Verification
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Welcome back, Priya Sharma</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time drug-drug interaction screening, deterministic CDS verification, and gated outpatient dispensing.
          </p>
        </div>

        {/* Primary Operational Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/pharmacist/patients/search">
            <button className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/80 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <User data-icon="inline-start" className="size-3.5 text-slate-500" />
              <span>Search Patient</span>
            </button>
          </Link>

          <Link href="/pharmacist/capture">
            <button className="h-9 px-4 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-all whitespace-nowrap">
              <Camera data-icon="inline-start" className="size-3.5 text-emerald-300" />
              <span>+ Capture Prescription</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 2. OPERATIONAL PULSE: Unified Metrics Strip with Restrained Hierarchy */}
      <section aria-label="Operational Overview" className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Metric 1: Flagged Concerns */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Flagged Concerns</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70">
                Action Required
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-slate-900 font-tabular font-mono">
                {countFlagged} Blocked
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">CYP3A4 Contraindications</p>
            </div>
          </div>

          {/* Metric 2: Active Work Queue */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Work Queue</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Active Deck
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-slate-900 font-tabular font-mono">
                {cases.length} Cases
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">Inpatient & Outpatient Rx</p>
            </div>
          </div>

          {/* Metric 3: Ready for Dispensing */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Authorized Release</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                100% Gated
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-slate-900 font-tabular font-mono">
                {countAuthorized} Dispensed
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">Pharmacist Authorized</p>
            </div>
          </div>

          {/* Metric 4: Gated Safety Engine Action */}
          <div className="p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>Safety Gate</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 font-semibold">Fails Closed</span>
            </div>
            <div className="mt-2">
              {activeFlaggedCase ? (
                <Link href={`/pharmacist/cases/${activeFlaggedCase.id}/results`} className="block">
                  <button className="w-full h-7 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] shadow-2xs flex items-center justify-center gap-1.5 transition-all">
                    <span>Inspect Hazard ({activeFlaggedCase.id})</span>
                    <ArrowRight className="size-3 text-emerald-400" />
                  </button>
                </Link>
              ) : (
                <span className="text-xs text-slate-500 font-mono">All clinical checks clear</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN OPERATIONAL WORKSPACE: 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column (8 cols): Queue + Pipeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Work Queue Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            {/* Header + Unified Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Prescription Safety Queue</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {filteredCases.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review OCR extractions, deterministic rule checks, and dispensing approvals.
                </p>
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl select-none self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({cases.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("NEEDS_ACTION")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filter === "NEEDS_ACTION"
                      ? "bg-white text-rose-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Action ({countFlagged})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("READY")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filter === "READY"
                      ? "bg-white text-teal-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready ({countReady})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("AUTHORIZED")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filter === "AUTHORIZED"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Released ({countAuthorized})
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
                      className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-xl px-2"
                    >
                      {/* Left: Pill Icon + Case ID + Patient */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                          <Pill className="size-4 text-slate-700" />
                        </div>
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 font-tabular">
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
                          <div className="text-xs text-slate-600 truncate max-w-sm sm:max-w-md font-mono">
                            {c.items
                              .map((i) => i.canonicalIngredientIds.join(", "))
                              .join("; ")}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge + Date + CTA */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        <Badge
                          variant={statusInfo.variant}
                          className="text-xs whitespace-nowrap"
                        >
                          {statusInfo.label}
                        </Badge>

                        <Link
                          href={
                            c.status === "CHECK_PASSED"
                              ? `/pharmacist/cases/${c.id}/authorize`
                              : c.status === "CHECK_FLAGGED"
                                ? `/pharmacist/cases/${c.id}/results`
                                : `/pharmacist/cases/${c.id}/medicines`
                          }
                        >
                          <button className="h-7 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all">
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
                  href="/pharmacist/patients/P-9021/confirm"
                  className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs"
                >
                  P-9021 (Rajan)
                </Link>
                <Link
                  href="/pharmacist/patients/P-9022/confirm"
                  className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs"
                >
                  P-9022 (Sunita)
                </Link>
                <Link
                  href="/pharmacist/patients/P-9023/confirm"
                  className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs"
                >
                  P-9023 (Amit)
                </Link>
              </div>
            </div>
          </div>

          {/* Clinical Verification Pipeline (Clean, Compact Stepper) */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Verification Pipeline</h3>
                <p className="text-[11px] text-slate-500">Deterministic CDS lifecycle stages for active prescription</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full font-semibold">
                Fails Closed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <Link href="/pharmacist/capture" className="block group">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 group-hover:bg-slate-100/70 group-hover:border-slate-200 transition-all flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 1</span>
                    <Camera className="size-3.5 text-slate-500 group-hover:text-slate-800" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">OCR Capture</div>
                  <div className="text-[11px] text-slate-500">99.4% confidence</div>
                </div>
              </Link>

              <Link href={`/pharmacist/cases/${activeFlaggedCase?.id || "case_rx_9021_01"}/results`} className="block group">
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/60 group-hover:bg-rose-50 group-hover:border-rose-300 transition-all flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">Step 2</span>
                    <ShieldAlert className="size-3.5 text-rose-600" />
                  </div>
                  <div className="text-xs font-bold text-rose-900 mt-0.5">DDI Screening</div>
                  <div className="text-[11px] text-rose-700 font-medium">CYP3A4 Flagged</div>
                </div>
              </Link>

              <Link href="/doctor" className="block group">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 group-hover:bg-slate-100/70 group-hover:border-slate-200 transition-all flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 3</span>
                    <Stethoscope className="size-3.5 text-slate-500 group-hover:text-slate-800" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">MD Review</div>
                  <div className="text-[11px] text-slate-500">Dr. Arvind Patel</div>
                </div>
              </Link>

              <Link href={`/pharmacist/cases/${activeFlaggedCase?.id || "case_rx_9021_01"}/authorize`} className="block group">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 group-hover:bg-slate-100/70 group-hover:border-slate-200 transition-all flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 4</span>
                    <Lock className="size-3.5 text-slate-500 group-hover:text-slate-800" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">Dispensing Gate</div>
                  <div className="text-[11px] text-amber-700 font-medium">Locked (Closed)</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Supporting Contextual Rail (4 cols): Hours Chart + Calendar + Tasks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Hours Activity & Throughput Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hours Activity</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      <TrendingUp className="size-3" />
                      +14% vs last week
                    </span>
                  </div>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  aria-label="Filter Hours Activity Range"
                  className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              {/* Stylized Modern Bar Chart */}
              <div className="pt-5 pb-2">
                <div className="h-36 flex items-end justify-between gap-2 px-1 relative">
                  {/* Floating Tooltip */}
                  <div
                    className="absolute top-0 -translate-x-1/2 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1 z-20 pointer-events-none transition-all duration-200"
                    style={{
                      left: `${((activeDayIndex + 0.5) / 7) * 100}%`,
                    }}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>
                      {activeDayIndex === 4
                        ? "6h 45m • 14 Rx"
                        : activeDayIndex === 3
                          ? "7h 10m • 16 Rx"
                          : "4h 30m • 8 Rx"}
                    </span>
                  </div>

                  {/* Day Bars */}
                  {[
                    { day: "Su", height: "h-12" },
                    { day: "Mo", height: "h-24" },
                    { day: "Tu", height: "h-16" },
                    { day: "We", height: "h-28" },
                    { day: "Th", height: "h-28" },
                    { day: "Fr", height: "h-14" },
                    { day: "Sa", height: "h-20" },
                  ].map((item, i) => {
                    const isActive = activeDayIndex === i;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setActiveDayIndex(i)}
                        className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                        title={`Select ${item.day}`}
                      >
                        <div className="w-full max-w-[12px] bg-slate-100 rounded-full h-28 flex items-end">
                          <div
                            className={`w-full rounded-full transition-all ${
                              isActive
                                ? "bg-emerald-600 shadow-xs ring-2 ring-emerald-300/40"
                                : "bg-slate-900 group-hover:bg-slate-700"
                            } ${item.height}`}
                          />
                        </div>
                        <span className={`text-[10px] font-mono ${isActive ? "font-bold text-slate-900" : "text-slate-400 group-hover:text-slate-700"}`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Safety Throughput:</span>
              <span className="font-semibold text-emerald-800 font-mono">100% Deterministic</span>
            </div>
          </div>

          {/* Mini Calendar & Priority Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 flex flex-col justify-between">
            <div>
              {/* Calendar Widget */}
              <div className="flex items-center justify-between pb-2 text-xs">
                <span className="font-bold text-slate-900">
                  {monthNames[calendarMonth]}, {calendarYear}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 hover:text-slate-900 transition-colors rounded"
                    title="Previous month"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:text-slate-900 transition-colors rounded"
                    title="Next month"
                    aria-label="Next month"
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
                      className={`py-1 rounded-full text-[10px] flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-slate-900 text-white font-extrabold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Tasks Widget */}
              <div className="mt-3">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-bold text-slate-900">Triage Tasks</span>
                  <button
                    type="button"
                    onClick={() => setShowAddTask((prev) => !prev)}
                    className="size-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-[11px] font-bold transition-transform active:scale-95"
                    title="Add custom task"
                    aria-label="Add custom task"
                  >
                    +
                  </button>
                </div>

                {/* Inline Add Task Form */}
                {showAddTask && (
                  <form onSubmit={handleAddTask} className="flex items-center gap-1.5 mb-2 mt-1">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="New task..."
                      autoFocus
                      className="flex-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 text-[10px] font-bold bg-[#064e3b] text-white rounded-lg shadow-2xs"
                    >
                      Add
                    </button>
                  </form>
                )}

                <div className="flex flex-col gap-1.5 mt-1">
                  {tasksList.map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-[11px] hover:bg-white hover:border-slate-200 transition-all"
                    >
                      <div className="min-w-0 pr-1">
                        {t.href ? (
                          <Link href={t.href} className="font-bold text-slate-900 hover:text-emerald-800 transition-colors block truncate">
                            {t.title}
                          </Link>
                        ) : (
                          <div className="font-bold text-slate-900 truncate">{t.title}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono">{t.time}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(t.id)}
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                          t.status === "Done"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/60 hover:bg-emerald-100"
                            : t.status === "Blocked"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100"
                              : "bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {t.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
              Shift: Morning Clinical
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}