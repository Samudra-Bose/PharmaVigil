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
  Search,
  Copy,
  X,
  Pill,
} from "lucide-react";
import { clinicalToast } from "@/lib/toast";

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
  const [searchQuery, setSearchQuery] = useState("");

  const copyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      clinicalToast.info(`${label} Copied`, `${text} copied to clipboard.`);
    }
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

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const formattedMrn = formatPatientMRN(t.patientId).toLowerCase();
    const formattedCase = formatCaseId(t.caseId).toLowerCase();
    return (
      t.caseId.toLowerCase().includes(q) ||
      formattedCase.includes(q) ||
      t.patientId.toLowerCase().includes(q) ||
      formattedMrn.includes(q) ||
      "rajan sharma".includes(q) ||
      (t.alert.ruleId && t.alert.ruleId.toLowerCase().includes(q)) ||
      (t.alert.rationale && t.alert.rationale.toLowerCase().includes(q)) ||
      (t.alert.severity && t.alert.severity.toLowerCase().includes(q))
    );
  });

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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* 1. Clean, Minimal Header */}
      <section
        aria-label="Doctor Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2 border-b border-slate-200/80"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-teal-600" />
              Attending Physician Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Dr. Arvind Patel, MD • Cardiology
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Clinical Triage & Dispositions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Prioritized review of automated CDS safety checks requiring attending physician clinical rationale (≥15 characters).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/doctor/prescriptions"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <FileText className="size-3.5 text-slate-500" />
            <span>Prescriptions</span>
          </Link>

          <Link
            href="/doctor/prescriptions/new"
            className="h-9 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="size-3.5 text-teal-100" />
            <span>+ New Prescription</span>
          </Link>
        </div>
      </section>

      {/* 2. Simple 3-Metric Overview Strip */}
      <section aria-label="Triage Overview" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Urgent Triage Required */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5 text-rose-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Urgent Triage Required</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {tasks.length} {tasks.length === 1 ? "Case" : "Cases"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Action Needed
          </span>
        </div>

        {/* Metric 2: Prescriptions Ledger */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Active Regimens</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {cases.length} Outpatient {cases.length === 1 ? "Order" : "Orders"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Cardiology
          </span>
        </div>

        {/* Metric 3: Clinical Governance Compliance */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Governance Compliance</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                94.2% Signed
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Strict Policy
          </span>
        </div>
      </section>

      {/* 3. Streamlined Prioritized Triage Queue */}
      <section
        aria-label="Triage Queue"
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Prioritized Safety Triage Queue</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredTasks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review pharmacological evidence, adjust medications, or document required clinical justification.
            </p>
          </div>

          {/* Triage Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks, MRN, alert..."
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all shadow-inner/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear filter"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">Loading clinical cases...</div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No matching triage tasks found" : "All clinical safety flags resolved"}
            description={
              searchQuery
                ? "Try adjusting your search query or clear the filter to view all triage items."
                : "No active drug-drug interaction or contraindication flags currently require physician review."
            }
            actionLabel={searchQuery ? "Clear Search Filter" : undefined}
            onAction={searchQuery ? () => setSearchQuery("") : undefined}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((t) => (
              <div
                key={`${t.caseId}-${t.alert.ruleId}`}
                className="py-4 first:pt-1 last:pb-1 flex flex-col gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Patient Avatar + Name + Prescription + Rule */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                      RS
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900">
                          Rajan Sharma
                        </span>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyText(formatPatientMRN(t.patientId), "Patient MRN");
                          }}
                          className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer group/copy"
                          title="Click to copy Patient MRN"
                        >
                          <span>MRN: {formatPatientMRN(t.patientId)}</span>
                          <Copy className="size-2.5 text-slate-400 group-hover/copy:text-slate-700" />
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyText(formatCaseId(t.caseId), "Rx Case ID");
                          }}
                          className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold border border-slate-200/60 inline-flex items-center gap-1 transition-colors cursor-pointer group/copy"
                          title="Click to copy Rx Case ID"
                        >
                          <span>Rx #{formatCaseId(t.caseId)} (v{t.revisionNumber})</span>
                          <Copy className="size-2.5 text-slate-400 group-hover/copy:text-slate-700" />
                        </button>
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
                      className="h-8 px-3.5 rounded-lg bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Resolve & Authorize</span>
                      <ArrowRight className="size-3 text-teal-100" />
                    </Link>
                  </div>
                </div>

                {/* Clean inline guidance block */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ml-0 sm:ml-13">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
                    <span>
                      Attending physician clinical rationale required (minimum 15 characters) to authorize dispensing.
                    </span>
                  </div>
                  <Link
                    href={`/doctor/tasks/${t.id}/disposition?caseId=${t.caseId}`}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline shrink-0"
                  >
                    Open Triage Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Subtle System Status Note */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Cardiology Outpatient Clinic • Attending Physician: Dr. Arvind Patel, MD</span>
        </div>
        <div>
          <span>Clinical Safety Gate: Active</span>
        </div>
      </div>
    </div>
  );
}
