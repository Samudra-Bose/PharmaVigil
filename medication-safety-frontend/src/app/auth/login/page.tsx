"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Shield, KeyRound, Sparkles } from "lucide-react";
import type { UserRole } from "@/types";
import { GridPattern } from "@/components/aceternity/GridPattern";

export default function LoginPage() {
  const { login, isLoading, switchRole } = useAuth();
  const [email, setEmail] = useState("pharma@metro-general.invalid");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleQuickPersona = (role: UserRole, personaEmail: string) => {
    setEmail(personaEmail);
    setPassword("Password123!");
    switchRole(role);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200/90 shadow-subtle p-6 sm:p-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sign In to PharmaVigil
          </h1>
          <p className="text-xs text-slate-500">
            Hospital Outpatient Medication Safety System (Metro General Hospital)
          </p>
        </div>

        {/* Demo Fast-Login Accelerator */}
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo Persona Sign-In:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPersona("PHARMACIST", "pharma@metro-general.invalid")}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors font-medium text-slate-800 text-[11px]"
            >
              💊 Pharmacist
            </button>
            <button
              type="button"
              onClick={() => handleQuickPersona("DOCTOR", "doctor@metro-general.invalid")}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors font-medium text-slate-800 text-[11px]"
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickPersona("PATIENT", "patient@metro-general.invalid")}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors font-medium text-slate-800 text-[11px]"
            >
              👤 Patient (P-9021)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPersona("HOSPITAL_ADMIN", "admin@metro-general.invalid")}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors font-medium text-slate-800 text-[11px]"
            >
              ⚙️ Administrator
            </button>
          </div>
        </div>

        {error && <ErrorDisplay error={error} title="Sign-in failed" />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
              placeholder="user@hospital.invalid"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
            />
          </div>

          <Button type="submit" variant="primary" loading={isLoading} className="w-full gap-2">
            <KeyRound className="w-4 h-4" /> Sign In
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Need a hospital account?{" "}
          <Link href="/auth/register" className="font-semibold text-slate-900 hover:underline">
            Request membership / Register
          </Link>
        </div>
      </div>
    </div>
  );
}
