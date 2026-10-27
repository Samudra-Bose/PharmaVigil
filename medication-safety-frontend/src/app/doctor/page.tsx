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
import { Kbd } from "@/components/ui/Kbd";
import { 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  PlusCircle
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
          <Link href="/doctor/prescriptions">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" /> All Prescriptions
            </Button>
          </Link>
          <Link href="/doctor/prescriptions/new">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" /> + New Revision
            </Button>
          </Link>
        </div>
      </div>

      {/* Urgent Alert Callout */}
      {tasks.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold text-amber-950 flex items-center gap-2">
            <span>Active Clinical Alerts Pending Review ({tasks.length})</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          </AlertTitle>
          <AlertDescription className="text-amber-900 mt-1">
            Pharmacy dispensing authorization is blocked on these cases until an attending doctor records a clinical disposition with mandatory rationale.
          </AlertDescription>
        </Alert>
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
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow key={alert.id}>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {alert.severity === "CRITICAL" && (
                      <span className="relative flex h-2 w-2 shrink-0">
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
                    <Button size="sm" variant="primary" className="text-xs gap-1 h-7">
                      Review <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
