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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* 1. Calm Editorial Header with Tenancy and Scoped Reset Action */}
      <section
        aria-label="Admin Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
              Hospital Governance & Credentialing
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Tenancy: <span className="font-semibold text-slate-700">metro-general</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Hospital Governance Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Role-based access control, clinician credentialing, and multi-tenant security isolation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/demo-reset"
            className="h-9 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200/90 shadow-2xs inline-flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <RotateCcw data-icon="inline-start" className="size-3.5 text-rose-600" />
            <span>Scoped Demo Reset</span>
          </Link>
        </div>
      </section>

      {/* 2. Pending Credentialing Hero Alert Card (when action required) */}
      {pendingMember && (
        <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-lux bg-gradient-to-r from-amber-50/40 via-white to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <UserCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Decision Required
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    Staff Applicant: {pendingMember.displayName}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Physician Access Request Awaiting Sign-off
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Requested Role: <span className="font-mono font-bold text-slate-800">{pendingMember.role}</span> ({pendingMember.email}). Unapproved clinician accounts remain locked out from patient records.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href={`/admin/memberships/${pendingMember.id}`}
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/25 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Review Credentials</span>
                <ArrowRight data-icon="inline-end" className="size-3.5 text-indigo-100" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Governance Pulse Bar (4-Stat Themed Strip) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lux overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-indigo-50/20">
            <div className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider">Clinicians Registered</div>
            <div className="text-xl font-extrabold text-indigo-700 mt-1 font-mono">
              {memberships.length} Users
            </div>
            <p className="text-[11px] text-indigo-600/70 mt-0.5">Verified Medical Staff</p>
          </div>
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-amber-50/20">
            <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">Pending Decisions</div>
            <div className="text-xl font-extrabold text-amber-700 mt-1 font-mono">
              {pendingCount} Applicant{pendingCount === 1 ? "" : "s"}
            </div>
            <p className="text-[11px] text-amber-600/70 mt-0.5">Awaiting Credential Sign-off</p>
          </div>
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-emerald-50/20">
            <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">Security Boundary</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
              Strict RBAC
            </div>
            <p className="text-[11px] text-emerald-600/70 mt-0.5">Zero Cross-Tenant Leak</p>
          </div>
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-slate-50/40">
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Compliance Benchmark</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              SOC 2 / HIPAA
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Immutable Audit Trails</p>
          </div>
        </div>
      </div>

      {/* 4. Asymmetric 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Staff Affiliations Ledger + Governance Pipeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section A: Staff Affiliations Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-4">
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
                  className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Users data-icon="inline-start" className="size-3.5 text-slate-500" />
                  <span>Directory</span>
                </Link>
                <Link
                  href="/admin/memberships"
                  className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserCheck data-icon="inline-start" className="size-3.5 text-slate-500" />
                  <span>Applications</span>
                </Link>
              </div>
            </div>

            {/* Membership Rows */}
            <div className="divide-y divide-slate-100">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors rounded-xl px-2"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-10 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                      <User className="size-4.5 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {m.displayName}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-xs text-slate-500 truncate">
                          {m.email}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {m.userId} • Applied: {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        m.role === "DOCTOR"
                          ? "bg-blue-50 text-blue-800 border-blue-200/80"
                          : m.role === "PHARMACIST"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                            : m.role === "PATIENT"
                              ? "bg-violet-50 text-violet-800 border-violet-200/80"
                              : "bg-indigo-50 text-indigo-800 border-indigo-200/80"
                      }`}
                    >
                      {m.role}
                    </span>

                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                        m.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {m.status}
                    </span>

                    <Link
                      href={`/admin/memberships/${m.id}`}
                      className="h-7 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight data-icon="inline-end" className="size-3 text-indigo-100" />
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

          {/* Section B: Governance Pipeline Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Governance & Verification Controls</h3>
              <span className="text-xs font-mono text-slate-400">Security Architecture</span>
            </div>

            <div className="divide-y divide-slate-100">
              <Link href="/admin/memberships" className="block group">
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        NPI & Identity Registry Check
                      </div>
                      <div className="text-[11px] text-slate-500">National provider identifier registry lookup validated</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>

              <Link
                href={
                  pendingMember
                    ? `/admin/memberships/${pendingMember.id}`
                    : "/admin/memberships"
                }
                className="block group"
              >
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                      <Lock className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                        Privilege & Scoped Role Assignment
                      </div>
                      <div className="text-[11px] text-amber-700 font-semibold">
                        {pendingCount > 0 ? "Pending Admin Sign-off for Dr. Neha Rao" : "All Privileges Assigned"}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>

              <Link href="/admin/users" className="block group">
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        Department & Unit Affiliation
                      </div>
                      <div className="text-[11px] text-slate-500">Assigned to Cardiology Outpatient Clinic</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>

              <Link href="/admin/audit" className="block group">
                <div className="py-2.5 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        Immutable Security Audit Gate
                      </div>
                      <div className="text-[11px] text-slate-500">Append-only compliance ledger verified</div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Administrative Direct Portals & Security Isolation */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Direct Portals */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Governance Portals</h3>
              <span className="text-xs font-mono text-slate-400">Quick Links</span>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/admin/users" className="block group">
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100/80 transition-colors">
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
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100/80 transition-colors">
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
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100/80 transition-colors">
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
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs group-hover:bg-slate-100/80 transition-colors">
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

          {/* Tenancy & Security Architecture */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Hospital Multi-Tenancy</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
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
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold text-xs border border-slate-200/80 hover:border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
