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
import { DotMatrixWaveform } from "@/components/clinical/DotMatrixWaveform";
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
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  Activity,
  HeartPulse,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function PharmacistDashboard() {
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"RX" | "ALLERGY" | "LABS">("RX");

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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Rythea-Inspired Editorial Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Check Prescription Safety
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Deterministic Clinical Decision Support</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="font-mono text-slate-600">Outpatient Pharmacy CDS</span>
          </p>
        </div>

        {/* Action Controls & Floating Search Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Rx, Patient or Drug..."
              className="pl-9 pr-8 py-2 text-xs rounded-full border border-slate-200/80 bg-white shadow-lux focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-900 transition-all w-52 sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Link href="/pharmacist/patients/search">
            <button className="h-9 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-lux flex items-center gap-1.5 transition-all">
              <User className="w-3.5 h-3.5 text-slate-500" /> Search Patient
            </button>
          </Link>

          <Link href="/pharmacist/capture">
            <button className="h-9 px-4 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-lux flex items-center gap-1.5 transition-all">
              <Camera className="w-3.5 h-3.5 text-emerald-300" /> + New Capture
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Asymmetric Clinical Hero Grid (Rythea-Inspired Luxury Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Featured Clinical Case & Action Decks */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Card 1: Active Clinical Safety Check Deck */}
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 relative overflow-hidden">
            {/* Header / Subtitle & Action Icons */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Active Clinical Safety Check
                </span>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span>Last Evaluated:</span>
                  <span className="font-semibold text-slate-700">Just Now (Deterministic)</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                  title="Configure CDS Parameters"
                  aria-label="Configure CDS Parameters"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                  title="Export Audit Telemetry"
                  aria-label="Export Audit Telemetry"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                  title="More Case Actions"
                  aria-label="More Case Actions"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Row: Duration, Status, Device/Engine, Big Number */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Turnaround</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">Immediate</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Safety Status</div>
                  <div className="text-sm font-semibold text-rose-600 mt-0.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Flagged (DDI Hazard)
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Attending MD</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">Dr. Sarah Chen</div>
                </div>
              </div>

              {/* Big High-Contrast Numeral Display */}
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-tabular font-mono">
                  2
                </span>
                <span className="text-xs font-semibold text-slate-500">Meds</span>
              </div>
            </div>

            {/* Rythea Red Dot Matrix Clinical Hazard Waveform */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Deterministic Rule Evaluation Waveform</span>
                <span className="text-rose-500 font-medium">Severe DDI Peak Detected</span>
              </div>
              <DotMatrixWaveform />
              <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono pt-2">
                <span>Rule: DDI-CYP3A4-ATOR-CLAR</span>
                <span>Substrate: Atorvastatin • Inhibitor: Clarithromycin</span>
              </div>
            </div>
          </div>

          {/* Sub-Deck: Obsidian Action Card & Regimen Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Obsidian Black High-Contrast Card */}
            <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-lux-black relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="uppercase tracking-wider font-mono font-medium">Critical Safety Gate</span>
                <span className="font-mono text-rose-400">P-9021</span>
              </div>

              <div className="my-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-white font-tabular">
                    1 Severe DDI
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Rhabdomyolysis Risk: Atorvastatin + Clarithromycin
                  </div>
                </div>
              </div>

              <Link href="/pharmacist/cases/case_rx_9021_01/results" className="block w-full">
                <button className="w-full h-9 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                  <span>Inspect Contraindication</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              </Link>
            </div>

            {/* Prescribed Regimen Card */}
            <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="uppercase tracking-wider font-medium">Prescribed Regimen (2)</span>
                  <span className="text-slate-600">Cardiology</span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">Atorvastatin 40mg</div>
                      <div className="text-[10px] text-slate-500 font-mono">Lipitor • 1 tab OD</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">Clarithromycin 500mg</div>
                      <div className="text-[10px] text-slate-500 font-mono">Biaxin • 1 tab BD</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Dispensing State:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Fails-Closed Locked
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Active Patient Telemetry Card (Rythea Style) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 flex-1 flex flex-col justify-between">
            <div>
              {/* Patient Profile Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Rajan Sharma
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    rajan.sharma@demo.hospital.internal
                  </p>
                  <div className="text-xs font-semibold text-slate-600 mt-2">
                    58 years
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-bold font-mono text-sm flex items-center justify-center border border-emerald-200/80 shrink-0 shadow-2xs">
                  RS
                </div>
              </div>

              {/* Patient Metadata Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-4 border-b border-slate-100 text-xs">
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Birth</span>
                  <div className="font-semibold text-slate-800 mt-0.5">12/04/1966</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Gender</span>
                  <div className="font-semibold text-slate-800 mt-0.5">Male</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">ID</span>
                  <div className="font-semibold text-slate-800 font-mono mt-0.5">P-9021</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Phone</span>
                  <div className="font-semibold text-slate-800 font-mono mt-0.5">(555) 019-2831</div>
                </div>
              </div>

              {/* Pill Switcher (Rythea Style) */}
              <div className="py-4">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full">
                  <button
                    onClick={() => setActiveTab("RX")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      activeTab === "RX"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Active Rx (2)
                  </button>
                  <button
                    onClick={() => setActiveTab("ALLERGY")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      activeTab === "ALLERGY"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Allergies (1)
                  </button>
                  <button
                    onClick={() => setActiveTab("LABS")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      activeTab === "LABS"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Vitals & Labs
                  </button>
                </div>

                <div className="mt-3">
                  {activeTab === "RX" && (
                    <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1">
                      <div className="font-medium text-slate-800 flex items-center justify-between">
                        <span>Cardiovascular Regimen</span>
                        <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Action Required</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Concurrent administration of moderate/severe CYP3A4 inhibitors with statins requires dosage review.
                      </p>
                    </div>
                  )}

                  {activeTab === "ALLERGY" && (
                    <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="font-medium text-slate-800">Penicillin (Mild Rash)</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        No cross-reactivity with prescribed macrolide or statin regimen.
                      </p>
                    </div>
                  )}

                  {activeTab === "LABS" && (
                    <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="font-medium text-slate-800">Renal Function Panel</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        eGFR: 68 mL/min (Grade G2 Mild Reduction). Dosage parameters within guidelines.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Tiles (Rythea Style) */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-medium">BP Telemetry</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 font-tabular">
                  140/90 <span className="text-xs font-normal text-slate-500">mmHg</span>
                </div>
                <span className="text-[10px] text-amber-600 font-medium mt-1 inline-block">
                  Stage 2 HTN
                </span>
              </div>

              {/* Obsidian Mini-Tile */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white shadow-lux-black flex flex-col justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-medium">Gate Integrity</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 font-tabular">
                  100% Gated
                </div>
                <span className="text-[10px] text-slate-300 font-medium mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> Dispensing Locked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Prescription Work Queue Ledger (Sculpted Luxury Table) */}
      <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 space-y-4">
        {/* Ledger Header & Segmented Pill Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Prescription Work Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review flagged clinical alerts, inspect OCR transcriptions, and complete dispensing clearance
            </p>
          </div>

          {/* Smooth Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-full select-none">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Cases ({cases.length})
            </button>
            <button
              onClick={() => setFilter("NEEDS_ACTION")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                filter === "NEEDS_ACTION"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Needs Action ({countFlagged})
            </button>
            <button
              onClick={() => setFilter("READY")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                filter === "READY"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ready ({countReady})
            </button>
            <button
              onClick={() => setFilter("AUTHORIZED")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                filter === "AUTHORIZED"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Authorized ({countAuthorized})
            </button>
          </div>
        </div>

        {/* Master Clinical Table */}
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
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
            {/* Desktop / Tablet Ledger Table (Responsive without horizontal scroll at 900px) */}
            <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100">
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
                        className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-b-0"
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
                            <span>{c.items.length} medication{c.items.length !== 1 ? "s" : ""}</span>
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
                            <button className="h-8 px-3 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1 ml-auto transition-all">
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

            {/* Mobile Card View (< 640px) */}
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
                      <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
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
                      <button className="w-full h-9 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
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

        {/* Minimalist Quick Test Presets */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Synthetic Patient Records:</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/pharmacist/patients/confirm?id=P-9021"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              P-9021 (Rajan Sharma)
            </Link>
            <Link
              href="/pharmacist/patients/confirm?id=P-9022"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              P-9022 (Sunita Verma)
            </Link>
            <Link
              href="/pharmacist/patients/confirm?id=P-9023"
              className="font-mono text-[11px] bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              P-9023 (Amit Kumar)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
