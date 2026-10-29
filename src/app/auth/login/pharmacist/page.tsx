"use client";

import React, { Suspense } from "react";
import { RoleLoginForm } from "@/components/auth/RoleLoginForm";
import { GridPattern } from "@/components/aceternity/GridPattern";
import Link from "next/link";
import { Pill, ArrowLeft } from "lucide-react";

export default function PharmacistLoginPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
      <GridPattern className="opacity-40" />

      {/* Breadcrumb / Top Bar */}
      <div className="w-full max-w-xl mx-auto mb-4 flex items-center justify-between text-xs text-slate-500 relative z-10">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors font-medium bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>All Clinical Portals</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-900 font-bold shadow-2xs">
          <Pill className="size-3.5 text-teal-700" />
          <span>Pharmacist Dispensing Terminal</span>
        </div>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
              Loading Pharmacist Terminal Portal...
            </div>
          }
        >
          <RoleLoginForm initialRole="PHARMACIST" isStandalonePage={true} />
        </Suspense>
      </div>
    </div>
  );
}
