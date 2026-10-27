"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ShieldCheck,
  UserCheck,
  Users,
  RotateCcw,
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  ChevronRight,
  Activity,
} from "lucide-react";

const INITIAL_MEMBERSHIPS = [
  {
    id: "mem_01",
    userId: "usr_pharma_01",
    displayName: "Priya Sharma, RPh",
    email: "pharma@metro-general.invalid",
    role: "PHARMACIST",
    status: "ACTIVE",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "mem_02",
    userId: "usr_doctor_01",
    displayName: "Dr. Arvind Patel, MD",
    email: "doctor@metro-general.invalid",
    role: "DOCTOR",
    status: "ACTIVE",
    createdAt: "2026-01-11T10:00:00Z",
  },
  {
    id: "mem_03",
    userId: "usr_pending_01",
    displayName: "Dr. Neha Rao (Applicant)",
    email: "pending@metro-general.invalid",
    role: "DOCTOR",
    status: "PENDING",
    createdAt: "2026-10-27T08:00:00Z",
  },
];

export default function AdminDashboardPage() {
  const [memberships, setMemberships] = useState<any[]>(INITIAL_MEMBERSHIPS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getMemberships();
        if (data && data.length > 0) {
          setMemberships(data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = memberships.filter((m) => m.status === "PENDING").length;
  const activeCount = memberships.filter((m) => m.status === "ACTIVE").length;
  const pendingMember = memberships.find((m) => m.status === "PENDING");

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Hospital Governance & Administration</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
              Tenancy: metro-general
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control, clinician credentialing, and multi-tenant
            security isolation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/demo-reset">
            <button className="h-8 sm:h-9 px-3.5 rounded-xl bg-white hover:bg-rose-50 text-rose-800 font-semibold text-xs border border-rose-200/90 shadow-2xs flex items-center gap-1.5 transition-all whitespace-nowrap">
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Scoped Demo
              Reset
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Priority Overview: Foreground Pending Membership Decision (Section D) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (8 cols): Pending Credential Decision */}
        <div className="lg:col-span-8">
          {pendingMember ? (
            <div className="bg-white rounded-2xl p-5 shadow-lux border-l-4 border-l-amber-500 border-t border-r border-b border-slate-100 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950 font-mono">
                      Staff Credentialing Decision Required
                    </span>
                  </div>
                  <Badge variant="high" className="text-xs font-mono">
                    {pendingMember.role} APPLICANT
                  </Badge>
                </div>

                <div className="pt-1 border-t border-slate-100/80">
                  <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{pendingMember.displayName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-mono text-slate-500">
                      {pendingMember.email}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">
                    Applicant ID: {pendingMember.userId} • Applied:{" "}
                    {new Date(pendingMember.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">
                    Credential Verification Protocol:
                  </span>{" "}
                  Applicant has requested{" "}
                  <span className="font-semibold text-slate-900">DOCTOR</span>{" "}
                  privileges with clinical prescription revision and triage
                  authority. Administrator confirmation required to assign
                  active tenancy membership.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Unapproved accounts are locked out from patient records.
                  </span>
                </div>

                <Link
                  href={`/admin/memberships/${pendingMember.id}`}
                  className="shrink-0"
                >
                  <button className="h-8 px-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                    <span>Review Credentials</span>
                    <ArrowRight className="w-3 h-3 text-emerald-300" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-lux border border-slate-100 flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    No Pending Applications
                  </h3>
                  <p className="text-xs text-slate-500">
                    All registered clinicians have been verified and assigned
                    active roles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right (4 cols): Restrained Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-forest-900" /> Tenancy
                Telemetry
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                OpenAPI 3.1.1
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  Pending Decisions
                </span>
                <span className="font-mono font-bold text-amber-700 font-tabular text-sm">
                  {pendingCount}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Active Clinicians
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {activeCount}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  Total Staff Memberships
                </span>
                <span className="font-mono font-bold text-slate-900 font-tabular text-sm">
                  {memberships.length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Tenant Isolation:</span>
            <span className="font-semibold text-emerald-700">Enforced</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Governance Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/admin/users" className="block group">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-lux group-hover:border-slate-200 transition-colors flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" /> Clinician
                Directory
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Audit active staff licenses, hospital roles, and credential
                status.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link href="/admin/memberships" className="block group">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-lux group-hover:border-slate-200 transition-colors flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" /> Membership
                Applications
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Approve, suspend, or reactivate staff hospital affiliations.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
