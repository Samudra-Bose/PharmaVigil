"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RoleLoginForm, ROLE_CONFIGS } from "@/components/auth/RoleLoginForm";
import { GridPattern } from "@/components/aceternity/GridPattern";
import { Shield, Sparkles, Building2 } from "lucide-react";
import type { UserRole } from "@/types";

function UnifiedLoginContainer() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams?.get("role");

  const resolveInitialRole = (param: string | null | undefined): UserRole => {
    if (!param) return "PHARMACIST";
    const clean = param.trim().toUpperCase();
    if (clean === "DOCTOR" || clean === "MD") return "DOCTOR";
    if (clean === "PHARMACIST" || clean === "RPH" || clean === "PHARMA") return "PHARMACIST";
    if (clean === "PATIENT") return "PATIENT";
    if (clean === "ADMIN" || clean === "HOSPITAL_ADMIN") return "HOSPITAL_ADMIN";
    return "PHARMACIST";
  };

  const [activeRole, setActiveRole] = useState<UserRole>(() =>
    resolveInitialRole(requestedRole)
  );

  useEffect(() => {
    if (requestedRole) {
      setActiveRole(resolveInitialRole(requestedRole));
    }
  }, [requestedRole]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Institution Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-bold text-teal-900 shadow-2xs">
          <Building2 className="size-3.5 text-teal-700" />
          <span>Metro General Hospital</span>
          <span className="text-slate-300">•</span>
          <span className="text-teal-800 font-semibold">Clinical CDS Network</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Hospital Clinical Portals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Deterministic medication safety, outpatient prescription tracking, and fail-closed dispensing interlocks.
        </p>
      </div>

      <RoleLoginForm
        initialRole={activeRole}
        isStandalonePage={false}
        onRoleChange={(newRole) => setActiveRole(newRole)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <div className="relative z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
              Loading hospital authentication portal...
            </div>
          }
        >
          <UnifiedLoginContainer />
        </Suspense>
      </div>
    </div>
  );
}
