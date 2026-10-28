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
        <div className="bg-white p-2.5 rounded-2xl shadow-lux border border-slate-200/80 shrink-0 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>Clinical Persona Theme</span>
            <span className="text-[9px] text-emerald-600 font-sans font-semibold">Live Mode</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleRoleSelect("PHARMACIST")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "PHARMACIST"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                  : "bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 border border-emerald-200/60"
              }`}
            >
              <Pill className={`size-3 ${role === "PHARMACIST" ? "text-emerald-100" : "text-emerald-600"}`} />
              <span>Pharmacist</span>
            </button>

            <button
              onClick={() => handleRoleSelect("DOCTOR")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "DOCTOR"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                  : "bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 border border-blue-200/60"
              }`}
            >
              <Stethoscope className={`size-3 ${role === "DOCTOR" ? "text-blue-100" : "text-blue-600"}`} />
              <span>Doctor (MD)</span>
            </button>

            <button
              onClick={() => handleRoleSelect("PATIENT")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "PATIENT"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-600/25"
                  : "bg-violet-50/50 hover:bg-violet-100/70 text-violet-900 border border-violet-200/60"
              }`}
            >
              <UserCheck className={`size-3 ${role === "PATIENT" ? "text-violet-100" : "text-violet-600"}`} />
              <span>Patient</span>
            </button>

            <button
              onClick={() => handleRoleSelect("HOSPITAL_ADMIN")}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                role === "HOSPITAL_ADMIN"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25"
                  : "bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900 border border-indigo-200/60"
              }`}
            >
              <ShieldAlert className={`size-3 ${role === "HOSPITAL_ADMIN" ? "text-indigo-100" : "text-indigo-600"}`} />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Active Session Workspace Quick-Access Banner */}
      {user && (
        <div
          className={`rounded-2xl border p-5 shadow-lux flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            role === "PHARMACIST"
              ? "bg-gradient-to-r from-emerald-50/80 via-teal-50/30 to-white border-emerald-200/90"
              : role === "DOCTOR"
                ? "bg-gradient-to-r from-blue-50/80 via-sky-50/30 to-white border-blue-200/90"
                : role === "PATIENT"
                  ? "bg-gradient-to-r from-violet-50/80 via-purple-50/30 to-white border-violet-200/90"
                  : "bg-gradient-to-r from-indigo-50/80 via-slate-50/30 to-white border-indigo-200/90"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`size-11 rounded-xl flex items-center justify-center shrink-0 border ${
                role === "PHARMACIST"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : role === "DOCTOR"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : role === "PATIENT"
                      ? "bg-violet-100 text-violet-800 border-violet-200"
                      : "bg-indigo-100 text-indigo-800 border-indigo-200"
              }`}
            >
              {role === "PHARMACIST" && <Pill className="size-5 text-emerald-800" />}
              {role === "DOCTOR" && <Stethoscope className="size-5 text-blue-800" />}
              {role === "PATIENT" && <UserCheck className="size-5 text-violet-800" />}
              {role === "HOSPITAL_ADMIN" && <ShieldAlert className="size-5 text-indigo-800" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Active Session</span>
                <span className="text-slate-300">•</span>
                <span
                  className={`text-xs font-semibold ${
                    role === "PHARMACIST"
                      ? "text-emerald-800"
                      : role === "DOCTOR"
                        ? "text-blue-800"
                        : role === "PATIENT"
                          ? "text-violet-800"
                          : "text-indigo-800"
                  }`}
                >
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
              className={`h-9 px-4 rounded-xl text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer ${
                role === "PHARMACIST"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : role === "DOCTOR"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                    : role === "PATIENT"
                      ? "bg-violet-600 hover:bg-violet-700 shadow-violet-600/20"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
              }`}
            >
              <span>Open {role === "PHARMACIST" ? "Pharmacist Workspace" : role === "DOCTOR" ? "Doctor Triage" : role === "PATIENT" ? "Patient Hub" : "Admin Deck"}</span>
              <ArrowRight data-icon="inline-end" className="size-3.5 text-white/90" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Four Clinical Portals Gateway (Themed Presentable Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portal 1: Pharmacist CDS Workspace */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-lux flex flex-col justify-between hover:border-emerald-300 hover:shadow-emerald-500/10 transition-all group overflow-hidden relative">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Pill className="size-5 text-emerald-700" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                1 Flagged Hazard
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span>Pharmacy Operations</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Pharmacist Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Real-time DDI contraindication verification, camera prescription capture, and gated dispensing.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/pharmacist/patients/search" className="text-xs font-medium text-emerald-700 hover:text-emerald-900">
              Search Patient
            </Link>
            <Link
              href="/pharmacist"
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-white/90" />
            </Link>
          </div>
        </div>

        {/* Portal 2: Doctor Triage Deck */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-lux flex flex-col justify-between hover:border-blue-300 hover:shadow-blue-500/10 transition-all group overflow-hidden relative">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-sky-400" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Stethoscope className="size-5 text-blue-600" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Decision Required
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <span>Clinical Triage</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Doctor Triage Deck
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Clinical conflict queue with mandatory ≥15-character rationale validation and immutable therapy revisions.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/doctor/prescriptions/new" className="text-xs font-medium text-blue-700 hover:text-blue-900">
              + New Revision
            </Link>
            <Link
              href="/doctor"
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-white/90" />
            </Link>
          </div>
        </div>

        {/* Portal 3: Patient Care Hub */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-lux flex flex-col justify-between hover:border-violet-300 hover:shadow-violet-500/10 transition-all group overflow-hidden relative">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-purple-400" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-violet-50 border border-violet-200/80 text-violet-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="size-5 text-violet-600" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200">
                MRN: P-9021
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                <span>Personal Care Hub</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Patient Care Hub
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Plain-language dosing regimen instructions, cardiology visit booking, and Ground Floor Counter 3 pickup info.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/patient/appointments/new" className="text-xs font-medium text-violet-700 hover:text-violet-900">
              Book Visit
            </Link>
            <Link
              href="/patient"
              className="h-8 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-sm shadow-violet-600/20 cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-white/90" />
            </Link>
          </div>
        </div>

        {/* Portal 4: Hospital Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-lux flex flex-col justify-between hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all group overflow-hidden relative">
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-slate-500" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert className="size-5 text-indigo-600" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Strict RBAC
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                <span>Compliance & Access</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Hospital Administration
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Staff credential governance, published deterministic clinical ruleset explorer, and tamper-evident audit trails.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <Link href="/admin/audit" className="text-xs font-medium text-indigo-700 hover:text-indigo-900">
              Audit Trail
            </Link>
            <Link
              href="/admin"
              className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <span>Open</span>
              <ArrowRight className="size-3 text-white/90" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Safety Guarantees Bar (Themed Hairline Strip) */}
      <section
        aria-label="Clinical Safety Guarantees"
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-lux"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2.5 px-3 py-2 first:pl-0">
            <div className="size-7 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Zero Hallucination</div>
              <div className="text-[11px] text-slate-500">Deterministic CDS</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="size-7 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center shrink-0">
              <Lock className="size-4 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Fails-Closed Gate</div>
              <div className="text-[11px] text-slate-500">Dispensing Safeguard</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="size-7 rounded-lg bg-violet-50 border border-violet-200/70 text-violet-700 flex items-center justify-center shrink-0">
              <Pill className="size-4 text-violet-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Line-by-Line OCR</div>
              <div className="text-[11px] text-slate-500">Dual Verification</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2 last:pr-0">
            <div className="size-7 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center shrink-0">
              <Shield className="size-4 text-indigo-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Tenant Isolation</div>
              <div className="text-[11px] text-slate-500">Hospital Row Security</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
