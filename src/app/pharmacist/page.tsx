"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  INITIAL_FIXTURE_CASE,
  type FixtureCase,
} from "@/lib/mock-data/fixtures";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import {
  Search,
  Camera,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  User,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Copy,
  X,
  FileText,
  Lock,
} from "lucide-react";
import { clinicalToast } from "@/lib/toast";

function formatIngredientLabel(raw: string) {
  const map: Record<string, string> = {
    ing_warfarin: "Warfarin Sodium",
    ing_aspirin: "Aspirin Cardio",
    ing_atorvastatin: "Atorvastatin Calcium",
    ing_metformin: "Metformin HCl",
    ing_amoxicillin: "Amoxicillin",
    ing_lisinopril: "Lisinopril",
  };
  return map[raw] || raw.replace(/^ing_/, "").replace(/_/g, " ");
}

function formatPatientMRN(raw: string) {
  if (!raw) return "P-9021";
  if (raw.startsWith("pat_rajan_")) return "P-9021";
  if (raw.startsWith("pat_")) return raw.replace(/^pat_/, "P-");
  return raw;
}

function formatCaseId(caseId: string) {
  if (!caseId) return "9021-01";
  return caseId.replace(/^case_rx_/, "").replace(/_/g, "-");
}

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const copyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      clinicalToast.info(`${label} Copied`, `${text} copied to clipboard.`);
    }
  };

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

  const getStatusBadge = (
    status: FixtureCase["status"],
  ): { variant: BadgeVariant; label: string } => {
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

  const countFlagged = cases.filter(
    (c) => c.status === "CHECK_FLAGGED" || c.status === "REVISED",
  ).length;
  const countReady = cases.filter((c) => c.status === "CHECK_PASSED").length;
  const countAuthorized = cases.filter(
    (c) => c.status === "DISPENSING_AUTHORIZED",
  ).length;

  const filteredCases = cases.filter((c) => {
    let matchesStatus = true;
    if (filter === "NEEDS_ACTION") {
      matchesStatus =
        c.status === "CHECK_FLAGGED" ||
        c.status === "DRAFT_CAPTURE" ||
        c.status === "REVISED";
    } else if (filter === "READY") {
      matchesStatus = c.status === "CHECK_PASSED";
    } else if (filter === "AUTHORIZED") {
      matchesStatus = c.status === "DISPENSING_AUTHORIZED";
    }

    if (!matchesStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.id.toLowerCase().includes(q) || formatCaseId(c.id).toLowerCase().includes(q);
      const matchPatient =
        c.patientId.toLowerCase().includes(q) ||
        formatPatientMRN(c.patientId).toLowerCase().includes(q) ||
        "rajan sharma".includes(q);
      const matchMed = c.items.some(
        (i) =>
          i.canonicalIngredientIds.some((ing) =>
            ing.toLowerCase().includes(q),
          ) ||
          (i.brandText && i.brandText.toLowerCase().includes(q)),
      );
      return matchId || matchPatient || matchMed;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* 1. Clean, Minimal Header */}
      <section
        aria-label="Welcome and Quick Actions"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2 border-b border-slate-200/80"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-teal-600" />
              Pharmacy Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Prescription Safety Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Automated clinical interaction screening, fail-closed safety interlocks, and dispensing authorization.
          </p>
        </div>

        {/* Primary Operational Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/pharmacist/patients/search"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <User className="size-3.5 text-slate-500" />
            <span>Search Patient</span>
          </Link>

          <Link
            href="/pharmacist/capture"
            className="h-9 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="size-3.5 text-teal-100" />
            <span>+ Capture Prescription</span>
          </Link>
        </div>
      </section>

      {/* 2. Simple 3-Metric Overview Strip (Calm, Airy, No Heavy Gradients) */}
      <section aria-label="Operational Overview" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Action Required */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5 text-rose-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Action Required</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {countFlagged} Blocked {countFlagged === 1 ? "Case" : "Cases"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            High Risk
          </span>
        </div>

        {/* Metric 2: Active Queue */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Total in Queue</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {cases.length} {cases.length === 1 ? "Prescription" : "Prescriptions"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Live
          </span>
        </div>

        {/* Metric 3: Released / Authorized */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Dispensing Gate</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {countAuthorized} Released
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Safe
          </span>
        </div>
      </section>

      {/* 3. Streamlined Main Work Queue */}
      <section
        aria-label="Prescription Case Queue"
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col gap-4"
      >
        {/* Toolbar: Search & Clean Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Rx, Patient MRN, Drug..."
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl select-none self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("NEEDS_ACTION")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "NEEDS_ACTION"
                  ? "bg-white text-rose-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Action Required ({countFlagged})
            </button>
            <button
              type="button"
              onClick={() => setFilter("READY")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "READY"
                  ? "bg-white text-teal-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ready ({countReady})
            </button>
            <button
              type="button"
              onClick={() => setFilter("AUTHORIZED")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "AUTHORIZED"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Released ({countAuthorized})
            </button>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <PrescriptionTableSkeleton rowCount={3} className="my-2" />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title="No prescription cases match this filter"
            description="Search for a synthetic patient or create a new capture to begin the outpatient safety workflow."
            actionLabel={searchQuery ? "Clear Search Filter" : "Search Patient (P-9021)"}
            onAction={
              searchQuery
                ? () => setSearchQuery("")
                : () => (window.location.href = "/pharmacist/patients/search")
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              const isFlagged = c.status === "CHECK_FLAGGED" || c.status === "REVISED";
              const isAuthorized = c.status === "DISPENSING_AUTHORIZED";
              const isReadyToAuth = c.status === "CHECK_PASSED";

              return (
                <div
                  key={c.id}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Patient Avatar + Demographics + Prescription Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs ${
                          isFlagged
                            ? "bg-rose-50 border-rose-200 text-rose-700 shadow-2xs"
                            : isAuthorized || isReadyToAuth
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs"
                              : "bg-amber-50 border-amber-200 text-amber-700 shadow-2xs"
                        }`}
                      >
                        RS
                      </div>
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">
                            Rajan Sharma
                          </span>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(formatPatientMRN(c.patientId), "Patient MRN");
                            }}
                            className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer group/copy"
                            title="Click to copy Patient MRN"
                          >
                            <span>MRN: {formatPatientMRN(c.patientId)}</span>
                            <Copy className="size-2.5 text-slate-400 group-hover/copy:text-slate-700" />
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(formatCaseId(c.id), "Rx Case ID");
                            }}
                            className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold border border-slate-200/60 inline-flex items-center gap-1 transition-colors cursor-pointer group/copy"
                            title="Click to copy Rx Case ID"
                          >
                            <span>Rx #{formatCaseId(c.id)} (v{c.currentRevisionNumber})</span>
                            <Copy className="size-2.5 text-slate-400 group-hover/copy:text-slate-700" />
                          </button>
                        </div>

                        {/* Prescribed Medications */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {c.items.map((item, idx) => {
                            const ingredient = formatIngredientLabel(item.canonicalIngredientIds[0] || "");
                            const label = item.brandText ? `${item.brandText} (${ingredient})` : ingredient;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-700"
                              >
                                <Pill className="size-2.5 text-slate-400" />
                                <span>{label}</span>
                                <span className="font-mono text-slate-500 font-semibold">
                                  {item.strengthValue}{item.strengthUnit}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge & Primary Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>

                      {isFlagged ? (
                        <Link
                          href={`/pharmacist/cases/${c.id}/results`}
                          className="h-8 px-3.5 rounded-lg bg-teal-700 hover:bg-teal-600 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <span>Review Findings</span>
                          <ArrowRight className="size-3 text-teal-100" />
                        </Link>
                      ) : isReadyToAuth ? (
                        <Link
                          href={`/pharmacist/cases/${c.id}/authorize`}
                          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <span>Authorize Dispense</span>
                          <ArrowRight className="size-3 text-emerald-100" />
                        </Link>
                      ) : isAuthorized ? (
                        <Link
                          href={`/pharmacist/cases/${c.id}/results`}
                          className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>View Clearance</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/pharmacist/cases/${c.id}/medicines`}
                          className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>Resume Intake</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Clean Contextual Alert Banner inside the Card if Flagged */}
                  {isFlagged && (
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ml-0 sm:ml-13">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                        <span className="font-semibold">
                          Major Interaction Alert: Warfarin + Aspirin Bleed Hazard.
                        </span>
                        <span className="text-rose-700 hidden md:inline">
                          Dispensing interlock fails closed until attending physician rationale is signed.
                        </span>
                      </div>
                      <Link
                        href={`/pharmacist/cases/${c.id}/results`}
                        className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0"
                      >
                        Inspect Evidence →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Subtle System Status Note */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Deterministic CDS Ruleset: v1.0.0-illustrative (Fail-Closed)</span>
        </div>
        <div>
          <span>Safety Interlock: Active</span>
        </div>
      </div>
    </div>
  );
}
