"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CossMetricStrip } from "@/components/coss/CossMetricStrip";
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  RotateCcw, 
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock
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
    <div className="space-y-5">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            Hospital Administration & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital Tenancy: <span className="font-medium text-slate-800">Metro General Hospital</span> (metro-general)
          </p>
        </div>

        <Link href="/admin/demo-reset">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 border-rose-200 text-rose-800 hover:bg-rose-50 shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Scoped Demo Reset
          </Button>
        </Link>
      </div>

      {/* Monolithic Linear-style Metric Rail */}
      <CossMetricStrip
        metrics={[
          { label: "Pending Credentials", value: pendingCount, icon: UserCheck, tone: pendingCount > 0 ? "urgent" : "neutral" },
          { label: "Active Clinicians", value: activeCount, icon: Users, tone: "info" },
          { label: "Hospital Tenancy", value: "Metro General", icon: Building2, tone: "success" },
          { label: "Operational Mode", value: "SYNTHETIC", subtext: "Pinned OpenAPI 3.1.1", icon: ShieldCheck, tone: "neutral" },
        ]}
      />

      {/* Pending Membership Queue Section */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Pending Hospital Membership Requests
          </h2>
          <Link href="/admin/memberships" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            View All ({memberships.length}) →
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-20 w-full" />
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
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                      <span>{mem.displayName}</span>
                      <Badge variant="high" className="text-[10px] font-mono">
                        {mem.role}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {mem.email} • ID: {mem.userId}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/memberships/${mem.id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                        Review Credentials <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Directory & Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/admin/users" className="block group">
          <div className="p-4 bg-white rounded-lg border border-slate-200/80 shadow-2xs group-hover:border-slate-300 transition-colors">
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
          <div className="p-4 bg-white rounded-lg border border-slate-200/80 shadow-2xs group-hover:border-slate-300 transition-colors">
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
