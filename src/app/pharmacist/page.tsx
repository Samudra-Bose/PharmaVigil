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
  Lock,
  Stethoscope,
  ShieldCheck,
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
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchPatient = c.patientId.toLowerCase().includes(q);
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

  const activeFlaggedCase = cases.find(
    (c) => c.status === "CHECK_FLAGGED" || c.status === "REVISED",
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header with Editorial Elegance & Clear Primary CTA */}
      <section
        aria-label="Welcome and Quick Actions"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              Pharmacy Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Medication Safety Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time drug-drug interaction screening, deterministic CDS verification, and gated outpatient dispensing.
          </p>
        </div>

        {/* Primary Operational Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/pharmacist/patients/search"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-900 font-semibold text-xs border border-slate-200/90 shadow-2xs inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <User className="size-3.5 text-slate-500" />
            <span>Search Patient</span>
          </Link>

          <Link
            href="/pharmacist/capture"
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/25 inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <Camera className="size-3.5 text-emerald-100" />
            <span>+ Capture Prescription</span>
          </Link>
        </div>
      </section>

      {/* 2. OPERATIONAL PULSE: Unified Metrics Strip with Themed Vibrancy */}
      <section aria-label="Operational Overview" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Metric 1: Flagged Concerns */}
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-rose-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-900">Flagged Concerns</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100/90 text-rose-800 border border-rose-200">
                Action Required
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-rose-700 font-tabular font-mono">
                {countFlagged} Blocked
              </div>
              <p className="text-[11px] text-rose-600/80 mt-0.5 truncate">CYP3A4 Contraindications</p>
            </div>
          </div>

          {/* Metric 2: Active Work Queue */}
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-slate-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Total Work Queue</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
                Active Deck
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-slate-900 font-tabular font-mono">
                {cases.length} Cases
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">Inpatient & Outpatient Rx</p>
            </div>
          </div>

          {/* Metric 3: Ready for Dispensing */}
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-emerald-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Authorized Release</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                100% Gated
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-emerald-700 font-tabular font-mono">
                {countAuthorized} Dispensed
              </div>
              <p className="text-[11px] text-emerald-600/80 mt-0.5 truncate">Pharmacist Authorized</p>
            </div>
          </div>

          {/* Metric 4: Gated Safety Engine Action */}
          <div className="p-4 sm:p-5 bg-teal-50/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-teal-700" />
                <span>Safety Gate</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800 font-bold">
                Deterministic
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-extrabold text-teal-900 font-tabular font-mono">
                Fails Closed
              </div>
              <p className="text-[11px] text-teal-700/80 mt-0.5 truncate">Zero-Leak Guardrail</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HERO CLINICAL ALERT: Flagged Interaction Requiring Action */}
      {activeFlaggedCase && (
        <section
          aria-label="High Priority Case"
          className="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/30 rounded-2xl border border-rose-300/80 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
        >
          <div className="flex items-start gap-4 min-w-0">
            <div className="size-11 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <ShieldAlert className="size-5 text-rose-700" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200">
                  Critical Safety Intercept
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-mono font-bold text-xs text-slate-900">
                  Case #{activeFlaggedCase.id}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">
                  Patient {activeFlaggedCase.patientId}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Major Drug-Drug Interaction: Warfarin + Aspirin Gastrointestinal Bleed Hazard
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Automatic dispensing authorization is locked. Attending physician must record a clinical disposition or issue an adjusted prescription.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href={`/pharmacist/cases/${activeFlaggedCase.id}/results`}
              className="w-full sm:w-auto h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm shadow-rose-600/25 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Review Findings</span>
              <ArrowRight className="size-3 text-white" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. MAIN WORKSPACE: Full-Width Clinical Safety Case Queue */}
      <section aria-label="Prescription Case Queue" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col gap-4">
        {/* Toolbar: Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Rx, Patient MRN, Drug..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl select-none self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({cases.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("NEEDS_ACTION")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === "NEEDS_ACTION"
                  ? "bg-white text-rose-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Action ({countFlagged})
            </button>
            <button
              type="button"
              onClick={() => setFilter("READY")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === "READY"
                  ? "bg-white text-teal-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ready ({countReady})
            </button>
            <button
              type="button"
              onClick={() => setFilter("AUTHORIZED")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === "AUTHORIZED"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Released ({countAuthorized})
            </button>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <PrescriptionTableSkeleton rowCount={4} className="my-2" />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title="No prescription cases match this filter"
            description="Search for a synthetic patient or create a new capture to begin the outpatient safety workflow."
            actionLabel="Search Patient (P-9021)"
            onAction={() =>
              (window.location.href = "/pharmacist/patients/search")
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCases.map((c) => {
              const statusInfo = getStatusBadge(c.status);
              return (
                <div
                  key={c.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors rounded-xl px-2"
                >
                  {/* Left: Pill Icon + Case ID + Patient */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      c.status === "CHECK_FLAGGED"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : c.status === "DISPENSING_AUTHORIZED" || c.status === "CHECK_PASSED"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>
                      <Pill className="size-4" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 font-tabular">
                          {c.id}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-600 flex items-center gap-1">
                          <User className="size-3 text-slate-400" />
                          {c.patientId}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          v{c.currentRevisionNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate max-w-lg font-mono">
                        {c.items
                          .map((i) => i.canonicalIngredientIds.join(", "))
                          .join("; ")}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Badge + CTA */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <Badge
                      variant={statusInfo.variant}
                      className="text-xs whitespace-nowrap"
                    >
                      {statusInfo.label}
                    </Badge>

                    <Link
                      href={
                        c.status === "CHECK_PASSED"
                          ? `/pharmacist/cases/${c.id}/authorize`
                          : c.status === "CHECK_FLAGGED"
                            ? `/pharmacist/cases/${c.id}/results`
                            : `/pharmacist/cases/${c.id}/medicines`
                      }
                      className={`h-7 px-3 rounded-lg text-white font-semibold text-xs shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                        c.status === "CHECK_FLAGGED"
                          ? "bg-rose-700 hover:bg-rose-800"
                          : c.status === "CHECK_PASSED" || c.status === "DISPENSING_AUTHORIZED"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-slate-900 hover:bg-slate-800"
                      }`}
                    >
                      <span>Review</span>
                      <ArrowRight className="size-3 text-white/90" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Synthetic Demo Patient Links */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Synthetic Patient Records:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/pharmacist/patients/P-9021/confirm"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs"
            >
              P-9021 (Rajan)
            </Link>
            <Link
              href="/pharmacist/patients/P-9022/confirm"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs"
            >
              P-9022 (Sunita)
            </Link>
            <Link
              href="/pharmacist/patients/P-9023/confirm"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs"
            >
              P-9023 (Amit)
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Clinical Verification Pipeline (Clean, Compact Stepper) */}
      <section aria-label="Lifecycle Pipeline" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clinical Verification Pipeline</h3>
            <p className="text-[11px] text-slate-500">Deterministic CDS lifecycle stages for active prescription</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full font-semibold">
            Fails Closed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <Link href="/pharmacist/capture" className="block group">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 group-hover:bg-slate-100/70 group-hover:border-slate-300 transition-all flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 1</span>
                <Camera className="size-3.5 text-slate-500 group-hover:text-slate-800" />
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">OCR Capture</div>
              <div className="text-[11px] text-slate-500">WebRTC camera & scanner</div>
            </div>
          </Link>

          <Link href={`/pharmacist/cases/${activeFlaggedCase?.id || "case_rx_9021_01"}/results`} className="block group">
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/70 group-hover:bg-rose-100/70 group-hover:border-rose-300 transition-all flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">Step 2</span>
                <ShieldAlert className="size-3.5 text-rose-600" />
              </div>
              <div className="text-xs font-bold text-rose-900 mt-0.5">DDI Screening</div>
              <div className="text-[11px] text-rose-700 font-medium">CYP3A4 Flagged</div>
            </div>
          </Link>

          <Link href="/doctor" className="block group">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 group-hover:bg-slate-100/70 group-hover:border-slate-300 transition-all flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 3</span>
                <Stethoscope className="size-3.5 text-slate-500 group-hover:text-slate-800" />
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">MD Review</div>
              <div className="text-[11px] text-slate-500">Dr. Arvind Patel</div>
            </div>
          </Link>

          <Link href={`/pharmacist/cases/${activeFlaggedCase?.id || "case_rx_9021_01"}/authorize`} className="block group">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 group-hover:bg-slate-100/70 group-hover:border-slate-300 transition-all flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 4</span>
                <Lock className="size-3.5 text-slate-500 group-hover:text-slate-800" />
              </div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">Dispensing Gate</div>
              <div className="text-[11px] text-amber-700 font-medium">Locked (Closed)</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
