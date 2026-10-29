"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import {
  Stethoscope,
  Pill,
  UserCheck,
  ShieldAlert,
  KeyRound,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import type { UserRole } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface RolePortalConfig {
  role: UserRole;
  slug: "doctor" | "pharmacist" | "patient" | "admin";
  portalTitle: string;
  portalSubtitle: string;
  roleBadgeText: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultEmail: string;
  defaultPassword: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  contextualLabel: string;
  contextualOptions?: string[];
  contextualPlaceholder?: string;
  defaultContextualValue?: string;
  safetyNotice: string;
  primaryCtaText: string;
  directRoute: string;
  demoPersonas: Array<{
    name: string;
    email: string;
    title: string;
    department: string;
    isDefault?: boolean;
  }>;
}

export const ROLE_CONFIGS: Record<UserRole, RolePortalConfig> = {
  DOCTOR: {
    role: "DOCTOR",
    slug: "doctor",
    portalTitle: "Doctor & Prescriber Clinical Portal",
    portalSubtitle: "Attending Physician CDS Triage & Inpatient Orders",
    roleBadgeText: "Physician Clearance (MD)",
    icon: Stethoscope,
    defaultEmail: "doctor@metro-general.invalid",
    defaultPassword: "DemoPassword123!",
    identifierLabel: "Medical Staff ID or Hospital Email",
    identifierPlaceholder: "doctor@metro-general.invalid or Dr. Arvind Patel",
    contextualLabel: "Clinical Ward / Specialty",
    contextualOptions: [
      "Cardiology & Acute Internal Medicine",
      "Outpatient Specialty Clinic",
      "Emergency & Intensive Care",
      "General Surgical Services",
    ],
    defaultContextualValue: "Cardiology & Acute Internal Medicine",
    safetyNotice:
      "Prescriptions undergo deterministic CDS conflict checks. Overrides require mandatory ≥15-character clinical rationales.",
    primaryCtaText: "Sign In as Attending Physician",
    directRoute: "/doctor",
    demoPersonas: [
      {
        name: "Dr. Arvind Patel, MD",
        email: "doctor@metro-general.invalid",
        title: "Attending Cardiologist",
        department: "Cardiology & Internal Medicine",
        isDefault: true,
      },
      {
        name: "Dr. Clara Oswald, MD",
        email: "doctor@demo-hospital.local",
        title: "Clinical Prescriber",
        department: "Outpatient Care Center",
      },
    ],
  },
  PHARMACIST: {
    role: "PHARMACIST",
    slug: "pharmacist",
    portalTitle: "Pharmacist Dispensing & CDS Terminal",
    portalSubtitle: "Prescription OCR Extraction & Fail-Closed Dispensation",
    roleBadgeText: "Registered Pharmacist (RPh)",
    icon: Pill,
    defaultEmail: "pharma@metro-general.invalid",
    defaultPassword: "DemoPassword123!",
    identifierLabel: "Pharmacist License ID or Email",
    identifierPlaceholder: "pharma@metro-general.invalid or Priya Sharma, RPh",
    contextualLabel: "Dispensing Workstation",
    contextualOptions: [
      "Station 01 — Main Outpatient Dispensary",
      "Station 02 — Inpatient Admixture Lab",
      "Station 03 — Emergency Satellite Pharmacy",
    ],
    defaultContextualValue: "Station 01 — Main Outpatient Dispensary",
    safetyNotice:
      "Terminal strictly enforces fail-closed dispensing interlocks. Line-by-line OCR confirmation required before physical release.",
    primaryCtaText: "Sign In to Dispensing Terminal",
    directRoute: "/pharmacist",
    demoPersonas: [
      {
        name: "Priya Sharma, RPh",
        email: "pharma@metro-general.invalid",
        title: "Lead Clinical Pharmacist",
        department: "Outpatient Dispensary",
        isDefault: true,
      },
      {
        name: "Sarah Jane Smith, RPh",
        email: "pharmacist@demo-hospital.local",
        title: "Dispensing Specialist",
        department: "Central Pharmacy Hub",
      },
    ],
  },
  PATIENT: {
    role: "PATIENT",
    slug: "patient",
    portalTitle: "Patient & Family Care Portal",
    portalSubtitle: "Outpatient Medication Schedules & Pharmacy Pickup Tracking",
    roleBadgeText: "Patient Outpatient Access",
    icon: UserCheck,
    defaultEmail: "patient@metro-general.invalid",
    defaultPassword: "DemoPassword123!",
    identifierLabel: "Patient MRN / Hospital ID or Email",
    identifierPlaceholder: "P-9021 or patient@metro-general.invalid",
    contextualLabel: "Birth Date Verification",
    defaultContextualValue: "1968-04-12",
    contextualPlaceholder: "YYYY-MM-DD",
    safetyNotice:
      "Your outpatient prescriptions, self-reported allergies, and medication history are encrypted and private.",
    primaryCtaText: "Access My Health Portal",
    directRoute: "/patient",
    demoPersonas: [
      {
        name: "Rajan Sharma",
        email: "patient@metro-general.invalid",
        title: "Outpatient Patient (MRN: P-9021)",
        department: "Cardiology Follow-up Clinic",
        isDefault: true,
      },
      {
        name: "Donna Noble",
        email: "patient@demo-hospital.local",
        title: "Enrolled Patient (MRN: P-9022)",
        department: "Outpatient Health Member",
      },
    ],
  },
  HOSPITAL_ADMIN: {
    role: "HOSPITAL_ADMIN",
    slug: "admin",
    portalTitle: "Hospital Governance & Compliance Console",
    portalSubtitle: "Clinical Rulesets, Staff Approvals & Immutable Audit Logs",
    roleBadgeText: "Executive Governance",
    icon: ShieldAlert,
    defaultEmail: "admin@metro-general.invalid",
    defaultPassword: "DemoPassword123!",
    identifierLabel: "Administrator Corporate Email",
    identifierPlaceholder: "admin@metro-general.invalid or Sunita Verma",
    contextualLabel: "Hospital Tenancy Scope",
    contextualOptions: [
      "Metro General Hospital (Primary)",
      "Metro Regional Health Network (Multi-Tenant)",
    ],
    defaultContextualValue: "Metro General Hospital (Primary)",
    safetyNotice:
      "Administrative security actions and clinical ruleset threshold updates are recorded in immutable append-only audit ledgers.",
    primaryCtaText: "Authorize Governance Console",
    directRoute: "/admin",
    demoPersonas: [
      {
        name: "Sunita Verma",
        email: "admin@metro-general.invalid",
        title: "Chief Hospital Administrator",
        department: "Compliance & Clinical Governance",
        isDefault: true,
      },
      {
        name: "Dr. Arthur Pendelton",
        email: "admin@demo-hospital.local",
        title: "Medical Staff Director",
        department: "Governance & Operations",
      },
    ],
  },
};

interface RoleLoginFormProps {
  initialRole: UserRole;
  isStandalonePage?: boolean;
  onRoleChange?: (newRole: UserRole) => void;
}

export const RoleLoginForm: React.FC<RoleLoginFormProps> = ({
  initialRole,
  isStandalonePage = false,
  onRoleChange,
}) => {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const config = ROLE_CONFIGS[activeRole];

  const [identifier, setIdentifier] = useState<string>(config.defaultEmail);
  const [password, setPassword] = useState<string>(config.defaultPassword);
  const [contextualValue, setContextualValue] = useState<string>(
    config.defaultContextualValue || ""
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [instantSigningEmail, setInstantSigningEmail] = useState<string | null>(null);

  // Sync state if initialRole changes
  useEffect(() => {
    setActiveRole(initialRole);
    const newConfig = ROLE_CONFIGS[initialRole];
    setIdentifier(newConfig.defaultEmail);
    setPassword(newConfig.defaultPassword);
    setContextualValue(newConfig.defaultContextualValue || "");
    setError(null);
  }, [initialRole]);

  const handleRoleTabClick = (role: UserRole) => {
    setActiveRole(role);
    const newConfig = ROLE_CONFIGS[role];
    setIdentifier(newConfig.defaultEmail);
    setPassword(newConfig.defaultPassword);
    setContextualValue(newConfig.defaultContextualValue || "");
    setError(null);
    if (onRoleChange) {
      onRoleChange(role);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleInstantSignIn = async (email: string) => {
    setError(null);
    setIdentifier(email);
    setPassword("DemoPassword123!");
    setInstantSigningEmail(email);
    try {
      await login(email, "DemoPassword123!");
    } catch (err) {
      setError(err as Error);
    } finally {
      setInstantSigningEmail(null);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const RoleIcon = config.icon;

  const roleTabItems: Array<{ role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { role: "DOCTOR", label: "Doctor Portal", icon: Stethoscope },
    { role: "PHARMACIST", label: "Pharmacist Terminal", icon: Pill },
    { role: "PATIENT", label: "Patient Care", icon: UserCheck },
    { role: "HOSPITAL_ADMIN", label: "Hospital Admin", icon: ShieldAlert },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* 1. Master Portal Tabs (When not on standalone page, or as top selector) */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {roleTabItems.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeRole === tab.role;

            return (
              <button
                key={tab.role}
                type="button"
                onClick={() => {
                  if (isStandalonePage) {
                    const targetSlug = ROLE_CONFIGS[tab.role].slug;
                    router.push(`/auth/login/${targetSlug}`);
                  } else {
                    handleRoleTabClick(tab.role);
                  }
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer select-none",
                  isSelected
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    isSelected ? "text-teal-700" : "text-slate-400"
                  )}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. The Main Dedicated Portal Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle Surgical Hairline Top Accent */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-teal-700 via-teal-600 to-slate-800" />

        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs">
              <RoleIcon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {config.roleBadgeText}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 font-medium">Metro General Hospital</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mt-1">
                {config.portalTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.portalSubtitle}
              </p>
            </div>
          </div>

          {isStandalonePage && (
            <Link
              href="/auth/login"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 self-start sm:self-center bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors"
            >
              <span>All Portals</span>
              <ChevronRight className="size-3" />
            </Link>
          )}
        </div>

        {/* 3. Verified Staff Fast Demo Badges (1-Click Instant Sign-In) */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Fast 1-Click Clinical Demo Access</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-bold">
              Pre-Verified
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Select a verified hospital persona to sign in instantly with seeded active credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {config.demoPersonas.map((persona) => {
              const isLoggingIn = instantSigningEmail === persona.email;

              return (
                <div
                  key={persona.email}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-teal-500/80 transition-all flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {persona.name}
                      </span>
                      {persona.isDefault && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200/60 shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {persona.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {persona.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isLoading || isLoggingIn}
                      onClick={() => handleInstantSignIn(persona.email)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <BadgeCheck className="size-3.5 text-teal-200" />
                          <span>1-Click Sign In</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier(persona.email);
                        setPassword("DemoPassword123!");
                        toast.info(`Filled credentials for ${persona.name}`);
                      }}
                      title="Fill into form"
                      className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <ErrorDisplay error={error} title="Sign-in failed" />}

        {/* 4. Standard Credential Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="portal-identifier"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                {config.identifierLabel}
              </label>
              <button
                type="button"
                onClick={() => handleCopy(identifier, "credential")}
                className="text-[10px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "credential" ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <input
              id="portal-identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={config.identifierPlaceholder}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all font-mono"
            />
          </div>

          {/* Contextual Specialty / Department / Station Selector */}
          <div>
            <label
              htmlFor="portal-context"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {config.contextualLabel}
            </label>
            {config.contextualOptions ? (
              <select
                id="portal-context"
                value={contextualValue}
                onChange={(e) => setContextualValue(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all cursor-pointer font-medium"
              >
                {config.contextualOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="portal-context"
                type="text"
                value={contextualValue}
                onChange={(e) => setContextualValue(e.target.value)}
                placeholder={config.contextualPlaceholder}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all font-mono"
              />
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="portal-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Access Password / Passphrase
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="size-3" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="size-3" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                id="portal-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Default demo credential key:{" "}
              <code className="text-slate-700 font-bold font-mono">DemoPassword123!</code>
            </p>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-99 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-sm shadow-teal-700/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <KeyRound className="size-4" />
                <span>{config.primaryCtaText}</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* 5. Safety Interlock Assurance Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600">
          <Lock className="size-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900">Clinical Security: </strong>
            {config.safetyNotice}
          </p>
        </div>

        {/* 6. Footer Navigation Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Need an account?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-teal-800 hover:underline"
            >
              Request Membership
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="size-3" />
              <span>Hospital Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Quick Portal Jump Directory */}
      <div className="text-center space-y-2">
        <div className="text-xs text-slate-400 font-medium">
          Dedicated Clinical Portal URLs:
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          <Link
            href="/auth/login/doctor"
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-colors",
              activeRole === "DOCTOR"
                ? "bg-teal-50 border-teal-200 text-teal-900 font-bold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            🩺 Doctor Portal
          </Link>
          <Link
            href="/auth/login/pharmacist"
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-colors",
              activeRole === "PHARMACIST"
                ? "bg-teal-50 border-teal-200 text-teal-900 font-bold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            🌿 Pharmacist Terminal
          </Link>
          <Link
            href="/auth/login/patient"
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-colors",
              activeRole === "PATIENT"
                ? "bg-teal-50 border-teal-200 text-teal-900 font-bold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            👤 Patient Care
          </Link>
          <Link
            href="/auth/login/admin"
            className={cn(
              "px-3 py-1.5 rounded-lg border transition-colors",
              activeRole === "HOSPITAL_ADMIN"
                ? "bg-teal-50 border-teal-200 text-teal-900 font-bold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            🛡️ Admin Console
          </Link>
        </div>
      </div>
    </div>
  );
};
