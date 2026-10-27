"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  RotateCcw, 
  ArrowRight,
  Building2,
  CheckCircle2
} from "lucide-react";

export default function AdminDashboardPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getMemberships();
        setMemberships(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = memberships.filter((m) => m.status === "PENDING").length;
  const activeCount = memberships.filter((m) => m.status === "ACTIVE").length;

  return (
    <div className="space-y-4">
      {/* 1. Precision Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="truncate">Hospital Governance & Administration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Tenancy: <span className="font-medium text-slate-800">Metro General Hospital</span> (metro-general)
          </p>
        </div>

        <Link href="/admin/demo-reset" className="shrink-0">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 px-2.5 border-rose-200 text-rose-800 hover:bg-rose-50 shadow-2xs whitespace-nowrap">
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Scoped Demo Reset
          </Button>
        </Link>
      </div>

      {/* 2. Quiet Operational Status Rail */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 px-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs select-none">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {pendingCount > 0 ? (
            <Link
              href="/admin/memberships"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-medium hover:bg-amber-100 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{pendingCount} Pending Credential Request{pendingCount > 1 ? "s" : ""}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>0 Pending Applications</span>
            </span>
          )}

          <span className="text-slate-300">|</span>

          <span className="text-slate-600 font-medium">
            <span className="font-mono font-bold text-slate-900">{activeCount}</span> Active Clinicians
          </span>

          <span className="text-slate-300">|</span>

          <span className="text-slate-600">
            <span className="font-mono font-bold text-slate-900">{memberships.length}</span> Total Registered
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span>Environment:</span>
          <span className="text-slate-600 font-medium">DEMO_SYNTHETIC (OpenAPI 3.1.1)</span>
        </div>
      </div>

      {/* 3. Pending Membership Queue Section */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Pending Hospital Membership Requests
          </h2>
          <Link href="/admin/memberships" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            View All ({memberships.length}) →
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : pendingCount === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-teal-600 mb-1" />
            <p className="font-medium text-slate-700">No pending clinician applications</p>
            <p className="text-slate-400">All registered clinical staff have been verified and assigned active roles.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {memberships
              .filter((m) => m.status === "PENDING")
              .map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <span className="truncate">{mem.displayName}</span>
                      <Badge variant="high" className="text-[10px] font-mono shrink-0">
                        {mem.role}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      {mem.email} • ID: {mem.userId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/memberships/${mem.id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1 h-7 px-2.5 whitespace-nowrap font-medium">
                        Review Credentials <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 4. Quick Governance Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Link href="/admin/users" className="block group">
          <div className="p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs group-hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" /> Clinician Directory
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audit active staff licenses, hospital roles, and credential status.
            </p>
          </div>
        </Link>

        <Link href="/admin/memberships" className="block group">
          <div className="p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs group-hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-500" /> Membership Applications
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Approve, suspend, or reactivate staff hospital affiliations.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
