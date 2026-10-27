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
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowRight,
  ShieldAlert 
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
              + New Revision
            </Button>
          </Link>
        </div>
      </div>

      {/* Urgent Alert Callout */}
      {tasks.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Active Clinical Alerts Pending Review ({tasks.length}):</span> Pharmacy
            dispensing authorization is blocked on these cases until a doctor records a clinical disposition with rationale.
          </div>
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Rule & Concern</th>
                  <th className="py-3 px-4">Case / Patient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tasks.map(({ caseId, alert, revisionNumber, patientId }) => (
                  <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={getSeverityVariant(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-slate-900 font-mono text-[11px]">
                        {alert.ruleId} (v{alert.ruleVersion})
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                        {alert.rationale}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">{caseId}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Patient: {patientId} • Rev {revisionNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="moderate" icon={false} className="text-[10px] uppercase font-mono">
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/doctor/tasks/${alert.id}?caseId=${caseId}`}>
                        <Button size="sm" variant="primary" className="text-xs gap-1 h-7">
                          Review Case <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
