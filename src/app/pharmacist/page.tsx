"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { INITIAL_FIXTURE_CASE, type FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Camera,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  User,
  Pill,
  X,
  Lock,
  ChevronRight,
  Activity,
  Layers,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const data = await api.getCases();
        if (data && data.length > 0) {
          setCases(data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const getStatusBadge = (status: FixtureCase["status"]): { variant: BadgeVariant; label: string } => {
    switch (status) {
      case "CHECK_FLAGGED":
        return { variant: "high", label: "Flagged Concerns (DDI)" };
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

  const activeFlaggedCase = cases.find((c) => c.status === "CHECK_FLAGGED" || c.status === "REVISED");

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. Header Row (Section C.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Prescription Work Queue</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-forest-50 text-forest-900 rounded-full border border-forest-200">
              CDS Deterministic
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic clinical safety verification, drug-drug interaction screening, and gated dispensing authorization.
          </p>
        </div>

        {/* Action Buttons: Zero wrapping, distinct primary vs secondary */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/pharmacist/patients/search">
            <button className="h-8 sm:h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs flex items-center gap-1.5 transition-all whitespace-nowrap">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Search Patient</span>
            </button>
          </Link>

          <Link href="/pharmacist/capture">
            <button className="h-8 sm:h-9 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-lux flex items-center gap-1.5 transition-all whitespace-nowrap">
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              <span>+ New Capture</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Priority Overview: Prominent Blocked Work + Restrained Metric Rail (Section C.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 or 8 cols): Visually Prominent Treatment for Genuine Flagged or Blocked Work */}
        <div className="lg:col-span-8">
          {activeFlaggedCase ? (
            <div className="bg-white rounded-2xl p-5 shadow-lux border-l-4 border-l-rose-500 border-t border-r border-b border-slate-100 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-950 font-mono">
                      Priority Safety Flag • Dispensing Blocked (Fails-Closed)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Rule: DDI-CYP3A4-ATOR-CLAR
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1 border-t border-slate-100/80">
                  <div>
                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono">{activeFlaggedCase.id}</span>
                      <span className="text-slate-300">•</span>
                      <span>Patient: Rajan Sharma ({activeFlaggedCase.patientId})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Cardiology Outpatient • Attending: Dr. Sarah Chen • Revision {activeFlaggedCase.currentRevisionNumber}
                    </div>
                  </div>

                  <Badge variant="high" className="text-xs shrink-0 self-start sm:self-auto">
                    Severe DDI Hazard
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Pharmacological Conflict:</span>{" "}
                  Concurrent administration of <span className="font-semibold text-slate-900">Atorvastatin 40mg</span> and{" "}
                  <span className="font-semibold text-slate-900">Clarithromycin 500mg</span> causes potent CYP3A4 enzyme inhibition, markedly increasing statin systemic exposure and rhabdomyolysis hazard.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Dispensing Authorization Locked: Requires Attending Physician Disposition</span>
                </div>

                <Link href={`/pharmacist/cases/${activeFlaggedCase.id}/results`} className="shrink-0">
                  <button className="h-8 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                    <span>Review Contraindication</span>
                    <ArrowRight className="w-3 h-3 text-emerald-300" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-lux border border-slate-100 flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Safety Queue Clear</h3>
                  <p className="text-xs text-slate-500">All prescription cases are processed or cleared for outpatient dispensing.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right (4 or 5 cols): Restrained Operational Metric Rail */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-forest-900" /> Queue Summary
              </span>
              <span className="text-[10px] font-mono text-slate-400">v1.0.0-illustrative</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  Flagged Concerns
                </span>
                <span className="font-mono font-bold text-rose-700 font-tabular text-sm">
                  {countFlagged}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  Active in Queue
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {cases.length}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  Ready to Dispense
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {countReady}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Authorized
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {countAuthorized}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Safety Isolation:</span>
            <span className="font-semibold text-emerald-700">100% Gated RBAC</span>
          </div>
        </div>
      </div>

      {/* 3. Work Toolbar: Unified Filters & Search Region (Section C.3) */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-100 shadow-lux flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Segmented Pill Tabs with explicit active states */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl select-none">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            All Cases ({cases.length})
          </button>
          <button
            onClick={() => setFilter("NEEDS_ACTION")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "NEEDS_ACTION"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Needs Action ({countFlagged})
          </button>
          <button
            onClick={() => setFilter("READY")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "READY"
                ? "bg-white text-teal-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Ready ({countReady})
          </button>
          <button
            onClick={() => setFilter("AUTHORIZED")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === "AUTHORIZED"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            Authorized ({countAuthorized})
          </button>
        </div>

        {/* Accessible Search Input */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter queue or medication..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Case List: Master Data Table on Desktop, Useful Card List on Mobile (Section C.4) */}
      {loading ? (
        <PrescriptionTableSkeleton rowCount={5} className="my-4" />
      ) : filteredCases.length === 0 ? (
        <EmptyState
          title="No prescription cases match this filter"
          description="Search for a synthetic patient or create a new capture to begin the outpatient safety workflow."
          actionLabel="Search Patient (P-9021)"
          onAction={() => (window.location.href = "/pharmacist/patients/search")}
        />
      ) : (
        <>
          {/* Desktop/Tablet Master Data Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lux">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-100">
                  <TableHead className="w-40 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                    Case & Patient
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                    Prescribed Regimen
                  </TableHead>
                  <TableHead className="w-16 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                    <ClinicalTooltip
                      term="Rev"
                      explanation="Prescription version number. Revisions are immutable and increment each time a physician modifies therapy."
                    />
                  </TableHead>
                  <TableHead className="w-44 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                    Safety Status
                  </TableHead>
                  <TableHead className="w-32 text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                    Updated
                  </TableHead>
                  <TableHead className="w-28 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => {
                  const statusInfo = getStatusBadge(c.status);
                  return (
                    <TableRow
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <TableCell className="py-3.5 align-middle">
                        <div className="font-mono font-bold text-xs text-slate-900 font-tabular">
                          {c.id}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{c.patientId}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.items.length} prescribed medication{c.items.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate max-w-xs md:max-w-md font-mono mt-0.5">
                          {c.items.map((i) => i.canonicalIngredientIds.join(", ")).join("; ")}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle text-center font-mono text-xs text-slate-600 font-tabular font-bold">
                        v{c.currentRevisionNumber}
                      </TableCell>

                      <TableCell className="py-3.5 align-middle">
                        <Badge variant={statusInfo.variant} className="text-[11px] whitespace-nowrap">
                          {statusInfo.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 align-middle text-slate-500 font-mono text-[11px] font-tabular whitespace-nowrap">
                        {formatDateTime(c.updatedAt)}
                      </TableCell>

                      <TableCell className="py-3.5 align-middle text-right">
                        <Link
                          href={
                            c.status === "CHECK_PASSED"
                              ? `/pharmacist/cases/${c.id}/authorize`
                              : c.status === "CHECK_FLAGGED"
                              ? `/pharmacist/cases/${c.id}/results`
                              : `/pharmacist/cases/${c.id}/medicines`
                          }
                        >
                          <button className="h-8 px-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1 ml-auto transition-all">
                            <span>Review</span>
                            <ArrowRight className="w-3 h-3 text-emerald-300" />
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Reflow Card View (< 640px) */}
          <div className="sm:hidden space-y-3">
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              return (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lux space-y-3"
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
                    <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <User className="w-3 h-3 text-slate-500" />
                      {c.patientId}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      v{c.currentRevisionNumber} • {formatDateTime(c.updatedAt)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
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
                    <button className="w-full h-9 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                      <span>Open Clinical Case</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 5. Minimalist Quick Synthetic Presets */}
      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span className="text-[11px] text-slate-400 font-mono">Synthetic Patient Records:</span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/pharmacist/patients/confirm?id=P-9021"
            className="font-mono text-[11px] bg-white border border-slate-200/90 px-2.5 py-1 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            P-9021 (Rajan Sharma)
          </Link>
          <Link
            href="/pharmacist/patients/confirm?id=P-9022"
            className="font-mono text-[11px] bg-white border border-slate-200/90 px-2.5 py-1 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            P-9022 (Sunita Verma)
          </Link>
          <Link
            href="/pharmacist/patients/confirm?id=P-9023"
            className="font-mono text-[11px] bg-white border border-slate-200/90 px-2.5 py-1 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            P-9023 (Amit Kumar)
          </Link>
        </div>
      </div>
    </div>
  );
}
