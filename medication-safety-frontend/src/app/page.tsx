"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, ArrowRight, UserCheck, Stethoscope, Pill, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    <div className="py-8">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Shield className="w-3.5 h-3.5 text-slate-900" />
          PharmaVigil Outpatient Medication Safety
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Hospital-focused prescription verification and clinical review routing
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          PharmaVigil enables pharmacists to confirm prescription data, evaluates known medicines
          against deterministic illustrative rule sets, and routes flagged concerns to doctors
          before dispensing authorization can proceed.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Button onClick={() => switchRole("PHARMACIST")} variant="primary" className="gap-2">
            Launch Pharmacist Pipeline <ArrowRight className="w-4 h-4" />
          </Button>
          <Button onClick={() => switchRole("DOCTOR")} variant="outline" className="gap-2">
            Launch Doctor Triage
          </Button>
        </div>
      </div>

      {/* Role Portal Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {/* Pharmacist */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Pharmacist Workspace</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Patient lookup, camera/file capture, untrusted OCR review, medicine catalogue confirmation, and gated authorization.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => switchRole("PHARMACIST")}>
              Enter as Pharmacist
            </Button>
          </div>
        </div>

        {/* Doctor */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Doctor Triage Deck</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Prioritized alert queue, evidence references with limitations, mandatory clinical rationale disposition, and immutable revisions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => switchRole("DOCTOR")}>
              Enter as Doctor
            </Button>
          </div>
        </div>

        {/* Patient */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-md bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Patient Companion</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Plain-language prescription schedule cards and verified status without exposure to internal clinical notes or audit streams.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => switchRole("PATIENT")}>
              Enter as Patient
            </Button>
          </div>
        </div>

        {/* Admin */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Hospital Administration</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Staff membership request approvals, role assignment, hospital user directory, and scoped demo reset.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => switchRole("HOSPITAL_ADMIN")}>
              Enter as Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
