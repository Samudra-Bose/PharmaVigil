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
  ChevronLeft,
  Activity,
  TrendingUp,
  User,
  ShieldAlert,
  Check,
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
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with clean typography & distinct button hierarchy */}
      <section
        aria-label="Admin Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Hospital Governance & Credentialing
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Tenancy: metro-general
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Welcome back, Administrator</span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Role-based access control, clinician credentialing, and multi-tenant security isolation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/admin/demo-reset">
            <button className="h-9 px-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-800 font-semibold text-xs border border-rose-200/90 shadow-2xs flex items-center gap-2 transition-all whitespace-nowrap">
              <RotateCcw data-icon="inline-start" className="size-3.5 text-rose-600" />
              <span>Scoped Demo Reset</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 2. TOP TIER: 4-Card Bento Grid (Refined Clinical Palette + 1 Dark Action Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Approvals */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center shrink-0">
                <UserCheck className="size-5 text-amber-700" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                Decision Required
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Pending Approvals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Clinician Staff Applications</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Requested Role</span>
              <span className="font-bold text-amber-800 font-mono">DOCTOR (MD)</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Queue</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{pendingCount} Applicant</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Clinicians */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 flex items-center justify-center shrink-0">
                <Users className="size-5 text-emerald-800" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                Verified
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Active Clinicians</h3>
              <p className="text-xs text-slate-500 mt-0.5">Credentialed Staff Members</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Isolation</span>
              <span className="font-bold text-emerald-800 font-mono">Strict RBAC</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Active</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{activeCount} Clinicians</span>
            </div>
          </div>
        </div>

        {/* Card 3: Hospital Partition (Soft Slate) */}
        <div className="bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200 hover:shadow-lux-hover">
          <div>
            <div className="flex items-center justify-between">
              <div className="size-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-5 text-slate-700" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80">
                Tenancy
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">Hospital Partition</h3>
              <p className="text-xs text-slate-500 mt-0.5">Multi-Tenant Boundaries</p>
            </div>
          </div>
          <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Standard</span>
              <span className="font-bold text-slate-700 font-mono">OpenAPI 3.1</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 block">Total Staff</span>
              <span className="font-bold text-slate-900 font-mono font-tabular">{memberships.length} Users</span>
            </div>
          </div>
        </div>

        {/* Card 4: DARK ACTION CARD */}
        <div className="bg-[#111317] rounded-3xl p-5 shadow-lux-black border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[10px] uppercase tracking-wider">
                <Building2 className="size-3.5" />
                <span>Staff Credentialing</span>
              </div>
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            </div>

            <h3 className="text-base font-extrabold text-white leading-tight">
              Governance Gate
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Unapproved clinician accounts are locked out from patient records until hospital administrator authorization.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
            {pendingMember ? (
              <Link
                href={`/admin/memberships/${pendingMember.id}`}
                className="block"
              >
                <button className="w-full h-8 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all">
                  <span>Review Credentials</span>
                  <ArrowRight data-icon="inline-end" className="size-3 text-slate-950" />
                </button>
              </Link>
            ) : (
              <span className="text-xs font-mono text-emerald-400">All credentials verified</span>
            )}
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 3. MIDDLE TIER: Asymmetric 3-Column Bento (Hours Activity + Daily Schedule + Mini Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1: Governance Onboarding Hours Activity Chart (~45% width: 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Credentialing Throughput</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="size-3" />
                    +12% faster verification
                  </span>
                </div>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600">
                Weekly ⌵
              </div>
            </div>

            {/* Stylized Modern Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 relative">
                {/* Floating Tooltip above Thursday Bar */}
                <div className="absolute top-1 left-[54%] -translate-x-1/2 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg flex items-center gap-1 z-20 pointer-events-none">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>3 Applications Handled</span>
                </div>

                {/* Day Bars */}
                {[
                  { day: "Su", height: "h-12", active: false },
                  { day: "Mo", height: "h-20", active: false },
                  { day: "Tu", height: "h-28", active: false },
                  { day: "We", height: "h-36", active: false },
                  { day: "Th", height: "h-36", active: true },
                  { day: "Fr", height: "h-16", active: false },
                  { day: "Sa", height: "h-10", active: false },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full max-w-[14px] bg-slate-100 rounded-full h-36 flex items-end">
                      <div
                        className={`w-full rounded-full transition-all ${
                          item.active
                            ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                            : "bg-[#111317] group-hover:bg-slate-700"
                        } ${item.height}`}
                      />
                    </div>
                    <span className={`text-[11px] font-mono ${item.active ? "font-bold text-slate-900" : "text-slate-400"}`}>
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Hospital Tenancy:</span>
            <span className="font-semibold text-emerald-800">Enforced Partition</span>
          </div>
        </div>

        {/* Col 2: Governance Schedule / Verification Pipeline ("Daily Schedule" in ref, ~35% width: 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Governance Pipeline</h3>
              <span className="text-xs text-slate-400 font-medium">Security Ops</span>
            </div>

            {/* List with intentional clinical squircles & right chevrons */}
            <div className="divide-y divide-slate-100 mt-2">
              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <UserCheck className="size-4 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">NPI & Identity Check</div>
                    <div className="text-[11px] text-slate-500">Registry Verification Passed</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-700 flex items-center justify-center shrink-0">
                    <Lock className="size-4 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Privilege Assignment</div>
                    <div className="text-[11px] text-amber-700 font-semibold">Pending Admin Sign-off</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0">
                    <Building2 className="size-4 text-emerald-800" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Department Affiliation</div>
                    <div className="text-[11px] text-slate-500">Cardiology Outpatient Clinic</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div className="py-2.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-4 text-slate-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Audit Logging Gate</div>
                    <div className="text-[11px] text-slate-500">Immutable Ledger Active</div>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Governance Standard:</span>
            <span className="text-slate-700 font-medium">SOC 2 / HIPAA Ready</span>
          </div>
        </div>

        {/* Col 3: Mini Calendar & Quick Portals (~20% width: 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 shadow-lux border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Calendar Widget */}
            <div className="flex items-center justify-between pb-2 text-xs">
              <span className="font-bold text-slate-900">October, 2026</span>
              <div className="flex items-center gap-1 text-slate-400">
                <ChevronLeft className="size-3.5 cursor-pointer hover:text-slate-700" />
                <ChevronRight className="size-3.5 cursor-pointer hover:text-slate-700" />
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono py-2 border-b border-slate-100">
              <span className="text-slate-400 font-bold">S</span>
              <span className="text-slate-400 font-bold">M</span>
              <span className="text-slate-400 font-bold">T</span>
              <span className="text-slate-400 font-bold">W</span>
              <span className="text-slate-400 font-bold">T</span>
              <span className="text-slate-400 font-bold">F</span>
              <span className="text-slate-400 font-bold">S</span>

              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === 28;
                return (
                  <span
                    key={i}
                    className={`py-1 rounded-full text-[10px] flex items-center justify-center ${
                      isSelected
                        ? "bg-slate-900 text-white font-extrabold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            {/* Admin Directories */}
            <div className="flex flex-col gap-2 mt-3">
              <Link href="/admin/users" className="block group">
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px] group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 text-emerald-700" />
                    <span className="font-bold text-slate-900">Clinician Directory</span>
                  </div>
                  <ChevronRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/memberships" className="block group">
                <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px] group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-3.5 text-amber-600" />
                    <span className="font-bold text-slate-900">Applications</span>
                  </div>
                  <ChevronRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400 text-right">
            Hospital Tenancy: Active
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TIER: Staff Affiliations Ledger */}
      <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100 flex flex-col gap-4">
        {/* Ledger Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Staff Affiliations & Credentialing Ledger</span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                ({memberships.length} staff records)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage clinical licenses, hospital role authorization, and tenant access boundaries.
            </p>
          </div>
        </div>

        {/* Membership List */}
        <div className="divide-y divide-slate-100">
          {memberships.map((m) => (
            <div
              key={m.id}
              className="py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors rounded-2xl px-2"
            >
              {/* Left: Squircle Icon + Clinician Name + Email */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="size-5 text-slate-700" />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {m.displayName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-xs text-slate-500">
                      {m.email}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {m.userId} • Applied: {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Right: Role Badge + Status + Action */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/60">
                  {m.role}
                </span>

                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full ${
                    m.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {m.status}
                </span>

                <Link href={`/admin/memberships/${m.id}`}>
                  <button className="h-8 px-4 rounded-xl bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                    <span>Manage</span>
                    <ArrowRight data-icon="inline-end" className="size-3 text-emerald-300" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}