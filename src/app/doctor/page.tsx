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
import { clinicalToast } from "@/lib/toast";
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

  // Interactive UI state for Charts, Calendar, and Tasks
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "daily">("weekly");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(4); // Thursday
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(28);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [triageTasksList, setTriageTasksList] = useState([
    {
      id: "triage-1",
      title: "Sign CYP3A4 Override",
      code: "case_rx_9021",
      status: "High",
      href: "/doctor/tasks/alert_ddi_statin_macrolide_001/disposition?caseId=case_rx_9021_01",
    },
    {
      id: "triage-2",
      title: "Sign Discharge Rx",
      code: "P-9022",
      status: "Review",
      href: "/doctor/prescriptions/new?caseId=case_rx_9022",
    },
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

  const handleAddTriageTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `triage-${Date.now()}`,
      title: newTaskTitle.trim(),
      code: "Ad-hoc Review",
      status: "Review",
      href: "/doctor/prescriptions",
    };
    setTriageTasksList([newTask, ...triageTasksList]);
    setNewTaskTitle("");
    setShowAddTask(false);
    clinicalToast.success("Triage Task Added", `Scheduled: ${newTask.title}`);
  };

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
    id: string;
    caseId: string;
    alert: AlertSummary;
    revisionNumber: number;
    patientId: string;
  }> = [];
  cases.forEach((c) => {
    c.alerts?.forEach((a) => {
      tasks.push({
        id: a.id || `task_${c.id}`,
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

  const chartData = {
    weekly: [
      { day: "Su", count: 1, height: "h-16", time: "45m" },
      { day: "Mo", count: 3, height: "h-24", time: "1h 30m" },
      { day: "Tu", count: 4, height: "h-28", time: "2h 10m" },
      { day: "We", count: 5, height: "h-36", time: "2h 45m" },
      { day: "Th", count: 4, height: "h-36", time: "2h 15m" },
      { day: "Fr", count: 2, height: "h-20", time: "1h 10m" },
      { day: "Sa", count: 1, height: "h-12", time: "30m" },
    ],
    monthly: [
      { day: "W1", count: 18, height: "h-24", time: "11h" },
      { day: "W2", count: 22, height: "h-28", time: "14h" },
      { day: "W3", count: 29, height: "h-36", time: "18h" },
      { day: "W4", count: 25, height: "h-32", time: "16h" },
    ],
    daily: [
      { day: "08h", count: 1, height: "h-16", time: "30m" },
      { day: "10h", count: 2, height: "h-24", time: "50m" },
      { day: "12h", count: 4, height: "h-36", time: "1h 40m" },
      { day: "14h", count: 3, height: "h-28", time: "1h 15m" },
      { day: "16h", count: 2, height: "h-20", time: "45m" },
    ],
  };

  const currentChartBars = chartData[timeRange];
  const safeActiveDayIndex = activeDayIndex >= currentChartBars.length ? 0 : activeDayIndex;
  const activeChartItem = currentChartBars[safeActiveDayIndex];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with Editorial Elegance & Clear Button Hierarchy */}
      <section
        aria-label="Doctor Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
              Attending Physician Review
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Clinical Triage & Dispositions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Prioritized clinical triage of automated CDS safety checks requiring attending physician rationale (≥15 characters).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <Link
            href="/doctor/appointments"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-blue-50/70 text-slate-700 hover:text-blue-900 font-semibold text-xs border border-slate-200/90 shadow-2xs inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <CalendarIcon data-icon="inline-start" className="size-3.5 text-slate-500" />
            <span>Consultations</span>
          </Link>

          <Link
            href="/doctor/prescriptions"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-blue-50/70 text-slate-700 hover:text-blue-900 font-semibold text-xs border border-slate-200/90 shadow-2xs inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <FileText data-icon="inline-start" className="size-3.5 text-slate-500" />
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/doctor/prescriptions/new"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/25 inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <PlusCircle data-icon="inline-start" className="size-3.5 text-blue-100" />
            <span>+ New Revision</span>
          </Link>
        </div>
      </section>

      {/* 2. IMMEDIATE ATTENTION HERO: Distraction-Free Clinical Disposition Gate */}
      {primaryTask && (
        <section
          aria-label="Immediate Clinical Concern"
          className="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/30 rounded-2xl border border-rose-300/80 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
        >
          <div className="flex items-start gap-4 min-w-0">
            <div className="size-11 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldAlert className="size-5 text-rose-700" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                  Dispensing Locked (Fails Closed)
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono font-bold text-xs text-slate-900">
                  {primaryTask.caseId}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  Patient {primaryTask.patientId} (Room 402)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                  v{primaryTask.revisionNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Rule: {primaryTask.alert.ruleId} — {primaryTask.alert.rationale}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Dispensing locked. Requires attending physician override rationale (≥15 characters) or therapy revision before pharmacy release.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href={`/doctor/tasks/${primaryTask.id}/disposition?caseId=${primaryTask.caseId}`}
              className="w-full sm:w-auto h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm shadow-rose-600/25 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Sign Disposition</span>
              <ArrowRight data-icon="inline-end" className="size-3 text-white" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. CLINICAL PULSE: Refined Themed Stat Strip */}
      <section aria-label="Clinical Metrics Overview" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-rose-50/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-900">Critical Conflicts</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100/80 text-rose-800 border border-rose-200/60">
                Action Required
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-rose-700 font-tabular font-mono">
                {tasks.length} Cases
              </div>
              <p className="text-[11px] text-rose-600/80 mt-0.5">CYP3A4 Statin Contraindications</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex flex-col justify-between bg-emerald-50/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Resolution Clearance</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/70">
                Active Deck
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-emerald-700 font-tabular font-mono">
                94.2% Cleared
              </div>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">Cardiology Unit Throughput</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex flex-col justify-between bg-blue-50/25">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-900">Inpatient Monitored</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200">
                Room 402
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-blue-700 font-tabular font-mono">
                Patient P-9021
              </div>
              <p className="text-[11px] text-blue-600/80 mt-0.5">Cardiology Maintenance Bed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN CLINICAL WORKSPACE: 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column (8 cols): Safety Triage Queue */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Prioritized Safety Triage Queue</span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {tasks.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review pharmacological evidence, drug alternatives, and provide required clinical rationale.
                </p>
              </div>
            </div>

            {/* Task List */}
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">Loading clinical cases...</div>
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
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-xl px-2"
                  >
                    {/* Left: Squircle Icon + Case ID + Rule */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="size-4 text-rose-700" />
                      </div>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 font-tabular">
                            {t.caseId}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-xs text-slate-600 flex items-center gap-1">
                            <User className="size-3 text-slate-400" />
                            {t.patientId}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            v{t.revisionNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 truncate max-w-sm sm:max-w-md font-medium">
                          Rule: {t.alert.ruleId} — {t.alert.rationale}
                        </div>
                      </div>
                    </div>

                    {/* Right: Severity Badge + Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <Badge
                        variant={getSeverityVariant(t.alert.severity)}
                        className="text-xs whitespace-nowrap"
                      >
                        {t.alert.severity}
                      </Badge>

                      <Link
                        href={`/doctor/tasks/${t.id}/disposition?caseId=${t.caseId}`}
                        className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Disposition</span>
                        <ArrowRight data-icon="inline-end" className="size-3 text-white/90" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Supporting Rail (4 cols): Schedule + Throughput + Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Clinical Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Clinical Schedule</h3>
                <span className="text-[11px] text-slate-400 font-medium">Cardiology Ward</span>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                <Link href="/doctor/appointments" className="block">
                  <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                        <Stethoscope className="size-3.5 text-slate-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Morning Ward Rounds</div>
                        <div className="text-[11px] text-slate-500">Inpatient Unit (Room 402)</div>
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                <Link
                  href={
                    primaryTask
                      ? `/doctor/tasks/${primaryTask.id}/disposition?caseId=${primaryTask.caseId}`
                      : "/doctor/prescriptions"
                  }
                  className="block"
                >
                  <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="size-3.5 text-rose-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors">DDI Triage & Disposition</div>
                        <div className="text-[11px] text-rose-700 font-semibold">{primaryTask?.caseId || "case_rx_9021_01"} Conflict</div>
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                <Link href="/doctor/prescriptions" className="block">
                  <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0">
                        <Pill className="size-3.5 text-emerald-800" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Therapy Re-authorization</div>
                        <div className="text-[11px] text-slate-500">{tasks.length} Pending Signatures</div>
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                <Link href="/doctor/appointments" className="block">
                  <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 rounded-xl px-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                        <CalendarIcon className="size-3.5 text-slate-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Outpatient Consultation</div>
                        <div className="text-[11px] text-slate-500">10:00 AM UTC (Rajan Sharma)</div>
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Attending License:</span>
              <span className="text-slate-700 font-mono">MD-CARD-7491</span>
            </div>
          </div>

          {/* Resolution Throughput Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Resolution Throughput</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                      <TrendingUp className="size-3" />
                      +8% faster disposition
                    </span>
                  </div>
                </div>
                <select
                  aria-label="Filter resolution throughput by time range"
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value as "weekly" | "monthly" | "daily");
                    setActiveDayIndex(0);
                  }}
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
                    className="absolute top-0 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1.5 z-20 pointer-events-none transition-all duration-200"
                    style={{
                      left: `${Math.max(15, Math.min(85, ((safeActiveDayIndex + 0.5) / currentChartBars.length) * 100))}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>
                      {activeChartItem.count} {activeChartItem.count === 1 ? "Case" : "Cases"} • {activeChartItem.time}
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
                        aria-label={`${item.day}: ${item.count} cases resolved`}
                        className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                      >
                        <div className="w-full max-w-[12px] bg-slate-100 rounded-full h-28 flex items-end">
                          <div
                            className={`w-full rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-emerald-600 shadow-xs ring-2 ring-emerald-300/40"
                                : "bg-slate-900 group-hover:bg-slate-700"
                            } ${item.height}`}
                          />
                        </div>
                        <span className={`text-[10px] font-mono transition-colors ${isActive ? "font-bold text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Standard:</span>
              <span className="font-semibold text-emerald-800 font-mono">100% Deterministic</span>
            </div>
          </div>

          {/* Mini Calendar & Triage Tasks */}
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
                    aria-label="Previous month"
                    className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
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
                    aria-label="Add triage task"
                    className="size-4 rounded-full bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center text-[11px] font-bold transition-transform active:scale-95"
                  >
                    {showAddTask ? "✕" : "+"}
                  </button>
                </div>

                {showAddTask && (
                  <form onSubmit={handleAddTriageTask} className="mb-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="New task..."
                      className="w-full text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowAddTask(false)}
                        className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 text-[10px] bg-[#064e3b] text-white rounded font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-1.5 mt-1">
                  {triageTasksList.map((task) => (
                    <Link key={task.id} href={task.href} className="block group">
                      <div className="p-2 rounded-xl bg-slate-50/70 group-hover:bg-slate-100 border border-slate-100 flex items-center justify-between text-[11px] transition-colors">
                        <div>
                          <div className="font-bold text-slate-900 truncate max-w-[110px] group-hover:text-emerald-800 transition-colors">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{task.code}</div>
                        </div>
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                            task.status === "High"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
              Dept: Cardiology
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}