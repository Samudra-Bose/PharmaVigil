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
  Filter,
  ShieldCheck,
  User,
  Pill
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
    <div className="space-y-6">
      {/* Header and Quick Actions */}
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
            <Button size="sm" variant="primary" className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800">
              <Camera className="w-3.5 h-3.5" /> + New Capture
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-t-2 border-t-slate-800 shadow-subtle">
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

        <Card className="border-t-2 border-t-amber-500 bg-amber-50/20 shadow-subtle">
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

        <Card className="border-t-2 border-t-blue-500 bg-blue-50/20 shadow-subtle">
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

        <Card className="border-t-2 border-t-teal-600 bg-teal-50/20 shadow-subtle">
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" role="tablist" aria-label="Queue Filter">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
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
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases or medications..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Cases Listing */}
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
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
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
                    <TableRow key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono font-bold text-slate-900 font-tabular">
                        {c.id}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                          {c.patientId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-3 h-3 text-slate-400" />
                          {c.items.length} medication{c.items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                          {c.items.map((i) => i.canonicalIngredientIds.join(", ")).join("; ")}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-slate-700 font-tabular font-medium">
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
          </div>

          {/* Mobile Reflow Card View */}
          <div className="md:hidden space-y-3">
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              return (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3"
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
                      Rev {c.currentRevisionNumber} • {formatDateTime(c.updatedAt)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <div className="font-semibold text-slate-800">
                      {c.items.length} prescribed medication{c.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
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
                    <Button size="sm" variant="primary" className="w-full text-xs gap-1.5 h-8">
                      Open Clinical Case <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
