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
  Lock 
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
            Hospital Administration & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital Tenancy: <span className="font-semibold text-slate-800">Metro General Hospital</span> (Slug: metro-general)
          </p>
        </div>

        <Link href="/admin/demo-reset">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 border-rose-300 text-rose-800 hover:bg-rose-50">
            <RotateCcw className="w-3.5 h-3.5" /> Scoped Demo Reset
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex justify-between items-center text-xs text-amber-800">
            <span>Pending Membership Requests</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950 mt-1 font-mono">{pendingCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Active Hospital Staff</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{activeCount}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Workspace Type</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 font-mono">DEMO_SYNTHETIC</div>
        </div>
      </div>

      {/* Pending Membership Queue Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-600" /> Pending Hospital Membership Requests
          </h2>
          <Link href="/admin/memberships" className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline">
            View All ({memberships.length})
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : pendingCount === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            No pending membership applications. All staff verified.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {memberships
              .filter((m) => m.status === "PENDING")
              .map((mem) => (
                <div key={mem.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{mem.displayName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{mem.email} • Requested: {mem.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/memberships/${mem.id}`}>
                      <Button size="sm" variant="primary" className="text-xs gap-1 h-7">
                        Review & Assign Role <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
