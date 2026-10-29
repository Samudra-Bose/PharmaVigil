"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
          Access Denied (403 Forbidden)
        </h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Your account does not possess the required clinical authorization or
          hospital membership privilege to access this resource. Authorization
          is strictly enforced on the server.
        </p>
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Sign in with an authorized portal credential:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href="/auth/login/doctor"
              className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 font-semibold transition-colors"
            >
              🩺 Doctor Portal
            </Link>
            <Link
              href="/auth/login/pharmacist"
              className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 font-semibold transition-colors"
            >
              🌿 Pharmacist Terminal
            </Link>
            <Link
              href="/auth/login/patient"
              className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 font-semibold transition-colors"
            >
              👤 Patient Portal
            </Link>
            <Link
              href="/auth/login/admin"
              className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 font-semibold transition-colors"
            >
              🛡️ Admin Console
            </Link>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2 mt-1">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" /> Return to Hospital Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
