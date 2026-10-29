"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
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
  User,
  ShieldAlert,
  AlertCircle,
  FileCode2,
  Sparkles,
  KeyRound,
  Shield,
  Fingerprint,
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Pinterest/Dribbble Modern Bento Header */}
      <section
        aria-label="Admin Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-900 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 shadow-2xs flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal-600" />
              Hospital Governance Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Tenancy: <span className="font-semibold text-slate-700">metro-general</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Hospital Governance Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
            Role-based access control, clinician credentialing, and multi-tenant security isolation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/demo-reset"
            className="h-10 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-rose-300"
          >
            <RotateCcw className="size-3.5 text-rose-600" />
            <span>Scoped Demo Reset</span>
          </Link>
        </div>
      </section>

      {/* 2. SIGNATURE HERO BENTO CARD: Obsidian & Deep Surgical Teal */}
      {pendingMember && (
        <section
          aria-label="Pending Decision"
          className="rounded-3xl bg-gradient-to-br from-[#0c181b] via-[#112429] to-[#0a1417] border border-teal-500/25 text-white shadow-xl shadow-slate-950/20 p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute -right-20 -top-20 size-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-20 size-60 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start gap-4 min-w-0 relative z-10">
            <div className="size-13 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/40">
              <UserCheck className="size-6 text-amber-300" />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Decision Required
                </span>
                <span className="text-teal-400/40">•</span>
                <span className="text-xs font-mono font-medium text-teal-200">
                  Staff Applicant: {pendingMember.displayName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Physician Access Request Awaiting Sign-off
              </h2>
              <p className="text-xs sm:text-sm text-teal-200/80 leading-relaxed max-w-2xl font-normal">
                Requested Role: <span className="font-mono font-bold text-white">{pendingMember.role}</span> ({pendingMember.email}). Unapproved clinician accounts remain locked out from patient records.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 relative z-10">
            <Link
              href={`/admin/memberships/${pendingMember.id}`}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>Review Credentials</span>
              <ArrowRight className="size-3.5 text-slate-950" />
            </Link>
          </div>
        </section>
      )}

      {/* 3. REFINED BENTO PULSE STRIP: Cohesive Luxe White Cards */}
      <section aria-label="Governance Overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clinicians</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Verified
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {memberships.length} Users
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Medical Staff Ledger</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Decisions</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Action Required
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {pendingCount} Applicant{pendingCount === 1 ? "" : "s"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Awaiting Sign-off</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Security Boundary</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Isolated
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Strict RBAC
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Zero Cross-Tenant Leak</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Compliance</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              SOC 2 / HIPAA
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Append-Only
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cryptographic Ledger</p>
          </div>
        </div>
      </section>

      {/* 4. CORE BENTO GRID LAYOUT (8 Cols + 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Staff Affiliations Ledger + Governance Pipeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section A: Staff Affiliations & Credentialing Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Staff Affiliations & Credentialing Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage clinical licenses, hospital role authorization, and tenant access boundaries.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/users"
                  className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Users className="size-3.5 text-slate-500" />
                  <span>Directory</span>
                </Link>
                <Link
                  href="/admin/memberships"
                  className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserCheck className="size-3.5 text-slate-500" />
                  <span>Applications</span>
                </Link>
              </div>
            </div>

            {/* Membership Rows */}
            <div className="divide-y divide-slate-100">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-11 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                      <User className="size-5 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {m.displayName}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {m.email}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600">ID: {m.userId}</span> • Applied: {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                        m.role === "DOCTOR"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : m.role === "PHARMACIST"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : m.role === "PATIENT"
                              ? "bg-violet-50 text-violet-800 border-violet-200"
                              : "bg-indigo-50 text-indigo-800 border-indigo-200"
                      }`}
                    >
                      {m.role}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        m.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {m.status}
                    </span>

                    <Link
                      href={`/admin/memberships/${m.id}`}
                      className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-xs shadow-indigo-600/20 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight className="size-3 text-indigo-100" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>All credentialing events are cryptographically recorded in the audit trail.</span>
              <Link href="/admin/audit" className="text-indigo-700 font-semibold hover:underline">
                View Audit Trail
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Direct Governance Portals & Tenancy Bento */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Direct Portals Bento Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Governance Portals</h3>
              <span className="text-xs font-mono text-slate-400">Quick Links</span>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/admin/users" className="block group">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Clinician Directory</div>
                      <div className="text-[11px] text-slate-500">{memberships.length} verified staff members</div>
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/memberships" className="block group">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Staff Applications</div>
                      <div className="text-[11px] text-amber-700 font-semibold">{pendingCount} pending review</div>
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/rules" className="block group">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <FileCode2 className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">CDS Safety Rulesets</div>
                      <div className="text-[11px] text-slate-500">Deterministic check criteria</div>
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/audit" className="block group">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Compliance Audit Ledger</div>
                      <div className="text-[11px] text-slate-500">Append-only event log</div>
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Tenancy & Security Architecture Bento Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Hospital Multi-Tenancy</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tenant Namespace</span>
                <span className="font-mono font-bold text-slate-800">metro-general</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Data Boundary</span>
                <span className="font-semibold text-emerald-700">Strict Row-Level Security</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Cryptographic Hash</span>
                <span className="font-mono text-slate-600">SHA-256 Verified</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/admin/demo-reset"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs border border-slate-200 hover:border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3 text-rose-500" />
                <span>Reset Demo Sandbox State</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
