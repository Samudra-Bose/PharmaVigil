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
          Your account does not possess the required clinical authorization or hospital membership
          privilege to access this resource. Authorization is strictly enforced on the server.
        </p>
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center gap-2">
          <Link href="/">
            <Button size="sm" variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Safe Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
