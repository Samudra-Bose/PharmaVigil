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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
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
  Clock, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  PlusCircle,
  User,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-slate-700" />
            Doctor Clinical Alert Triage Deck
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized review of automated safety check concerns requiring physician disposition
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/doctor/appointments">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Consultations
            </Button>
          </Link>
          <Link href="/doctor/prescriptions">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Prescriptions
            </Button>
          </Link>
          <Link href="/doctor/prescriptions/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 bg-slate-900 hover:bg-slate-800">
              <PlusCircle className="w-3.5 h-3.5" /> + New Revision
            </Button>
          </Link>
        </div>
      </div>

      {/* Triage Metrics Strip (COSS UI Inspired) */}
      <CossMetricStrip
        metrics={[
          { label: "Active Triage Alerts", value: tasks.length, icon: AlertTriangle, tone: tasks.length > 0 ? "urgent" : "neutral" },
          { label: "Critical Contraindications", value: countCritical, icon: ShieldAlert, tone: countCritical > 0 ? "urgent" : "neutral" },
          { label: "Active Hospital Cases", value: cases.length, icon: Activity, tone: "info" },
          { label: "Attending Status", value: "Active", subtext: "Dr. Arvind Patel", icon: Stethoscope, tone: "success" },
        ]}
      />

      {/* Urgent Alert Callout with Magic UI BorderBeam */}
      {tasks.length > 0 && (
        <div className="relative rounded-lg overflow-hidden">
          <Alert variant="warning" className="border-amber-300 bg-amber-50/70 shadow-subtle">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="font-bold text-amber-950 flex items-center gap-2">
              <span>Active Clinical Alerts Pending Review ({tasks.length})</span>
              <span className="relative flex h-2 w-2 motion-reduce:hidden">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            </AlertTitle>
            <AlertDescription className="text-amber-900 mt-1 text-xs">
              Pharmacy dispensing authorization is blocked on these cases until an attending doctor records a clinical disposition with mandatory rationale.
            </AlertDescription>
          </Alert>
          <BorderBeam size={180} duration={8} colorFrom="#f59e0b" colorTo="#ef4444" />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
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
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-32">
                    <ClinicalTooltip
                      term="Severity"
                      explanation="Clinical risk rating. Critical alerts represent severe hazard contraindications requiring therapy revision or documented review."
                    />
                  </TableHead>
                  <TableHead>Safety Rule & Clinical Concern</TableHead>
                  <TableHead className="w-48">Case / Patient</TableHead>
                  <TableHead className="w-32">Triage Status</TableHead>
                  <TableHead className="w-32 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                  <TableRow key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {alert.severity === "CRITICAL" && (
                          <span className="relative flex h-2 w-2 shrink-0 motion-reduce:hidden">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                          </span>
                        )}
                        <Badge variant={getSeverityVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="font-bold text-slate-900 font-mono text-[11px] font-tabular">
                        {alert.ruleId} <span className="text-slate-400 font-normal">(v{alert.ruleVersion})</span>
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {alert.rationale}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 font-mono font-tabular">{caseId}</div>
                      <div className="text-[11px] text-slate-500 font-mono font-tabular">
                        Patient: {patientId} • Rev {revisionNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="moderate" icon={false} className="text-[10px] uppercase font-mono">
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`}>
                        <Button size="sm" variant="primary" className="text-xs gap-1 h-7 bg-slate-900 hover:bg-slate-800">
                          Review <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
              <div
                key={alert.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={getSeverityVariant(alert.severity)}>
                    {alert.severity} Hazard
                  </Badge>
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">
                    Rev {revisionNumber}
                  </span>
                </div>

                <div>
                  <div className="font-bold font-mono text-xs text-slate-900">
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
