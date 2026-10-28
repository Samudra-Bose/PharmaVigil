"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { DotMatrixWaveform } from "@/components/clinical/DotMatrixWaveform";
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
  FileCheck,
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Rythea-Style Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Hospital Governance & Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Metro General Hospital</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="font-mono text-slate-600">metro-general tenancy • OpenAPI 3.1.1</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/admin/demo-reset">
            <button className="h-9 px-4 rounded-full bg-white hover:bg-rose-50 text-rose-800 font-semibold text-xs border border-rose-200/90 shadow-lux flex items-center gap-1.5 transition-all">
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Scoped Demo Reset
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Asymmetric Clinical Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Credential Verification Queue Deck */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Staff Credentialing Gate
                </span>
                <div className="text-xs text-slate-500 mt-0.5">
                  Role-based access control and clinical identity verification
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                {pendingCount} Pending Review{pendingCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Active Staff</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{activeCount} Clinicians</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">Pending Apps</div>
                  <div className="text-sm font-semibold text-amber-700 mt-0.5">{pendingCount} Applicants</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-medium">RBAC Security</div>
                  <div className="text-sm font-semibold text-forest-900 mt-0.5">Fails-Closed Isolation</div>
                </div>
              </div>

              <div className="flex items-baseline gap-1 text-right">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-tabular font-mono">
                  {memberships.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">Users</span>
              </div>
            </div>

            {/* Dot Matrix Waveform in Emerald/Neutral */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Tenant Activity Telemetry</span>
                <span className="text-emerald-600 font-medium">System Operating Normally</span>
              </div>
              <DotMatrixWaveform variant="emerald" />
              <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono pt-2">
                <span>Tenancy: metro-general</span>
                <span>Tenant Isolation: Active</span>
              </div>
            </div>
          </div>

          {/* Sub-Deck: Pending Credential Card & Quick Link */}
          {pendingMember && (
            <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-lux-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-amber-400 uppercase font-semibold">Pending Credential Request</span>
                  <Badge variant="high" className="text-[10px] font-mono">
                    {pendingMember.role}
                  </Badge>
                </div>
                <div className="text-base font-bold text-white">
                  {pendingMember.displayName}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {pendingMember.email} • ID: {pendingMember.userId}
                </div>
              </div>

              <Link href={`/admin/memberships/${pendingMember.id}`} className="shrink-0">
                <button className="h-9 px-4 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition-all">
                  <span>Review Credentials</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Quick Governance Ledger & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> Governance Directory
                </span>
                <span className="text-xs text-slate-400 font-mono">Live</span>
              </div>

              <div className="space-y-3">
                <Link href="/admin/users" className="block group">
                  <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-700" /> Clinician Directory
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Audit active medical staff, hospital roles, and credential status.
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link href="/admin/memberships" className="block group">
                  <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-600" /> Membership Applications
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Approve, suspend, or reactivate staff hospital affiliations.
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Obsidian Security Policy Card */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white shadow-lux-black space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Strict Tenancy Isolation</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Every patient record, prescription revision, and clinical audit log is cryptographically scoped to <span className="font-mono text-white">metro-general</span>. Cross-tenant leakage is strictly prevented.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Audit Trail: Enforced</span>
              <span className="text-emerald-700 font-bold">100% Deterministic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
