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
    <div className="flex flex-col gap-10 max-w-6xl mx-auto pb-16 pt-2">
      {/* 1. Calm Editorial Hero Section */}
      <section aria-label="Overview" className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Metro General Hospital</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Clinical Safety Engine Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Preventing medication hazards before prescriptions reach the patient.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          PharmaVigil unites pharmacists, attending physicians, and patients around a deterministic Clinical Decision Support engine to catch adverse drug interactions and enforce fail-closed dispensing.
        </p>

        {/* 3-Step Safety Loop Visualizer */}
        <div className="pt-2 flex items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="size-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center">1</span>
            <span>Doctor Prescribes</span>
          </div>
          <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="size-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">2</span>
            <span>Deterministic CDS Verification</span>
          </div>
          <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <span className="size-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">3</span>
            <span>Safe Pharmacist Dispense</span>
          </div>
        </div>
      </section>

      {/* 2. Unified Workspace Launcher Cards (Hick's Law - Clear, Distinct Choices) */}
      <section aria-label="Clinical Workspaces" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Select Clinical Portal to Enter
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any workspace to switch persona and open the corresponding portal.
            </p>
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-400">Current Session:</span>
              <span className="font-bold text-slate-800">{user.displayName}</span>
              <span className="size-1.5 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const isCurrentActive = role === card.role;

            const themeStyles = {
              emerald: {
                activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10",
                button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
                iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                hairline: "from-emerald-500 to-teal-400",
                badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
              },
              blue: {
                activeBorder: "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10",
                button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
                iconBg: "bg-blue-50 text-blue-700 border-blue-200",
                hairline: "from-blue-600 to-sky-400",
                badge: "bg-blue-50 text-blue-800 border-blue-200",
              },
              violet: {
                activeBorder: "border-violet-500 ring-2 ring-violet-500/20 shadow-violet-500/10",
                button: "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20",
                iconBg: "bg-violet-50 text-violet-700 border-violet-200",
                hairline: "from-violet-600 to-purple-400",
                badge: "bg-violet-50 text-violet-800 border-violet-200",
              },
              indigo: {
                activeBorder: "border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10",
                button: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20",
                iconBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
                hairline: "from-indigo-600 to-slate-500",
                badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
              },
            }[card.themeColor];

            const statusColors = {
              rose: "bg-rose-50 text-rose-800 border-rose-200",
              amber: "bg-amber-50 text-amber-800 border-amber-200",
              emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
              slate: "bg-slate-100 text-slate-700 border-slate-200",
            }[card.statusVariant];

            return (
              <div
                key={card.role}
                onClick={() => handleLaunchWorkspace(card.role, card.workspaceHref)}
                className={`group relative bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-subtle hover:shadow-md ${
                  isCurrentActive ? `${themeStyles.activeBorder} bg-gradient-to-b from-white to-slate-50/50` : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Hairline Accent Top Bar */}
                <div className={`h-1 absolute top-0 left-0 right-0 rounded-t-2xl bg-gradient-to-r ${themeStyles.hairline}`} />

                <div className="space-y-4">
                  {/* Card Top: Icon, Persona Label & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${themeStyles.iconBg}`}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
                          {card.roleSubtitle}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950">
                          {card.title}
                        </h3>
                      </div>
                    </div>

                    {isCurrentActive && (
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${themeStyles.badge}`}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Body: Clear Value Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Footer: Live Queue Indicator & Primary Launch Button */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusColors}`}>
                      {card.statusText}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchWorkspace(card.role, card.workspaceHref);
                    }}
                    className={`h-9 px-4 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${themeStyles.button}`}
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

      {/* 3. Safety Guarantees & Architecture Bar (Minimal & High Trust) */}
      <section aria-label="Clinical Guarantees" className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Zero Hallucination</div>
              <div className="text-[11px] text-slate-500">Deterministic Engine</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-blue-100/70 text-blue-800 flex items-center justify-center shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Fails-Closed Gate</div>
              <div className="text-[11px] text-slate-500">Gated Dispensation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-violet-100/70 text-violet-800 flex items-center justify-center shrink-0">
              <Camera className="size-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Line-by-Line OCR</div>
              <div className="text-[11px] text-slate-500">Dual Verification</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-indigo-100/70 text-indigo-800 flex items-center justify-center shrink-0">
              <Shield className="size-4" />
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
