"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Kbd } from "@/components/ui/Kbd";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { formatDateTime } from "@/lib/utils";
import { 
  ClipboardList, 
  Search, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter,
  ShieldCheck
} from "lucide-react";

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const data = await api.getCases();
        setCases(data);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const getStatusBadge = (status: FixtureCase["status"]): { variant: BadgeVariant; label: string } => {
    switch (status) {
      case "CHECK_FLAGGED":
        return { variant: "high", label: "Flagged Concerns" };
      case "DOCTOR_REVIEW":
        return { variant: "moderate", label: "Awaiting Doctor Review" };
      case "CHECK_PASSED":
        return { variant: "info", label: "Ready to Authorize" };
      case "DISPENSING_AUTHORIZED":
        return { variant: "authorized", label: "Dispensing Authorized" };
      case "DRAFT_CAPTURE":
        return { variant: "neutral", label: "Capture Draft" };
      case "MEDICINES_CONFIRMED":
        return { variant: "neutral", label: "Medicines Confirmed" };
      case "REVISED":
        return { variant: "moderate", label: "Doctor Revised (Needs Check)" };
      default:
        return { variant: "neutral", label: status };
    }
  };

  const filteredCases = cases.filter((c) => {
    if (filter === "ALL") return true;
    if (filter === "NEEDS_ACTION") return c.status === "CHECK_FLAGGED" || c.status === "DRAFT_CAPTURE" || c.status === "REVISED";
    if (filter === "READY") return c.status === "CHECK_PASSED";
    if (filter === "AUTHORIZED") return c.status === "DISPENSING_AUTHORIZED";
    return true;
  });

  const countFlagged = cases.filter((c) => c.status === "CHECK_FLAGGED").length;
  const countReady = cases.filter((c) => c.status === "CHECK_PASSED").length;
  const countAuthorized = cases.filter((c) => c.status === "DISPENSING_AUTHORIZED").length;

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" />
            Pharmacist Outpatient Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription verification, medicine matching, deterministic checks, and gated dispensing authorization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pharmacist/patients/search">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Search className="w-3.5 h-3.5" /> Search Patient <Kbd className="hidden md:inline">P-9021</Kbd>
            </Button>
          </Link>
          <Link href="/pharmacist/capture">
            <Button size="sm" variant="primary" className="gap-1.5 text-xs">
              <Camera className="w-3.5 h-3.5" /> + New Capture
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-t-2 border-t-slate-800 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Active Cases</span>
              <ClipboardList className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight font-tabular">
              {cases.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-amber-500 bg-amber-50/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
              <span>Flagged for Doctor</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-950 mt-1 font-mono tracking-tight font-tabular">
              {countFlagged}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-blue-500 bg-blue-50/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-blue-900 font-medium">
              <span>Ready for Authorization</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-950 mt-1 font-mono tracking-tight font-tabular">
              {countReady}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-teal-600 bg-teal-50/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-teal-900 font-medium">
              <span>Authorized Dispenses</span>
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-950 mt-1 font-mono tracking-tight font-tabular">
              {countAuthorized}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-600 mr-2">Filter Queue:</span>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Queue Filter">
          {[
            { id: "ALL", label: "All Cases" },
            { id: "NEEDS_ACTION", label: "Needs Action" },
            { id: "READY", label: "Ready to Authorize" },
            { id: "AUTHORIZED", label: "Authorized" },
          ].map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter === f.id
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : filteredCases.length === 0 ? (
        <EmptyState
          title="No prescription cases match this filter"
          description="Search for a synthetic patient or create a new capture to begin the outpatient safety workflow."
          actionLabel="Search Patient (P-9021)"
          onAction={() => (window.location.href = "/pharmacist/patients/search")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Case ID</TableHead>
              <TableHead className="w-28">Patient ID</TableHead>
              <TableHead>Prescribed Medicines</TableHead>
              <TableHead className="w-24">
                <ClinicalTooltip
                  term="Revision"
                  explanation="Prescription version number. Revisions are immutable and increment each time a physician modifies therapy."
                />
              </TableHead>
              <TableHead className="w-48">Status & Safety Gate</TableHead>
              <TableHead className="w-36">Updated</TableHead>
              <TableHead className="w-28 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-bold text-slate-900 font-tabular">
                    {c.id}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                      {c.patientId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">
                      {c.items.length} medication{c.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-sm">
                      {c.items.map((i) => i.canonicalIngredientIds.join(", ")).join("; ")}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 font-tabular">
                    Rev {c.currentRevisionNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-[11px] font-tabular">
                    {formatDateTime(c.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={
                        c.status === "CHECK_PASSED"
                          ? `/pharmacist/cases/${c.id}/authorize`
                          : c.status === "CHECK_FLAGGED"
                          ? `/pharmacist/cases/${c.id}/results`
                          : `/pharmacist/cases/${c.id}/medicines`
                      }
                    >
                      <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                        Open <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
