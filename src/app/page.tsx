"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  Lock,
  Camera,
  Search,
  CheckCircle2,
  Calendar,
  FileSearch,
  BookOpenCheck,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/types";

export default function HomePage() {
  const { role, switchRole, isMockMode } = useAuth();
  const router = useRouter();

  const handleRoleSelect = async (targetRole: UserRole) => {
    if (isMockMode) {
      await switchRole(targetRole);
    } else {
      router.push(`/auth/login?role=${targetRole}`);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* 1. Editorial Header & Live Platform Status */}
      <section
        aria-label="Platform Overview Header"
        className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-3 border-b border-slate-200/70 pb-6"
      >
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200/80 text-forest-900 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Deterministic CDS Engine • Fails-Closed Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Clinical Decision Support & Medication Safety
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Deterministic pharmacological contraindication verification, attending physician review routing, and fails-closed dispensing authorization for hospital outpatient pharmacies.
          </p>
        </div>

        {/* 1-Click Interactive Persona Switcher */}
        <div className="bg-white p-2.5 rounded-2xl shadow-lux border border-slate-100 shrink-0 space-y-1.5">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-1">
            Active Clinician Persona
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1">
            <button
              onClick={() => handleRoleSelect("PHARMACIST")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                role === "PHARMACIST"
                  ? "bg-forest-900 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Pharmacist</span>
            </button>

            <button
              onClick={() => handleRoleSelect("DOCTOR")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                role === "DOCTOR"
                  ? "bg-forest-900 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor (MD)</span>
            </button>

            <button
              onClick={() => handleRoleSelect("PATIENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                role === "PATIENT"
                  ? "bg-forest-900 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>

            <button
              onClick={() => handleRoleSelect("HOSPITAL_ADMIN")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                role === "HOSPITAL_ADMIN"
                  ? "bg-forest-900 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Asymmetric Bento Grid of Clinical Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Highlight: Pharmacist CDS Workspace (8 Cols) */}
        <section
          aria-label="Pharmacist Workspace Preview"
          className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 shadow-lux border border-slate-100 space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-200 text-forest-900 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-forest-900" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pharmacist Clinical Workspace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Prescription verification, camera capture, catalogue matching, and gated dispensing
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-mono font-semibold self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                1 Flagged Hazard In Queue
              </span>
            </div>

            {/* Simulated Live Incident Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">case_rx_9021_01</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">Patient: Rajan Sharma (P-9021)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Rule: DDI-CYP3A4-ATOR-CLAR</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-rose-900">Severe DDI Contraindication:</span>{" "}
                Concurrent administration of <strong className="text-slate-900">Atorvastatin 40mg</strong> and{" "}
                <strong className="text-slate-900">Clarithromycin 500mg</strong> causes potent CYP3A4 enzyme inhibition, markedly increasing statin systemic exposure and rhabdomyolysis hazard.
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-800 font-medium pt-1">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Dispensing Authorization Locked: Attending Physician Disposition Required</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Activity className="w-4 h-4 text-forest-900" />
              <span>Full line-by-line OCR confirmation enabled</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/pharmacist/patients/search">
                <button className="h-9 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Search Patient</span>
                </button>
              </Link>

              <Link href="/pharmacist">
                <button className="h-9 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-lux flex items-center gap-2 transition-all">
                  <span>Open Pharmacist Queue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Secondary Rail: Distinctive High-Craft Dark Card (Rythea Inspiration) (4 Cols) */}
        <section
          aria-label="Doctor Triage Deck Preview"
          className="lg:col-span-4 bg-forest-950 text-white rounded-3xl p-6 sm:p-7 shadow-lux-black space-y-5 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                Physician Disposition
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">
                Doctor Triage Deck
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prioritized clinical conflict queue with mandatory ≥15-character rationale validation and immutable versioned revisions.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Triage Tasks</span>
                <span className="text-white font-bold">1 Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Clinical Rationale</span>
                <span className="text-emerald-400 font-semibold">Mandatory Enforced</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Audit Safety Gate</span>
                <span className="text-emerald-400 font-semibold">Fails-Closed</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <Link href="/doctor">
              <button className="w-full h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all">
                <span>Enter Doctor Triage Deck</span>
                <ArrowRight className="w-3.5 h-3.5 text-forest-950" />
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* 3. Row 2: Patient Companion & Hospital Governance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Patient Care Companion */}
        <section
          aria-label="Patient Care Hub Preview"
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-lux border border-slate-100 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 text-sky-700" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Patient Companion
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              Patient Care Hub
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Plain-language dosing regimen instructions, upcoming consultation booking, and Ground Floor Counter 3 pickup notices without clinical jargon.
            </p>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-800">Verified Patient: Rajan Sharma (MRN: P-9021)</div>
              <div className="text-slate-500 text-[11px]">Cardiology Outpatient Clinic • Metro General Hospital (Room 402)</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link href="/patient">
              <button className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-2 transition-all">
                <span>View Patient Care Hub</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
              </button>
            </Link>
          </div>
        </section>

        {/* Hospital Administration */}
        <section
          aria-label="Hospital Administration Preview"
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-lux border border-slate-100 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Hospital Governance
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              Governance & Compliance Deck
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Staff credential governance (Approve/Suspend/Revoke), published deterministic clinical ruleset explorer, and tamper-evident audit trails.
            </p>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5 text-xs font-mono text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span>Rule Engine:</span>
                <span className="font-bold text-slate-800">v1.0.0-illustrative</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Multi-Tenant Boundary:</span>
                <span className="font-bold text-emerald-700">Enforced</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link href="/admin">
              <button className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-2 transition-all">
                <span>Open Governance Deck</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* 4. Safety Guarantees Bar (Deterministic Precision) */}
      <section
        aria-label="Clinical Safety Guarantees"
        className="bg-white/80 rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-600"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Zero AI Hallucination in CDS</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Fails-Closed Dispensing Lock</span>
        </div>
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Line-by-Line OCR Verification</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Strict Multi-Tenant Isolation</span>
        </div>
      </section>
    </div>
  );
}
