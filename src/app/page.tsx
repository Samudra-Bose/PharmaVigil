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
  Lock,
  CheckCircle2,
  Sparkles,
  Camera,
  Activity,
  FileCheck,
} from "lucide-react";
import type { UserRole } from "@/types";

interface RoleCardConfig {
  role: UserRole;
  title: string;
  roleSubtitle: string;
  userDisplayName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  statusText: string;
  statusVariant: "rose" | "amber" | "emerald" | "slate";
  workspaceHref: string;
  themeColor: "emerald" | "blue" | "violet" | "indigo";
}

const ROLE_CARDS: RoleCardConfig[] = [
  {
    role: "PHARMACIST",
    title: "Pharmacist Operations",
    roleSubtitle: "Pharmacy CDS & Dispensing",
    userDisplayName: "Sarah Jane Smith, RPh",
    icon: Pill,
    description: "Scan prescriptions via camera OCR, verify automated drug interaction checks, and authorize physical dispensing.",
    statusText: "1 Case Awaiting Verification",
    statusVariant: "rose",
    workspaceHref: "/pharmacist",
    themeColor: "emerald",
  },
  {
    role: "DOCTOR",
    title: "Doctor Triage & Revisions",
    roleSubtitle: "Attending Prescriber Portal",
    userDisplayName: "Dr. Clara Oswald, MD",
    icon: Stethoscope,
    description: "Review flagged pharmacological conflicts, document mandatory clinical rationales, and issue revised prescriptions.",
    statusText: "1 Flagged Case Needs Triage",
    statusVariant: "amber",
    workspaceHref: "/doctor",
    themeColor: "blue",
  },
  {
    role: "PATIENT",
    title: "Patient Care Portal",
    roleSubtitle: "Outpatient Medication Hub",
    userDisplayName: "Donna Noble (P-9021)",
    icon: UserCheck,
    description: "View plain-language daily dosing instructions, check pharmacy pickup readiness, and self-report home allergies.",
    statusText: "1 Medication Ready at Pharmacy",
    statusVariant: "emerald",
    workspaceHref: "/patient",
    themeColor: "violet",
  },
  {
    role: "HOSPITAL_ADMIN",
    title: "Hospital Governance",
    roleSubtitle: "Compliance & Staff Directory",
    userDisplayName: "Dr. Arthur Pendelton",
    icon: ShieldAlert,
    description: "Manage clinical staff credentials, review published CDS ruleset thresholds, and inspect immutable audit event logs.",
    statusText: "Audit Ledger Synchronized",
    statusVariant: "slate",
    workspaceHref: "/admin",
    themeColor: "indigo",
  },
];

export default function HomePage() {
  const { user, role, switchRole, isMockMode } = useAuth();
  const router = useRouter();

  const handleLaunchWorkspace = async (targetRole: UserRole, targetHref: string) => {
    if (isMockMode && role !== targetRole) {
      await switchRole(targetRole);
    }
    router.push(targetHref);
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-16 pt-2 font-sans">
      {/* 1. Pinterest/Dribbble High-Energy Atmospheric Hero Section */}
      <section aria-label="Overview" className="text-center max-w-3xl mx-auto space-y-4 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-bold text-teal-900 shadow-2xs">
          <span className="size-2 rounded-full bg-teal-600" />
          <span>Metro General Hospital</span>
          <span className="text-slate-300">•</span>
          <span className="text-teal-800 font-semibold">Clinical Safety Engine Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight font-display">
          Preventing medication hazards before prescriptions reach the patient.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
          PharmaVigil unites pharmacists, attending physicians, and patients around a deterministic Clinical Decision Support engine to catch adverse drug interactions and enforce fail-closed dispensing.
        </p>

        {/* 3-Step Safety Loop Visualizer */}
        <div className="pt-2 flex items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="size-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black flex items-center justify-center">1</span>
            <span>Doctor Prescribes</span>
          </div>
          <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-900 shadow-2xs">
            <span className="size-5 rounded-full bg-teal-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
            <span>Deterministic CDS Check</span>
          </div>
          <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="size-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black flex items-center justify-center">3</span>
            <span>Safe Pharmacist Dispense</span>
          </div>
        </div>
      </section>

      {/* 2. Unified Workspace Launcher Cards (Hick's Law - Clear, Distinct Choices) */}
      <section aria-label="Clinical Workspaces" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Select Clinical Portal to Enter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any workspace to switch persona and open the corresponding portal.
            </p>
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium">Current Session:</span>
              <span className="font-bold text-slate-800">{user.displayName}</span>
              <span className="size-2 rounded-full bg-teal-600" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const isCurrentActive = role === card.role;

            return (
              <div
                key={card.role}
                onClick={() => handleLaunchWorkspace(card.role, card.workspaceHref)}
                className={`group relative bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                  isCurrentActive ? "border-teal-600 ring-2 ring-teal-600/15" : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Hairline Accent Top Bar */}
                <div className={`h-1.5 absolute top-0 left-0 right-0 rounded-t-2xl ${isCurrentActive ? "bg-teal-600" : "bg-transparent"}`} />

                <div className="space-y-4">
                  {/* Card Top: Icon, Persona Label & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-2xs ${
                        isCurrentActive ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
                          {card.roleSubtitle}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950 mt-0.5">
                          {card.title}
                        </h3>
                      </div>
                    </div>

                    {isCurrentActive && (
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Body: Clear Value Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Footer: Live Queue Indicator & Primary Launch Button */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-700 border-slate-200">
                      {card.statusText}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchWorkspace(card.role, card.workspaceHref);
                    }}
                    className={`h-9 px-4 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                      isCurrentActive
                        ? "bg-teal-700 hover:bg-teal-600 text-white shadow-sm shadow-teal-700/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Safety Guarantees & Architecture Bar (High Trust Bento) */}
      <section aria-label="Clinical Guarantees" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="size-4.5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Zero Hallucination</div>
              <div className="text-[11px] text-slate-500">Deterministic Engine</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="size-4.5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Fails-Closed Gate</div>
              <div className="text-[11px] text-slate-500">Gated Dispensation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Camera className="size-4.5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Line-by-Line OCR</div>
              <div className="text-[11px] text-slate-500">Dual Verification</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Shield className="size-4.5" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Hospital RBAC</div>
              <div className="text-[11px] text-slate-500">Audit-Logged Access</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
