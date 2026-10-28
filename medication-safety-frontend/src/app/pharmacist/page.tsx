"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
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
import { SegmentedControl } from "@/components/heroui/SegmentedControl";
import { formatDateTime } from "@/lib/utils";
import { 
  ClipboardList, 
  Search, 
  Camera, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  User,
  Pill,
  X
} from "lucide-react";

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        return { variant: "moderate", label: "Awaiting MD Review" };
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
    // Status filter
    let matchesStatus = true;
    if (filter === "NEEDS_ACTION") {
      matchesStatus = c.status === "CHECK_FLAGGED" || c.status === "DRAFT_CAPTURE" || c.status === "REVISED";
    } else if (filter === "READY") {
      matchesStatus = c.status === "CHECK_PASSED";
    } else if (filter === "AUTHORIZED") {
      matchesStatus = c.status === "DISPENSING_AUTHORIZED";
    }

    if (!matchesStatus) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchPatient = c.patientId.toLowerCase().includes(q);
      const matchMed = c.items.some(
        (i) =>
          i.canonicalIngredientIds.some((ing) => ing.toLowerCase().includes(q)) ||
          (i.brandText && i.brandText.toLowerCase().includes(q))
      );
      return matchId || matchPatient || matchMed;
    }

    return true;
  });

  const countFlagged = cases.filter((c) => c.status === "CHECK_FLAGGED").length;
  const countReady = cases.filter((c) => c.status === "CHECK_PASSED").length;
  const countAuthorized = cases.filter((c) => c.status === "DISPENSING_AUTHORIZED").length;

  return (
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-700" />
            Pharmacist Work Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription verification, medicine matching, deterministic checks, and gated dispensing authorization
          </p>
        </div>

        {/* Clear Action Prominence: One Primary Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/pharmacist/patients/search">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
              <Search className="w-3.5 h-3.5 text-slate-500" /> Search Patient
            </Button>
          </Link>
          <Link href="/pharmacist/capture">
            <Button size="sm" variant="primary" className="gap-1.5 text-xs h-8 bg-slate-900 hover:bg-slate-800 shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-teal-400" /> + New Capture
            </Button>
          </Link>
        </div>
      </div>

      {/* High-Craft Monolithic Metric Rail */}
      <CossMetricStrip
        metrics={[
          { label: "Active Queue", value: cases.length, icon: ClipboardList, tone: "neutral" },
          { label: "Flagged Concerns", value: countFlagged, icon: AlertTriangle, tone: "urgent" },
          { label: "Ready to Authorize", value: countReady, icon: Clock, tone: "info" },
          { label: "Authorized Dispenses", value: countAuthorized, icon: ShieldCheck, tone: "success" },
        ]}
      />

      {/* Unified Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { id: "ALL", label: "All Cases", count: cases.length },
            { id: "NEEDS_ACTION", label: "Needs Action", count: countFlagged },
            { id: "READY", label: "Ready", count: countReady },
            { id: "AUTHORIZED", label: "Authorized", count: countAuthorized },
          ]}
          ariaLabel="Queue Status Filter"
        />

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter queue or medicine..."
            className="w-full pl-8 pr-7 py-1 text-xs rounded-md border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Cases Listing */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredCases.length === 0 ? (
        <EmptyState
          title="No prescription cases match this filter"
          description="Search for a synthetic patient or create a new capture to begin the outpatient safety workflow."
          actionLabel="Search Patient (P-9021)"
          onAction={() => (window.location.href = "/pharmacist/patients/search")}
        />
      ) : (
        <>
          {/* Desktop High-Density Table */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 border-b border-slate-200/80">
                  <TableHead className="w-36 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Case ID</TableHead>
                  <TableHead className="w-28 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Patient</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Prescribed Medications</TableHead>
                  <TableHead className="w-20 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <ClinicalTooltip
                      term="Rev"
                      explanation="Prescription version number. Revisions are immutable and increment each time a physician modifies therapy."
                    />
                  </TableHead>
                  <TableHead className="w-44 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Safety Status</TableHead>
                  <TableHead className="w-32 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Updated</TableHead>
                  <TableHead className="w-24 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => {
                  const statusInfo = getStatusBadge(c.status);
                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0">
                      <TableCell className="font-mono font-semibold text-xs text-slate-900 font-tabular">
                        {c.id}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-slate-700 bg-slate-100/80 text-[11px] font-medium px-1.5 py-0.5 rounded border border-slate-200/60">
                          {c.patientId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-3 h-3 text-slate-400" />
                          <span>{c.items.length} item{c.items.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm font-mono mt-0.5">
                          {c.items.map((i) => i.canonicalIngredientIds.join(", ")).join("; ")}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600 font-tabular font-medium">
                        v{c.currentRevisionNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="text-[11px]">
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
                          <Button size="sm" variant="outline" className="text-xs gap-1 h-7 px-2 font-medium">
                            Review <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Reflow Card View */}
          <div className="md:hidden space-y-2.5">
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              return (
                <div
                  key={c.id}
                  className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {c.id}
                    </span>
                    <Badge variant={statusInfo.variant} className="text-[10px]">
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      <User className="w-3 h-3 text-slate-500" />
                      {c.patientId}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      v{c.currentRevisionNumber} • {formatDateTime(c.updatedAt)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50/70 p-2 rounded border border-slate-100">
                    <div className="font-medium text-slate-800">
                      {c.items.length} prescribed medication{c.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                      {c.items.map((i) => i.canonicalIngredientIds.join(", ")).join("; ")}
                    </div>
                  </div>

                  <Link
                    href={
                      c.status === "CHECK_PASSED"
                        ? `/pharmacist/cases/${c.id}/authorize`
                        : c.status === "CHECK_FLAGGED"
                        ? `/pharmacist/cases/${c.id}/results`
                        : `/pharmacist/cases/${c.id}/medicines`
                    }
                    className="block"
                  >
                    <Button size="sm" variant="primary" className="w-full text-xs gap-1.5 h-8 bg-slate-900 hover:bg-slate-800">
                      Open Case <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Quick Synthetic Test Presets (Footer Accents) */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span className="text-[11px] text-slate-400">Quick Test Presets:</span>
        <div className="flex items-center gap-2">
          <Link href="/pharmacist/patients/confirm?id=P-9021" className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-50 text-slate-700 transition-colors">
            P-9021 (Rajan Sharma)
          </Link>
          <Link href="/pharmacist/patients/confirm?id=P-9022" className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-50 text-slate-700 transition-colors">
            P-9022 (Sunita Verma)
          </Link>
          <Link href="/pharmacist/patients/confirm?id=P-9023" className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded hover:bg-slate-50 text-slate-700 transition-colors">
            P-9023 (Amit Kumar)
          </Link>
        </div>
      </div>
    </div>
  );
}
