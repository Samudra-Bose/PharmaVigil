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
  Activity,
  Sparkles,
  Building2,
  Zap,
  Check,
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Header with Modern Breadcrumb & Glowing Primary CTA */}
      <section
        aria-label="Welcome and Quick Actions"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-950 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 rounded-full border border-emerald-300 shadow-xs flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              Pharmacy Operations Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Cardiology Outpatient Clinic • Counter 3
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Clinical Safety & Dispensing Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time deterministic CDS screening, pharmacokinetic DDI interlocks, and fail-closed outpatient dispensing.
          </p>
        </div>

        {/* Primary Operational Action Buttons with Radiant Glow */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/pharmacist/patients/search"
            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <User className="size-3.5 text-slate-500" />
            <span>Search Patient</span>
          </Link>

          <Link
            href="/pharmacist/capture"
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald inline-flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Camera className="size-3.5 text-emerald-100" />
            <span>+ Capture Prescription</span>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE HERO BENTO CARD: Deep Botanical Emerald with Visual DDI Node Graphic */}
      {activeFlaggedCase && (
        <section
          aria-label="High Priority Case"
          className="rounded-3xl bg-gradient-to-br from-[#063327] via-[#064e3b] to-[#022c22] border border-emerald-500/30 text-white shadow-xl shadow-emerald-950/20 p-6 sm:p-7 relative overflow-hidden flex flex-col gap-6"
        >
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute -right-20 -top-20 size-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-20 size-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Case Demographics & Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4 min-w-0">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/30 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/40">
                <ShieldAlert className="size-6 text-rose-300" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 flex items-center gap-1.5 shadow-xs">
                    <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Gate Locked: Fails Closed
                  </span>
                  <span className="text-emerald-400/40">•</span>
                  <span className="font-bold text-xs text-emerald-200">
                    Rx Case #9021
                  </span>
                  <span className="text-emerald-400/40">•</span>
                  <span className="text-xs text-emerald-100 font-semibold">
                    Rajan Sharma (MRN: P-9021) • Room 402
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Major Drug-Drug Interaction: Warfarin + Aspirin Bleed Hazard
                </h2>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href={`/pharmacist/cases/${activeFlaggedCase.id}/results`}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-400/20 inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>Review Findings</span>
                <ArrowRight className="size-3.5 text-slate-950" />
              </Link>
            </div>
          </div>

          {/* Bottom Visual: Interactive DDI Node Diagram */}
          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="size-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Pill className="size-4" />
              </div>
              <div>
                <div className="font-bold text-white">Coumadin (Warfarin 5mg)</div>
                <div className="text-[11px] text-emerald-200/70">Oral Tablet • Vitamin K Antagonist</div>
              </div>
            </div>

            {/* Glowing Interlock Conflict Beam */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[11px] font-bold shadow-xs">
              <AlertTriangle className="size-3.5 text-rose-300 shrink-0" />
              <span>Synergistic Platelet & CYP2C9 Bleeding Contraindication</span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="text-right">
                <div className="font-bold text-white">Disprin (Aspirin 100mg)</div>
                <div className="text-[11px] text-emerald-200/70">Oral Tablet • Antiplatelet COX-1</div>
              </div>
              <div className="size-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Pill className="size-4" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. VIBRANT MULTI-HUE OPERATIONAL PULSE BENTO STRIP */}
      <section aria-label="Operational Overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Critical Intercepts (Vibrant Rose) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-50/40 to-white border border-rose-200/90 shadow-[0_2px_8px_rgba(225,29,72,0.06)] flex flex-col justify-between hover:border-rose-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Critical Intercepts</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Action Required
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {countFlagged} Blocked
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Severe DDI Contraindication</p>
          </div>
        </div>

        {/* Metric Card 2: Active Work Queue (Vibrant Cobalt) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white border border-blue-200/90 shadow-[0_2px_8px_rgba(37,99,235,0.06)] flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Active Queue</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Live Deck
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-blue-600 tracking-tight">
              {cases.length} Case{cases.length === 1 ? "" : "s"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Under Clinical Review</p>
          </div>
        </div>

        {/* Metric Card 3: Ready for Dispensing (Vibrant Emerald) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white border border-emerald-200/90 shadow-[0_2px_8px_rgba(16,185,129,0.06)] flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Dispensing Gate</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              100% Gated
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {countAuthorized} Dispensed
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Authorized Releases</p>
          </div>
        </div>

        {/* Metric Card 4: Gated Safety Engine Action (Vibrant Teal) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-50/40 to-white border border-teal-200/90 shadow-[0_2px_8px_rgba(13,148,136,0.06)] flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-teal-600" />
              <span>CDS Guardrail</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
              Zero-Leak
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-teal-700 tracking-tight">
              Fails Closed
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Deterministic Ruleset</p>
          </div>
        </div>
      </section>

      {/* 4. CORE BENTO GRID LAYOUT (8 Cols + 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Clinical Safety Case Queue */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <section
            aria-label="Prescription Case Queue"
            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 flex flex-col gap-4"
          >
            {/* Toolbar: Search & Segmented Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="relative w-full sm:w-80">
                <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by Rx, Patient MRN, Drug..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all shadow-inner/10"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl select-none self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
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
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filter === "NEEDS_ACTION"
                      ? "bg-white text-rose-700 shadow-2xs font-bold"
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
                      ? "bg-white text-teal-700 shadow-2xs font-bold"
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
                  const isFlagged = c.status === "CHECK_FLAGGED" || c.status === "REVISED";
                  return (
                    <div
                      key={c.id}
                      className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
                    >
                      {/* Left: Patient Avatar + Demographics + Medication Pills */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`size-11 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs ${
                            isFlagged
                              ? "bg-rose-50 border-rose-200 text-rose-700 shadow-2xs"
                              : c.status === "DISPENSING_AUTHORIZED" || c.status === "CHECK_PASSED"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs"
                                : "bg-amber-50 border-amber-200 text-amber-700 shadow-2xs"
                          }`}
                        >
                          RS
                        </div>
                        <div className="min-w-0 flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              Rajan Sharma
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium">
                              MRN: {c.patientId}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">
                              Rx #{c.id.replace("case_rx_", "")} (v{c.currentRevisionNumber})
                            </span>
                          </div>

                          {/* Human Readable Medication Pills */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
                              >
                                <Pill className="size-3 text-slate-400" />
                                <span>{item.brandText || item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}</span>
                              </span>
                            ))}
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
                          className={`h-8 px-3.5 rounded-lg text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                            c.status === "CHECK_FLAGGED"
                              ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                              : c.status === "CHECK_PASSED" || c.status === "DISPENSING_AUTHORIZED"
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
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
                Synthetic Patient Profiles:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/pharmacist/patients/P-9021/confirm"
                  className="text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs font-semibold"
                >
                  P-9021 (Rajan Sharma)
                </Link>
                <Link
                  href="/pharmacist/patients/P-9022/confirm"
                  className="text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs font-semibold"
                >
                  P-9022 (Sunita Verma)
                </Link>
                <Link
                  href="/pharmacist/patients/P-9023/confirm"
                  className="text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 transition-colors shadow-2xs font-semibold"
                >
                  P-9023 (Amit Kumar)
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 Cols): Circular Radial Telemetry & Inpatient Bridge Bento */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Bento Card A: Dual-Engine OCR Telemetry with SVG Radial Conic Dial */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="size-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  OCR Dual Verification
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* SVG Radial Conic Ring */}
              <div className="relative size-16 shrink-0 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="99.4, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900">
                  99.4%
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Dual-Engine Accuracy</div>
                <p className="text-xs text-slate-500 mt-0.5">Line-by-line bounding box review active.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Lines Extracted</div>
                <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">2 Lines</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Illegible Tokens</div>
                <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">0 Tokens</div>
              </div>
            </div>

            <Link
              href="/pharmacist/capture"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Camera className="size-3.5 text-emerald-700" />
              <span>Launch Camera Scanner</span>
            </Link>
          </div>

          {/* Bento Card B: Inpatient Orders Bridge */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Inpatient Orders Bridge
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Wards Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cross-check inpatient order schedules (IV push, continuous infusions) against outpatient dispensing records.
            </p>
            <Link
              href="/pharmacist/orders"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>View Inpatient Orders Queue</span>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. CLINICAL VERIFICATION PIPELINE BENTO STRIP (Full-Width Stepper) */}
      <section aria-label="Lifecycle Pipeline" className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Clinical Safety Loop</h3>
            <p className="text-xs text-slate-500">Four mandatory gates every prescription must clear before physical dispensing</p>
          </div>
          <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            Fails Closed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Link href="/pharmacist/capture" className="block group">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 group-hover:bg-slate-100 group-hover:border-slate-300 transition-all flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Gate 1</span>
                <Camera className="size-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Dual OCR Capture</div>
                <div className="text-[11px] text-slate-500 mt-0.5">WebRTC camera & line extraction</div>
              </div>
            </div>
          </Link>

          <Link href={`/pharmacist/cases/${activeFlaggedCase?.id || "case_rx_9021_01"}/results`} className="block group">
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 group-hover:bg-rose-100/80 group-hover:border-rose-300 transition-all flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">Gate 2</span>
                <ShieldAlert className="size-4 text-rose-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-900">Deterministic DDI Screening</div>
                <div className="text-[11px] text-rose-700 font-semibold mt-0.5">Warfarin + Aspirin Blocked</div>
              </div>
            </div>
          </Link>

          <Link href="/doctor" className="block group">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 group-hover:bg-slate-100 group-hover:border-slate-300 transition-all flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Gate 3</span>
                <Stethoscope className="size-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Physician Review & Rationale</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Dr. Arvind Patel (MD)</div>
              </div>
            </div>
          </Link>

          <Link href={`/pharmacist/cases/${activeFlaggedCase?.id || "case_rx_9021_01"}/authorize`} className="block group">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 group-hover:bg-slate-100 group-hover:border-slate-300 transition-all flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Gate 4</span>
                <Lock className="size-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Dispensing Authorization</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Locked Until Clearance</div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
