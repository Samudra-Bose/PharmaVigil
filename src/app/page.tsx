"use client";

import React, { useEffect } from "react";
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
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/types";

export default function HomePage() {
  const { user, role, switchRole, isMockMode, isLoading } = useAuth();
  const router = useRouter();

  const handleRoleSelect = async (targetRole: UserRole) => {
    if (isMockMode) {
      await switchRole(targetRole);
    } else {
      router.push(`/auth/login?role=${targetRole}`);
    }
  };

  const getWorkspaceHref = (r: UserRole | null) => {
    switch (r) {
      case "PHARMACIST":
        return "/pharmacist";
      case "DOCTOR":
        return "/doctor";
      case "PATIENT":
        return "/patient";
      case "HOSPITAL_ADMIN":
        return "/admin";
      default:
        return "/pharmacist";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with calm typography & platform status */}
      <section
        aria-label="Platform Overview Header"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              Deterministic CDS Engine Active
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Tenancy: <span className="font-semibold text-slate-700">Metro General Hospital</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Clinical Decision Support & Medication Safety</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Deterministic pharmacological contraindication verification, attending physician review routing, and fails-closed outpatient dispensing.
          </p>
        </div>

        {/* 1-Click Persona Switcher */}
        <div className="bg-white p-2 rounded-2xl shadow-lux border border-slate-200/70 shrink-0 flex flex-col gap-1">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-1">
            Active Clinician Persona
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleRoleSelect("PHARMACIST")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "PHARMACIST"
                  ? "bg-[#111317] text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              <Pill className="size-3 text-emerald-400" />
              <span>Pharmacist</span>
            </button>

            <button
              onClick={() => handleRoleSelect("DOCTOR")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "DOCTOR"
                  ? "bg-[#111317] text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              <Stethoscope className="size-3 text-slate-400" />
              <span>Doctor (MD)</span>
            </button>

            <button
              onClick={() => handleRoleSelect("PATIENT")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "PATIENT"
                  ? "bg-[#111317] text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              <UserCheck className="size-3 text-slate-400" />
              <span>Patient</span>
            </button>

            <button
              onClick={() => handleRoleSelect("HOSPITAL_ADMIN")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "HOSPITAL_ADMIN"
                  ? "bg-[#111317] text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              <ShieldAlert className="size-3 text-slate-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Active Session Workspace Quick-Access Banner */}
      {user && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0">
              {role === "PHARMACIST" && <Pill className="size-5 text-emerald-800" />}
              {role === "DOCTOR" && <Stethoscope className="size-5 text-emerald-800" />}
              {role === "PATIENT" && <UserCheck className="size-5 text-emerald-800" />}
              {role === "HOSPITAL_ADMIN" && <ShieldAlert className="size-5 text-emerald-800" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Active Session</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-emerald-800">
                  {role === "PHARMACIST"
                    ? "Pharmacy CDS Lead"
                    : role === "DOCTOR"
                      ? "Attending Physician"
                      : role === "PATIENT"
                        ? "Patient Care Hub"
                        : "Hospital Administrator"}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {user.displayName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={getWorkspaceHref(role)}
              className="h-9 px-4 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Open {role === "PHARMACIST" ? "Pharmacist Workspace" : role === "DOCTOR" ? "Doctor Triage" : role === "PATIENT" ? "Patient Hub" : "Admin Deck"}</span>
              <ArrowRight data-icon="inline-end" className="size-3.5 text-emerald-400" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Four Clinical Portals Gateway (Clean Hairline Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portal 1: Pharmacist CDS Workspace */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0">
                <Pill className="size-5 text-emerald-800" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                1 Flagged Hazard
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pharmacist Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Real-time DDI contraindication verification, camera prescription capture, and gated dispensing.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/pharmacist/patients/search" className="text-xs text-slate-500 hover:text-slate-800">
              Search Patient
            </Link>
            <Link
              href="/pharmacist"
              className="h-8 px-3 rounded-lg bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-emerald-400" />
            </Link>
          </div>
        </div>

        {/* Portal 2: Doctor Triage Deck */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <Stethoscope className="size-5" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Decision Required
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Doctor Triage Deck
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Clinical conflict queue with mandatory ≥15-character rationale validation and immutable therapy revisions.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/doctor/prescriptions/new" className="text-xs text-slate-500 hover:text-slate-800">
              + New Revision
            </Link>
            <Link
              href="/doctor"
              className="h-8 px-3 rounded-lg bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-emerald-400" />
            </Link>
          </div>
        </div>

        {/* Portal 3: Patient Care Hub */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <UserCheck className="size-5" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                MRN: P-9021
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Patient Care Hub
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Plain-language dosing regimen instructions, cardiology visit booking, and Ground Floor Counter 3 pickup info.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/patient/appointments/new" className="text-xs text-slate-500 hover:text-slate-800">
              Book Visit
            </Link>
            <Link
              href="/patient"
              className="h-8 px-3 rounded-lg bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-emerald-400" />
            </Link>
          </div>
        </div>

        {/* Portal 4: Hospital Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="size-5" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Strict RBAC
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hospital Administration
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Staff credential governance, published deterministic clinical ruleset explorer, and tamper-evident audit trails.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/admin/audit" className="text-xs text-slate-500 hover:text-slate-800">
              Audit Trail
            </Link>
            <Link
              href="/admin"
              className="h-8 px-3 rounded-lg bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-emerald-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Safety Guarantees Bar (Hairline Strip) */}
      <section
        aria-label="Clinical Safety Guarantees"
        className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-lux"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 px-3 py-2 first:pl-0">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Zero AI Hallucination in CDS</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <Lock className="size-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Fails-Closed Dispensing Gate</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <Pill className="size-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Line-by-Line OCR Verification</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 last:pr-0">
            <Shield className="size-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">Strict Multi-Tenant Isolation</span>
          </div>
        </div>
      </section>
    </div>
  );
}
