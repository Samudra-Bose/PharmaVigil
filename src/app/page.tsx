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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GridPattern } from "@/components/aceternity/GridPattern";

export default function HomePage() {
  const { role, isLoading, switchRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      if (role === "PHARMACIST") router.push("/pharmacist");
      else if (role === "DOCTOR") router.push("/doctor");
      else if (role === "PATIENT") router.push("/patient");
      else if (role === "HOSPITAL_ADMIN") router.push("/admin");
    }
  }, [role, isLoading, router]);

  return (
    <div className="py-6 sm:py-10 relative">
      <GridPattern className="opacity-40" />
      <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-teal-700" />
          PharmaVigil Clinical Decision Support
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Hospital-focused medication safety and clinical review routing
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          PharmaVigil verifies prescription data against deterministic safety
          rule sets, routes flagged drug-drug interactions to attending
          physicians, and gates dispensing authorization until clinical review
          is complete.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-2.5">
          <Button
            onClick={() => switchRole("PHARMACIST")}
            variant="primary"
            className="gap-2 text-xs h-9 bg-slate-900 hover:bg-slate-800 shadow-2xs"
          >
            Open Pharmacist Queue <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => switchRole("DOCTOR")}
            variant="outline"
            className="gap-2 text-xs h-9"
          >
            Open Doctor Triage
          </Button>
        </div>
      </div>

      {/* Role Portal Entry Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-6xl mx-auto relative z-10">
        {/* Pharmacist */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 flex items-center justify-center mb-3">
              <Pill className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Pharmacist Workspace
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Patient lookup, camera capture, line-by-line OCR review, catalogue
              matching, and gated dispensing.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              onClick={() => switchRole("PHARMACIST")}
            >
              Enter as Pharmacist
            </Button>
          </div>
        </div>

        {/* Doctor */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60 flex items-center justify-center mb-3">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Doctor Triage Deck
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Prioritized alert deck, pharmacological citations, mandatory
              15-character rationale, and immutable revisions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              onClick={() => switchRole("DOCTOR")}
            >
              Enter as Doctor
            </Button>
          </div>
        </div>

        {/* Patient */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60 flex items-center justify-center mb-3">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Patient Companion
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Plain-language dosing instructions and pickup verification without
              exposure to internal clinician audit trails.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              onClick={() => switchRole("PATIENT")}
            >
              Enter as Patient
            </Button>
          </div>
        </div>

        {/* Admin */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center mb-3">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Hospital Administration
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Staff credential governance (Approve/Suspend), clinician
              directory, and scoped demo reset.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              onClick={() => switchRole("HOSPITAL_ADMIN")}
            >
              Enter as Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
