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
import { CossMetricStrip } from "@/components/coss/CossMetricStrip";
import { BorderBeam } from "@/components/magicui/BorderBeam";
import { 
  Stethoscope, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  PlusCircle,
  Activity,
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

  // Collect all alerts from cases
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

  // Sort tasks: CRITICAL > HIGH > MODERATE > LOW
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
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-slate-700" />
            Doctor Clinical Alert Triage Deck
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized review of automated safety check concerns requiring attending physician disposition
          </p>
        </div>

        {/* Clear Action Prominence */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/doctor/appointments">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Consultations
            </Button>
          </Link>
          <Link href="/doctor/prescriptions">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Prescriptions
            </Button>
          </Link>
          <Link href="/doctor/prescriptions/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 bg-slate-900 hover:bg-slate-800 shadow-2xs">
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" /> + New Revision
            </Button>
          </Link>
        </div>
      </div>

      {/* Monolithic Linear-style Metric Rail */}
      <CossMetricStrip
        metrics={[
          { label: "Active Triage Alerts", value: tasks.length, icon: AlertTriangle, tone: tasks.length > 0 ? "urgent" : "neutral" },
          { label: "Critical Contraindications", value: countCritical, icon: ShieldAlert, tone: countCritical > 0 ? "urgent" : "neutral" },
          { label: "Hospital Cases", value: cases.length, icon: Activity, tone: "info" },
          { label: "Attending Status", value: "Active", subtext: "Dr. Arvind Patel", icon: Stethoscope, tone: "success" },
        ]}
      />

      {/* Urgent Alert Attention Card with Restrained Magic UI BorderBeam */}
      {tasks.length > 0 && (
        <div className="relative rounded-lg overflow-hidden bg-white border border-rose-200/80 border-l-4 border-l-rose-500 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
              <h2 className="text-xs font-semibold text-rose-950 uppercase tracking-wider">
                Active Critical Triage ({tasks.length} Alert{tasks.length > 1 ? "s" : ""})
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Pharmacy dispensing is blocked on case <span className="font-mono font-semibold text-slate-900">{tasks[0].caseId}</span> (Patient <span className="font-mono font-semibold text-slate-900">{tasks[0].patientId}</span>). An attending physician must record a clinical disposition with documented rationale.
            </p>
          </div>

          <Link href={`/doctor/tasks/${tasks[0].alert.id}?caseId=${tasks[0].caseId}`} className="shrink-0">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 bg-rose-600 hover:bg-rose-700 text-white shadow-2xs">
              Triage Primary Alert <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <BorderBeam size={160} duration={8} colorFrom="#f43f5e" colorTo="#fb923c" />
        </div>
      )}

      {loading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
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
          {/* Desktop High-Density Triage Table */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 border-b border-slate-200/80">
                  <TableHead className="w-32 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <ClinicalTooltip
                      term="Severity"
                      explanation="Clinical risk rating. Critical alerts represent severe hazard contraindications requiring therapy revision or documented review."
                    />
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Safety Rule & Clinical Concern</TableHead>
                  <TableHead className="w-44 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Case / Patient</TableHead>
                  <TableHead className="w-28 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Triage Status</TableHead>
                  <TableHead className="w-24 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                  <TableRow key={alert.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0">
                    <TableCell>
                      <Badge variant={getSeverityVariant(alert.severity)} className="text-[11px]">
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-semibold text-slate-900 font-mono text-[11px] font-tabular">
                        {alert.ruleId} <span className="text-slate-400 font-normal">(v{alert.ruleVersion})</span>
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {alert.rationale}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-semibold text-xs text-slate-900 font-tabular">{caseId}</div>
                      <div className="text-[11px] text-slate-500 font-mono font-tabular mt-0.5">
                        Patient: {patientId} • Rev {revisionNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {alert.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1 h-7 px-2 font-medium">
                          Triage <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Reflow Card View */}
          <div className="md:hidden space-y-2.5">
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
                  <Button size="sm" variant="primary" className="w-full text-xs gap-1.5 h-8 bg-slate-900">
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
