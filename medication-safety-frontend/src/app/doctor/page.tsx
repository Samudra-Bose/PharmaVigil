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
import { DotMatrixWaveform } from "@/components/clinical/DotMatrixWaveform";
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
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  Pill,
} from "lucide-react";

export default function DoctorDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCases();
        setCases(data);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Rythea-Inspired Editorial Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Clinical Triage Deck
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Prioritized Safety Alerts</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="font-mono text-slate-600">Attending Physician Review (MD)</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/doctor/appointments">
            <button className="h-9 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-lux flex items-center gap-1.5 transition-all">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Consultations
            </button>
          </Link>

          <Link href="/doctor/prescriptions">
            <button className="h-9 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-lux flex items-center gap-1.5 transition-all">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Prescriptions
            </button>
          </Link>

          <Link href="/doctor/prescriptions/new">
            <button className="h-9 px-4 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-lux flex items-center gap-1.5 transition-all">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" /> + New Revision
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Asymmetric Clinical Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Active Critical Triage Incident & Action Deck */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Card 1: Critical Incident Hero */}
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  Critical Contraindication Incident
                </span>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span>Target Case:</span>
                  <span className="font-semibold text-slate-800 font-mono">case_rx_9021_01</span>
                  <span>• Patient:</span>
                  <span className="font-semibold text-slate-800 font-mono">P-9021 (Rajan Sharma)</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                  title="Configure Parameters"
                  aria-label="Configure Parameters"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                  title="Export Audit"
                  aria-label="Export Audit"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                  title="More Actions"
                  aria-label="More Actions"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Row */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Severity</div>
                  <div className="text-sm font-semibold text-rose-600 mt-0.5">CRITICAL DDI</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Attending</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">Dr. Arvind Patel</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Required Action</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">Physician Rationale (≥15 chars)</div>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-right">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-tabular font-mono">
                  {tasks.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">Alert{tasks.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Dot Matrix Telemetry Waveform */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Deterministic Risk Waveform</span>
                <span className="text-rose-500 font-medium">CYP3A4 High Peak Hazard</span>
              </div>
              <DotMatrixWaveform />
              <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono pt-2">
                <span>Rule: DDI-CYP3A4-ATOR-CLAR</span>
                <span>Fails-Closed Blocked: Dispensing Disallowed</span>
              </div>
            </div>
          </div>

          {/* Sub-Deck: Obsidian Action Card & Disposition Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Obsidian Card */}
            <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-lux-black relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="uppercase tracking-wider font-mono font-medium">Gated Dispensing Block</span>
                <span className="font-mono text-rose-400">BLOCKED</span>
              </div>

              <div className="my-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-xl font-bold font-mono tracking-tight text-white font-tabular">
                    MD Disposition Required
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Pharmacist cannot dispense until physician records clinical rationale or issues revised regimen.
                  </div>
                </div>
              </div>

              {primaryTask ? (
                <Link
                  href={`/doctor/tasks/${primaryTask.alert.id}?caseId=${primaryTask.caseId}`}
                  className="block w-full"
                >
                  <button className="w-full h-9 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                    <span>Resolve Alert With Rationale</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </Link>
              ) : null}
            </div>

            {/* Pharmacological Conflict Card */}
            <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="uppercase tracking-wider font-medium">Pharmacological Conflict</span>
                  <span className="text-slate-600">Cardiology</span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">Atorvastatin 40mg (OD)</div>
                      <div className="text-[10px] text-slate-500 font-mono">HMG-CoA Reductase Inhibitor</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">Clarithromycin 500mg (BD)</div>
                      <div className="text-[10px] text-slate-500 font-mono">Potent CYP3A4 Inhibitor</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Recommended Alternative:</span>
                <span className="font-semibold text-forest-900 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Azithromycin or Rosuvastatin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Patient Triage Profile Deck */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 flex-1 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Rajan Sharma
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Department of Cardiology • Room 402
                  </p>
                  <div className="text-xs font-semibold text-slate-600 mt-2">
                    58 years • Male
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 font-bold font-mono text-sm flex items-center justify-center border border-rose-200/80 shrink-0 shadow-2xs">
                  RS
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 gap-2.5 py-4 border-b border-slate-100 text-xs">
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">MRN ID</span>
                  <div className="font-semibold text-slate-800 font-mono mt-0.5">P-9021</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Allergy Status</span>
                  <div className="font-semibold text-amber-700 mt-0.5">Penicillin (Mild)</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Renal Function</span>
                  <div className="font-semibold text-slate-800 font-mono mt-0.5">eGFR 68 mL/min</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Safety Gate</span>
                  <div className="font-semibold text-rose-600 mt-0.5">Blocked</div>
                </div>
              </div>

              {/* Clinical Protocol Requirement */}
              <div className="py-4 space-y-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Clinical Safety Requirement</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  PharmaVigil enforces strict clinical rationale requirements. Any override of a CRITICAL DDI requires a documented rationale of at least 15 characters, which is permanently logged in the immutable audit trail.
                </p>
              </div>
            </div>

            {/* Bottom Telemetry Tiles */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-medium">Triage Priority</span>
                <div className="text-xl font-bold font-mono text-rose-600 mt-0.5 font-tabular">
                  P1 Urgent
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">
                  Within 2 Hours
                </span>
              </div>

              {/* Obsidian Mini-Tile */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white shadow-lux-black flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-medium">Audit Integrity</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 font-tabular">
                  100% Gated
                </div>
                <span className="text-[10px] text-slate-300 font-medium mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> Locked Out
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Triage Queue Ledger Table */}
      <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Physician Triage Task Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review pharmacological conflicts, provide justification rationale, or issue new prescription revisions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 bg-rose-50 text-rose-800 rounded-full border border-rose-200">
              {tasks.length} Pending Triage Action{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>
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
            {/* Desktop / Tablet Ledger */}
            <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100">
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
                      className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0"
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
                          <button className="h-8 px-3 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1 ml-auto transition-all">
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
            <div className="sm:hidden space-y-3">
              {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                <div
                  key={alert.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lux space-y-3"
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
                    <button className="w-full h-9 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
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
