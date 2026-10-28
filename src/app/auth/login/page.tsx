"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import {
  Shield,
  KeyRound,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Pill,
  Stethoscope,
  User,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Building2,
  LogIn,
} from "lucide-react";
import type { UserRole } from "@/types";
import { GridPattern } from "@/components/aceternity/GridPattern";
import { toast } from "sonner";

interface TestPersona {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  password: string;
  hospital: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  desc: string;
  isSpecial?: boolean;
}

const PRIMARY_PERSONAS: TestPersona[] = [
  {
    role: "PHARMACIST",
    label: "Pharmacist",
    name: "Sarah Jane Smith (RPh)",
    email: "pharmacist@demo-hospital.local",
    password: "DemoPassword123!",
    hospital: "demo-hospital",
    icon: Pill,
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    desc: "Primary clinical queue, WebRTC camera OCR, CDS interaction review, gated dispensing.",
  },
  {
    role: "DOCTOR",
    label: "Doctor / Prescriber",
    name: "Dr. Clara Oswald",
    email: "doctor@demo-hospital.local",
    password: "DemoPassword123!",
    hospital: "demo-hospital",
    icon: Stethoscope,
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    desc: "Clinical triage queue, prescriptions, alert dispositions with overrides, appointments.",
  },
  {
    role: "PATIENT",
    label: "Patient",
    name: "Donna Noble",
    email: "patient@demo-hospital.local",
    password: "DemoPassword123!",
    hospital: "demo-hospital",
    icon: User,
    badgeColor: "bg-violet-50 text-violet-800 border-violet-200",
    desc: "Outpatient portal, prescription tracking, self-reported allergies & medication history.",
  },
  {
    role: "HOSPITAL_ADMIN",
    label: "Hospital Admin",
    name: "Dr. Arthur Pendelton",
    email: "admin@demo-hospital.local",
    password: "DemoPassword123!",
    hospital: "demo-hospital",
    icon: ShieldCheck,
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    desc: "Governance, staff approvals, clinical rulesets, audit trail, demo reset.",
  },
];

const SPECIAL_PERSONAS: TestPersona[] = [
  {
    role: "DOCTOR",
    label: "Pending Doctor",
    name: "Dr. Martha Jones (Pending)",
    email: "pending.doctor@demo-hospital.local",
    password: "DemoPassword123!",
    hospital: "demo-hospital",
    icon: Clock,
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "Tests pending verification workflow (/auth/pending) awaiting admin approval.",
    isSpecial: true,
  },
  {
    role: "PHARMACIST",
    label: "Suspended Pharmacist",
    name: "Jack Harkness (Suspended)",
    email: "suspended.pharma@demo-hospital.local",
    password: "DemoPassword123!",
    hospital: "demo-hospital",
    icon: AlertTriangle,
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    desc: "Tests access control guardrails and suspended account denial.",
    isSpecial: true,
  },
  {
    role: "DOCTOR",
    label: "Tenant B Doctor",
    name: "Dr. John Watson (Tenant B)",
    email: "doctor@hospital-b.local",
    password: "DemoPassword123!",
    hospital: "hospital-b",
    icon: Building2,
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    desc: "Tests multi-tenant isolation (cannot see or mutate Demo Hospital cases).",
    isSpecial: true,
  },
  {
    role: "PHARMACIST",
    label: "Legacy Alias (Pharma)",
    name: "Sarah Jane Smith (Alias)",
    email: "pharma@metro-general.invalid",
    password: "Password123!",
    hospital: "demo-hospital",
    icon: Pill,
    badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
    desc: "Tests backwards-compatible mock credentials with Password123!",
    isSpecial: true,
  },
];

function LoginForm() {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const requestedRole = searchParams?.get("role");

  const [email, setEmail] = useState<string>("pharmacist@demo-hospital.local");
  const [password, setPassword] = useState<string>("DemoPassword123!");
  const [selectedPersona, setSelectedPersona] = useState<string>("pharmacist@demo-hospital.local");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInstantLoggingIn, setIsInstantLoggingIn] = useState<string | null>(null);

  // Auto-select persona if ?role=... query parameter provided
  useEffect(() => {
    if (requestedRole) {
      const match = PRIMARY_PERSONAS.find(
        (p) => p.role.toUpperCase() === requestedRole.toUpperCase()
      );
      if (match) {
        setEmail(match.email);
        setPassword(match.password);
        setSelectedPersona(match.email);
      }
    }
  }, [requestedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleSelectPersona = (persona: TestPersona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setSelectedPersona(persona.email);
    setError(null);
  };

  const handleInstantSignIn = async (persona: TestPersona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setSelectedPersona(persona.email);
    setError(null);
    setIsInstantLoggingIn(persona.email);
    try {
      await login(persona.email, persona.password);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsInstantLoggingIn(null);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-xl w-full bg-white rounded-xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 relative z-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
          <Shield className="w-6 h-6 text-teal-400" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Sign In to PharmaVigil
        </h1>
        <p className="text-xs text-slate-500">
          Hospital Outpatient Medication Safety System & CDS Engine
        </p>
      </div>

      {/* Demo Credentials & Fast Persona Selector */}
      <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Test Role Personas (Seeded Accounts):</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-medium">
            Live Verified
          </span>
        </div>

        {/* Primary Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRIMARY_PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.email;
            const isLoggingIn = isInstantLoggingIn === p.email;

            return (
              <div
                key={p.email}
                className={`p-2.5 rounded-md border text-left transition-all ${
                  isSelected
                    ? "bg-white border-slate-900 shadow-2xs ring-1 ring-slate-900"
                    : "bg-white/70 hover:bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="font-semibold text-slate-900 text-xs">
                      {p.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${p.badgeColor}`}
                  >
                    {p.role}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-slate-800 truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate mb-2">
                  {p.email}
                </div>

                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isLoading || isLoggingIn}
                    onClick={() => handleInstantSignIn(p)}
                    className="flex-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    {isLoggingIn ? (
                      "Signing In..."
                    ) : (
                      <>
                        <LogIn className="w-3 h-3 text-teal-400" /> 1-Click Login
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    title="Fill into form"
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors"
                  >
                    Fill
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced & Special Test Accounts Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-[11px] text-slate-600 hover:text-slate-900 py-1 font-medium transition-colors"
          >
            <span className="flex items-center gap-1">
              <span>More test accounts (Pending, Suspended, Multi-Tenant, Aliases)</span>
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200">
              {SPECIAL_PERSONAS.map((p) => {
                const Icon = p.icon;
                const isLoggingIn = isInstantLoggingIn === p.email;

                return (
                  <div
                    key={p.email}
                    className="p-2 rounded bg-white border border-slate-200 text-[11px] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-slate-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {p.label}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">
                          ({p.email})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {p.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isLoading || isLoggingIn}
                        onClick={() => handleInstantSignIn(p)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
                      >
                        {isLoggingIn ? "..." : "Sign In"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPersona(p)}
                        className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] transition-colors"
                      >
                        Fill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {error && <ErrorDisplay error={error} title="Sign-in failed" />}

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Email Address
            </label>
            <button
              type="button"
              onClick={() => handleCopy(email, "email")}
              className="text-[10px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              {copiedField === "email" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors font-mono"
            placeholder="pharmacist@demo-hospital.local"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => handleCopy(password, "password")}
              className="text-[10px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              {copiedField === "password" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors font-mono"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Standard test password: <code className="text-slate-600 font-semibold font-mono">DemoPassword123!</code>
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          className="w-full gap-2 h-10 font-semibold"
        >
          <KeyRound className="w-4 h-4" /> Sign In to Workspace
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Need a hospital account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-slate-900 hover:underline"
        >
          Request membership / Register
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-500">
            Loading authentication portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
