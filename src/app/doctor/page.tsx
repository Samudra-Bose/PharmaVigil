"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import type { AlertSummary } from "@/types";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import { BorderBeam } from "@/components/magicui/BorderBeam";
import { 
  Stethoscope, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  PlusCircle,
  Calendar
} from "lucide-react";

export default function DoctorDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-4">
      {/* 1. Precision Header: Clear Title + Single Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="truncate">Clinical Triage Deck</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Prioritized review of automated safety check concerns requiring attending physician disposition
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/doctor/appointments">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 px-2.5 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Consultations
            </Button>
          </Link>
          <Link href="/doctor/prescriptions">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 px-2.5 whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Prescriptions
            </Button>
          </Link>
          <Link href="/doctor/prescriptions/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white whitespace-nowrap shadow-2xs font-medium">
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" /> + New Revision
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Quiet Clinical Status Rail */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 px-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {countCritical > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-900 border border-rose-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              <span>{countCritical} Critical Contraindication{countCritical > 1 ? "s" : ""}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>0 Critical Alerts</span>
            </span>
          )}

          <span className="text-slate-300">|</span>

          <span className="text-slate-600 font-medium">
            <span className="font-mono font-bold text-slate-900">{tasks.length}</span> Active Triage Tasks
          </span>

          <span className="text-slate-300">|</span>

          <span className="text-slate-600">
            <span className="font-mono font-bold text-slate-900">{cases.length}</span> Hospital Cases
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span>Attending:</span>
          <span className="text-slate-900 font-semibold">Dr. Arvind Patel (Cardiology)</span>
        </div>
      </div>

      {/* 3. Urgent Triage Attention Incident Card with Subtle BorderBeam */}
      {tasks.length > 0 && (
        <div className="relative rounded-lg overflow-hidden bg-white border border-rose-200/90 border-l-4 border-l-rose-500 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-rose-950 uppercase tracking-wider truncate">
                Active Critical Triage ({tasks.length} Task{tasks.length > 1 ? "s" : ""})
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Pharmacy dispensing is blocked on case <span className="font-mono font-semibold text-slate-900">{tasks[0].caseId}</span> (Patient <span className="font-mono font-semibold text-slate-900">{tasks[0].patientId}</span>). Clinical disposition required.
            </p>
          </div>

          <Link href={`/doctor/tasks/${tasks[0].alert.id}?caseId=${tasks[0].caseId}`} className="shrink-0">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 bg-rose-600 hover:bg-rose-700 text-white shadow-2xs whitespace-nowrap">
              Triage Primary Alert <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <BorderBeam size={160} duration={8} colorFrom="#f43f5e" colorTo="#fb923c" />
        </div>
      )}

      {/* 4. Adaptive Triage Ledger (Fits 900px Without Horizontal Scroll) */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="Triage Deck Clean"
          description="There are currently no open clinical alerts awaiting doctor disposition in Metro General Hospital."
          icon={Stethoscope}
          actionLabel="View Prescriptions"
          onAction={() => (window.location.href = "/doctor/prescriptions")}
        />
      ) : (
        <>
          {/* Desktop/Tablet Master Table */}
          <div className="hidden sm:block bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 border-b border-slate-200/80">
                  <TableHead className="w-24 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Severity</TableHead>
                  <TableHead className="w-36 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Case & Patient</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rule & Pharmacological Conflict</TableHead>
                  <TableHead className="w-24 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="w-24 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                  <TableRow key={alert.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0">
                    <TableCell className="align-top py-2.5">
                      <Badge variant={getSeverityVariant(alert.severity)} className="text-[11px] whitespace-nowrap">
                        {alert.severity}
                      </Badge>
                    </TableCell>

                    <TableCell className="align-top py-2.5">
                      <div className="font-mono font-semibold text-xs text-slate-900 font-tabular">
                        {caseId}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono font-tabular mt-0.5">
                        {patientId} • Rev {revisionNumber}
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-2.5">
                      <div className="font-semibold text-slate-900 font-mono text-[11px] font-tabular">
                        {alert.ruleId} <span className="text-slate-400 font-normal">(v{alert.ruleVersion})</span>
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {alert.rationale}
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-2.5">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                        {alert.status}
                      </span>
                    </TableCell>

                    <TableCell className="align-top py-2.5 text-right">
                      <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1 h-7 px-2 font-medium whitespace-nowrap">
                          Triage <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Reflow Card View (< 640px) */}
          <div className="sm:hidden space-y-2.5">
            {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
              <div
                key={alert.id}
                className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={getSeverityVariant(alert.severity)} className="text-[10px]">
                    {alert.severity} Hazard
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-500 font-medium">
                    Rev {revisionNumber}
                  </span>
                </div>

                <div>
                  <div className="font-semibold font-mono text-xs text-slate-900">
                    {alert.ruleId}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {alert.rationale}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
                  <span>Case: {caseId}</span>
                  <span>Patient: {patientId}</span>
                </div>

                <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`} className="block">
                  <Button size="sm" variant="primary" className="w-full text-xs gap-1.5 h-8 bg-slate-900 hover:bg-slate-800">
                    Review Alert & Document Rationale <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
