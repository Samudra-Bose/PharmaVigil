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
import {
  Stethoscope,
  AlertTriangle,
  FileText,
  ArrowRight,
  ShieldAlert,
  PlusCircle,
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  Lock,
  Building2,
  FilePlus2,
  Sparkles,
  Activity,
  HeartPulse,
  Pill,
} from "lucide-react";

function formatPatientMRN(raw: string) {
  if (!raw) return "P-9021";
  if (raw.startsWith("pat_rajan_")) return "P-9021";
  if (raw.startsWith("pat_")) return raw.replace(/^pat_/, "P-");
  return raw;
}

function formatCaseId(caseId: string) {
  if (!caseId) return "9021-01";
  return caseId.replace(/^case_rx_/, "").replace(/_/g, "-");
}

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

  const primaryTask = tasks[0];

  const getSeverityVariant = (severity: string): BadgeVariant => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "high";
      case "MODERATE":
        return "moderate";
      default:
        return "info";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Pinterest/Dribbble Modern Bento Header */}
      <section
        aria-label="Doctor Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-900 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 shadow-2xs flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal-600" />
              Attending Physician Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Dr. Arvind Patel, MD • Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Clinical Triage & Dispositions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
            Prioritized clinical triage of automated CDS safety checks requiring attending physician rationale (≥15 characters).
          </p>
        </div>

        {/* Action Controls with Tactile Elevation */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <Link
            href="/doctor/appointments"
            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <CalendarIcon className="size-3.5 text-slate-500" />
            <span>Consultations</span>
          </Link>

          <Link
            href="/doctor/prescriptions"
            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <FileText className="size-3.5 text-slate-500" />
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/doctor/prescriptions/new"
            className="h-10 px-5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-sm shadow-teal-800/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle className="size-3.5 text-teal-100" />
            <span>+ New Prescription</span>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE HERO BENTO CARD: Obsidian & Deep Surgical Teal */}
      {primaryTask && (
        <section
          aria-label="Immediate Clinical Concern"
          className="rounded-3xl bg-gradient-to-br from-[#0c181b] via-[#112429] to-[#0a1417] border border-teal-500/25 text-white shadow-xl shadow-slate-950/20 p-6 sm:p-7 relative overflow-hidden flex flex-col gap-6"
        >
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute -right-20 -top-20 size-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-20 size-60 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Demographics & Immediate Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4 min-w-0">
              <div className="size-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/40">
                <ShieldAlert className="size-6 text-rose-300" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 flex items-center gap-1.5 shadow-2xs">
                    <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Dispensing Locked (Fails Closed)
                  </span>
                  <span className="text-teal-400/40">•</span>
                  <span className="font-bold text-xs text-teal-200">
                    Rx Case #9021
                  </span>
                  <span className="text-teal-400/40">•</span>
                  <span className="text-xs text-teal-100 font-semibold">
                    Rajan Sharma (MRN: P-9021) • Room 402
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Major Drug-Drug Interaction: Warfarin + Aspirin Bleed Hazard
                </h2>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href={`/doctor/tasks/${primaryTask.id}/disposition?caseId=${primaryTask.caseId}`}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>Sign Disposition</span>
                <ArrowRight className="size-3.5 text-white" />
              </Link>
            </div>
          </div>

          {/* Bottom Visual: Interactive DDI Node Diagram */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="size-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <Pill className="size-4" />
              </div>
              <div>
                <div className="font-bold text-white">Coumadin (Warfarin 5mg)</div>
                <div className="text-[11px] text-teal-200/70">Oral Tablet • Vitamin K Antagonist</div>
              </div>
            </div>

            {/* Glowing Interlock Conflict Beam */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[11px] font-bold shadow-2xs">
              <AlertTriangle className="size-3.5 text-rose-300 shrink-0" />
              <span>Synergistic Platelet & CYP2C9 Bleeding Hazard</span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="text-right">
                <div className="font-bold text-white">Disprin (Aspirin 100mg)</div>
                <div className="text-[11px] text-teal-200/70">Oral Tablet • Antiplatelet COX-1</div>
              </div>
              <div className="size-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                <Pill className="size-4" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. REFINED BENTO PULSE STRIP: Cohesive Luxe White Cards */}
      <section aria-label="Clinical Metrics Overview" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric Card 1: Critical Conflicts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Conflicts</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Action Required
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {tasks.length} Active Conflict{tasks.length === 1 ? "" : "s"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">CYP3A4 Statin Contraindications</p>
          </div>
        </div>

        {/* Metric Card 2: Resolution Clearance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolution Clearance</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Active Deck
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              94.2% Cleared
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cardiology Unit Throughput</p>
          </div>
        </div>

        {/* Metric Card 3: Inpatient Monitored */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inpatient Monitored</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Room 402
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Rajan Sharma
            </div>
            <p className="text-[11px] text-slate-500 mt-1">MRN: P-9021 • Cardiology Maintenance</p>
          </div>
        </div>
      </section>

      {/* 4. CORE BENTO GRID LAYOUT (8 Cols + 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Prioritized Triage Queue */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section
            aria-label="Triage Queue"
            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Prioritized Safety Triage Queue</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
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
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
                  >
                    {/* Left: Patient Avatar + Name + Prescription + Rule */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-11 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                        RS
                      </div>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">
                            Rajan Sharma
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            MRN: {formatPatientMRN(t.patientId)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold border border-slate-200/60">
                            Rx #{formatCaseId(t.caseId)} (v{t.revisionNumber})
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 truncate max-w-lg font-medium mt-0.5">
                          {t.alert.rationale}
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
                        className="h-8 px-3.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-xs shadow-teal-700/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Disposition</span>
                        <ArrowRight className="size-3 text-white/90" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 Cols): Circular Resolution Dial & Inpatient Bento */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Bento Card A: Rationale Policy Enforcement with SVG Conic Dial */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Governance Policy
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                STRICT
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
                    strokeDasharray="94.2, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900">
                  94.2%
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Cardiology Clearance</div>
                <p className="text-xs text-slate-500 mt-0.5">≥15 Character clinical justification strictly enforced.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Character Counter Gate</span>
              <span className="font-bold text-emerald-700">Enforced Client & Server</span>
            </div>
          </div>

          {/* Bento Card B: Inpatient Prescribing Shortcut */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Inpatient Orders
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Wards Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Prescribe scheduled intravenous medications, antibiotics, and anticoagulation protocols for admitted patients.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/doctor/orders/new"
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FilePlus2 className="size-3.5 text-blue-700" />
                <span>+ Prescribe Inpatient Order</span>
              </Link>
              <Link
                href="/doctor/orders"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>View Inpatient Orders Ledger</span>
                <ArrowRight className="size-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
