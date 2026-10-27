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
  X,
  ShieldAlert
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
        return { variant: "moderate", label: "Doctor Revised" };
      default:
        return { variant: "neutral", label: status };
    }
  };

  const countFlagged = cases.filter((c) => c.status === "CHECK_FLAGGED" || c.status === "REVISED").length;
  const countReady = cases.filter((c) => c.status === "CHECK_PASSED").length;
  const countAuthorized = cases.filter((c) => c.status === "DISPENSING_AUTHORIZED").length;

  const filteredCases = cases.filter((c) => {
    let matchesStatus = true;
    if (filter === "NEEDS_ACTION") {
      matchesStatus = c.status === "CHECK_FLAGGED" || c.status === "DRAFT_CAPTURE" || c.status === "REVISED";
    } else if (filter === "READY") {
      matchesStatus = c.status === "CHECK_PASSED";
    } else if (filter === "AUTHORIZED") {
      matchesStatus = c.status === "DISPENSING_AUTHORIZED";
    }

    if (!matchesStatus) return false;

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

  return (
    <div className="space-y-4">
      {/* 1. Precision Header: Clear Title + Single Dominant Primary Action (No Text Wrap) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="truncate">Prescription Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Prescription verification, deterministic safety checks, and gated dispensing authorization
          </p>
        </div>

        {/* Primary Action Button Group — Zero Text Wrapping */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/pharmacist/patients/search">
            <Button size="sm" variant="outline" className="text-xs h-8 px-2.5 whitespace-nowrap">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-1" /> Search Patient
            </Button>
          </Link>
          <Link href="/pharmacist/capture">
            <Button size="sm" variant="primary" className="text-xs h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white whitespace-nowrap shadow-2xs font-medium">
              <Camera className="w-3.5 h-3.5 text-teal-400 mr-1.5" /> + New Capture
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Quiet Clinical Status Rail (Replaces 4 Bulky Generic Dashboard Cards) */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 px-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {countFlagged > 0 ? (
            <button
              onClick={() => setFilter("NEEDS_ACTION")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-medium hover:bg-amber-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{countFlagged} Flagged Concern{countFlagged > 1 ? "s" : ""}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>0 Flagged</span>
            </span>
          )}

          <span className="text-slate-300">|</span>

          <span className="text-slate-600 font-medium">
            <span className="font-mono font-bold text-slate-900">{cases.length}</span> Active in Queue
          </span>

          <span className="text-slate-300">|</span>

          <span className="text-slate-600">
            <span className="font-mono font-bold text-slate-900">{countReady}</span> Ready to Dispense
          </span>

          <span className="text-slate-300">|</span>

          <span className="text-slate-600">
            <span className="font-mono font-bold text-slate-900">{countAuthorized}</span> Authorized
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span>Engine:</span>
          <span className="text-slate-600 font-medium">v1.0.0-illustrative (Deterministic)</span>
        </div>
      </div>

      {/* 3. Fluid Filter & Search Toolbar (Never Clips at 900px) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
        <div className="overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
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
        </div>

        <div className="relative w-full sm:w-56 md:w-64 shrink-0">
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

      {/* 4. Adaptive Clinical Master Table (Fits 900px Without Horizontal Scroll) */}
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
        <>
          {/* Desktop/Tablet Master Table */}
          <div className="hidden sm:block bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 border-b border-slate-200/80">
                  <TableHead className="w-36 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Case & Patient</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Prescribed Regimen</TableHead>
                  <TableHead className="w-16 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <ClinicalTooltip
                      term="Rev"
                      explanation="Prescription version number. Revisions are immutable and increment each time a physician modifies therapy."
                    />
                  </TableHead>
                  <TableHead className="w-44 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Safety Status</TableHead>
                  <TableHead className="w-28 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Updated</TableHead>
                  <TableHead className="w-24 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => {
                  const statusInfo = getStatusBadge(c.status);
                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0">
                      <TableCell className="align-top py-2.5">
                        <div className="font-mono font-semibold text-xs text-slate-900 font-tabular">
                          {c.id}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{c.patientId}</span>
                        </div>
                      </TableCell>

                      <TableCell className="align-top py-2.5">
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-3 h-3 text-slate-400" />
                          <span>{c.items.length} medication{c.items.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-xs md:max-w-md font-mono mt-0.5">
                          {c.items.map((i) => i.canonicalIngredientIds.join(", ")).join("; ")}
                        </div>
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-center font-mono text-xs text-slate-600 font-tabular font-medium">
                        v{c.currentRevisionNumber}
                      </TableCell>

                      <TableCell className="align-top py-2.5">
                        <Badge variant={statusInfo.variant} className="text-[11px] whitespace-nowrap">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-slate-500 font-mono text-[11px] font-tabular whitespace-nowrap">
                        {formatDateTime(c.updatedAt)}
                      </TableCell>

                      <TableCell className="align-top py-2.5 text-right">
                        <Link
                          href={
                            c.status === "CHECK_PASSED"
                              ? `/pharmacist/cases/${c.id}/authorize`
                              : c.status === "CHECK_FLAGGED"
                              ? `/pharmacist/cases/${c.id}/results`
                              : `/pharmacist/cases/${c.id}/medicines`
                          }
                        >
                          <Button size="sm" variant="outline" className="text-xs gap-1 h-7 px-2 font-medium whitespace-nowrap">
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

          {/* Mobile Reflow Card View (< 640px) */}
          <div className="sm:hidden space-y-2.5">
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
                      Open Clinical Case <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 5. Minimalist Quick Test Presets */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span className="text-[11px] text-slate-400">Synthetic Test Presets:</span>
        <div className="flex flex-wrap items-center gap-1.5">
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
