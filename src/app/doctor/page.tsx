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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
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
            <CalendarIcon className="size-3.5 text-slate-500" />
            <span>Consultations</span>
          </Link>

          <Link
            href="/doctor/prescriptions"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-blue-50/70 text-slate-700 hover:text-blue-900 font-semibold text-xs border border-slate-200/90 shadow-2xs inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <FileText className="size-3.5 text-slate-500" />
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/doctor/prescriptions/new"
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/25 inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="size-3.5 text-blue-100" />
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
              <ArrowRight className="size-3 text-white" />
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

      {/* 4. MAIN WORKSPACE: Full-Width Prioritized Safety Triage Queue */}
      <section aria-label="Triage Queue" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col gap-4">
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
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
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
                    <div className="text-xs text-slate-700 truncate max-w-lg font-medium">
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
                    <ArrowRight className="size-3 text-white/90" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
