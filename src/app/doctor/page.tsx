"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { INITIAL_FIXTURE_CASE, type FixtureCase } from "@/lib/mock-data/fixtures";
import type { AlertSummary } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import {
  Stethoscope,
  AlertTriangle,
  FileText,
  ArrowRight,
  ShieldAlert,
  PlusCircle,
  Calendar,
  Lock,
  ChevronRight,
  User,
  Pill,
  CheckCircle2,
  Activity,
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

  const tasks: Array<{ caseId: string; alert: AlertSummary; revisionNumber: number; patientId: string }> = [];
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

  tasks.sort((a, b) => (severityRank[a.alert.severity] || 5) - (severityRank[b.alert.severity] || 5));

  const countCritical = tasks.filter((t) => t.alert.severity === "CRITICAL").length;

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
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Clinical Triage Deck</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-rose-50 text-rose-800 rounded-full border border-rose-200">
              Physician Disposition
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized review of automated safety check concerns requiring attending physician disposition.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/doctor/appointments">
            <button className="h-8 sm:h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition-all whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Consultations
            </button>
          </Link>

          <Link href="/doctor/prescriptions">
            <button className="h-8 sm:h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition-all whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Prescriptions
            </button>
          </Link>

          <Link href="/doctor/prescriptions/new">
            <button className="h-8 sm:h-9 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-lux flex items-center gap-1.5 transition-all whitespace-nowrap">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" /> + New Revision
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Focused Triage Workspace (Section D) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (8 cols): Primary Clinical Concern */}
        <div className="lg:col-span-8">
          {primaryTask ? (
            <div className="bg-white rounded-2xl p-5 shadow-lux border-l-4 border-l-rose-500 border-t border-r border-b border-slate-100 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-950 font-mono">
                      Active Critical Incident • Physician Disposition Required
                    </span>
                  </div>
                  <Badge variant={getSeverityVariant(primaryTask.alert.severity)} className="text-xs">
                    {primaryTask.alert.severity}
                  </Badge>
                </div>

                <div className="pt-1 border-t border-slate-100/80">
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono">{primaryTask.caseId}</span>
                    <span className="text-slate-300">•</span>
                    <span>Patient: Rajan Sharma ({primaryTask.patientId})</span>
                    <span className="text-xs text-slate-400 font-mono font-normal">v{primaryTask.revisionNumber}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Attending: Dr. Arvind Patel (Cardiology) • Inpatient Room 402
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700 leading-relaxed">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-rose-600" />
                    <span>Rule {primaryTask.alert.ruleId} (v{primaryTask.alert.ruleVersion})</span>
                  </div>
                  <p>{primaryTask.alert.rationale}</p>
                </div>

                <div className="text-xs text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span>Recommended Clinical Alternative:</span>
                  <span className="font-semibold text-forest-900">Azithromycin 500mg or Rosuvastatin 20mg</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Requires <span className="font-semibold text-slate-700">mandatory clinical rationale (≥15 chars)</span> to override or revise.
                </div>

                <Link
                  href={`/doctor/tasks/${primaryTask.alert.id}?caseId=${primaryTask.caseId}`}
                  className="shrink-0"
                >
                  <button className="h-8 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                    <span>Triage Primary Alert</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-lux border border-slate-100 flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Triage Deck Clean</h3>
                  <p className="text-xs text-slate-500">No open clinical alerts awaiting attending physician disposition.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right (4 cols): Restrained Telemetry Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-forest-900" /> Triage Metrics
              </span>
              <span className="text-[10px] font-mono text-slate-400">Cardiology</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  Critical Contraindications
                </span>
                <span className="font-mono font-bold text-rose-700 font-tabular text-sm">
                  {countCritical}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  Active Triage Tasks
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {tasks.length}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  Total Prescriptions
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {cases.length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Fails-Closed Gate:</span>
            <span className="font-semibold text-rose-600">Dispensing Blocked</span>
          </div>
        </div>
      </div>

      {/* 3. Triage Task Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lux">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Physician Triage Task Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">Review pharmacological conflicts, provide justification rationale, or issue new prescription revisions</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            {tasks.length} Active Task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            title="Triage Deck Clean"
            description="There are currently no open clinical alerts awaiting doctor disposition in Metro General Hospital."
            icon={Stethoscope}
            actionLabel="View Prescriptions"
            onAction={() => (window.location.href = "/doctor/prescriptions")}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-b border-slate-100">
                    <TableHead className="w-28 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                      Severity
                    </TableHead>
                    <TableHead className="w-40 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                      Case & Patient
                    </TableHead>
                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                      Rule & Pharmacological Conflict
                    </TableHead>
                    <TableHead className="w-28 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                      Status
                    </TableHead>
                    <TableHead className="w-28 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                    <TableRow
                      key={alert.id}
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <TableCell className="py-3.5 align-middle">
                        <Badge variant={getSeverityVariant(alert.severity)} className="text-[11px] whitespace-nowrap">
                          {alert.severity}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="font-mono font-bold text-xs text-slate-900 font-tabular">
                          {caseId}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono font-tabular mt-0.5">
                          {patientId} • Rev {revisionNumber}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="font-semibold text-slate-900 font-mono text-[11px] font-tabular">
                          {alert.ruleId} <span className="text-slate-400 font-normal">(v{alert.ruleVersion})</span>
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                          {alert.rationale}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap font-medium">
                          {alert.status}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle text-right">
                        <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`}>
                          <button className="h-8 px-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1 ml-auto transition-all">
                            <span>Triage</span>
                            <ArrowRight className="w-3 h-3 text-emerald-300" />
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden p-3 space-y-3">
              {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                <div
                  key={alert.id}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={getSeverityVariant(alert.severity)} className="text-[10px]">
                      {alert.severity}
                    </Badge>
                    <span className="font-mono text-[11px] text-slate-500 font-tabular">
                      Rev {revisionNumber}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-semibold font-mono text-[11px] text-slate-900">
                      {caseId} • Patient {patientId}
                    </div>
                    <div className="font-medium text-slate-800">{alert.ruleId}</div>
                    <div className="text-[11px] text-slate-600 leading-snug">{alert.rationale}</div>
                  </div>

                  <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`} className="block">
                    <button className="w-full h-9 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                      <span>Triage Case</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
