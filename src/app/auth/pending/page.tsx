"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Clock, RefreshCw, ArrowLeft } from "lucide-react";

export default function PendingApprovalPage() {
  const { user, refreshSession, logout } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refreshSession();
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Hospital Membership Pending Approval
        </h1>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your account{" "}
          <span className="font-semibold text-slate-800">
            {user?.displayName || "Dr. Neha Rao"}
          </span>{" "}
          has been created. In accordance with clinical safety protocol, staff
          memberships must be reviewed and activated by a Metro General Hospital
          administrator before clinical data access is unlocked.
        </p>

        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-500 text-left space-y-1 font-mono">
          <div>
            Status:{" "}
            <span className="text-amber-800 font-semibold">
              PENDING_APPROVAL
            </span>
          </div>
          <div>Hospital: Metro General Hospital</div>
          <div>Workspace: DEMO-METRO-GENERAL</div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCheck}
            loading={checking}
            className="gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={logout}
            className="gap-2 text-slate-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
