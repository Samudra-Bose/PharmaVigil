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
  User,
  ShieldAlert,
  FileCode2,
  Copy,
  BookOpenCheck,
  FileSearch,
} from "lucide-react";
import { clinicalToast } from "@/lib/toast";

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

  const copyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      clinicalToast.info(`${label} Copied`, `${text} copied to clipboard.`);
    }
  };

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
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* 1. Clean, Minimal Header */}
      <section
        aria-label="Admin Greeting"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2 border-b border-slate-200/80"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-teal-600" />
              Hospital Governance Hub
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Tenancy: <span className="font-semibold text-slate-700">metro-general</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Hospital Governance Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Role-based access control, clinician credentialing, and multi-tenant security isolation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/rules"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <BookOpenCheck className="size-3.5 text-slate-500" />
            <span>Clinical Rulesets</span>
          </Link>

          <Link
            href="/admin/audit"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-slate-300"
          >
            <FileSearch className="size-3.5 text-slate-500" />
            <span>Audit Trail</span>
          </Link>

          <Link
            href="/admin/demo-reset"
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs border border-rose-200 shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer hover:border-rose-300"
          >
            <RotateCcw className="size-3.5 text-rose-600" />
            <span>Demo Reset</span>
          </Link>
        </div>
      </section>

      {/* 2. Simple 3-Metric Overview Strip */}
      <section aria-label="Governance Overview" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Pending Decisions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <UserCheck className="size-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Pending Decisions</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {pendingCount} Applicant{pendingCount === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Action Needed
          </span>
        </div>

        {/* Metric 2: Active Verified Staff */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <Users className="size-5 text-teal-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Verified Clinicians</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {activeCount} Staff Members
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Active
          </span>
        </div>

        {/* Metric 3: Security & Multi-Tenancy */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Security Boundary</div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                Strict RBAC
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            HIPAA / SOC 2
          </span>
        </div>
      </section>

      {/* 3. Pending Application Banner (Clean Alert Card if pending) */}
      {pendingMember && (
        <section
          aria-label="Pending Decision Alert"
          className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  Decision Required
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  Applicant: <strong className="font-bold text-amber-950">{pendingMember.displayName}</strong>
                </span>
              </div>
              <div className="text-sm font-bold text-amber-950 mt-1">
                Physician Credentialing Sign-off Pending
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Requested Role: <strong className="font-semibold text-amber-950">{pendingMember.role}</strong> ({pendingMember.email}). Unapproved accounts remain locked out from patient records.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              href={`/admin/memberships/${pendingMember.id}`}
              className="h-9 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Review Credentials</span>
              <ArrowRight className="size-3 text-amber-100" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. Streamlined Staff Affiliations Ledger */}
      <section
        aria-label="Staff Directory"
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Staff Affiliations & Credentialing Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hospital clinician licenses, authorized roles, and tenant boundaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="size-3.5 text-slate-500" />
              <span>Clinician Directory</span>
            </Link>
            <Link
              href="/admin/memberships"
              className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserCheck className="size-3.5 text-slate-500" />
              <span>All Applications</span>
            </Link>
          </div>
        </div>

        {/* Membership List */}
        <div className="divide-y divide-slate-100">
          {memberships.map((m) => {
            const isPending = m.status === "PENDING";
            return (
              <div
                key={m.id}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2.5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs ${
                      isPending
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-teal-50 border-teal-200 text-teal-700"
                    }`}
                  >
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">
                        {m.displayName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {m.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{m.role}</span>
                      <span>•</span>
                      <span>Hospital Tenancy: metro-general</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isPending
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-teal-50 text-teal-800 border-teal-200"
                    }`}
                  >
                    {m.status}
                  </span>

                  <Link
                    href={`/admin/memberships/${m.id}`}
                    className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Manage</span>
                    <ArrowRight className="size-3 text-slate-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Subtle System Status Note */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Hospital Governance Boundary: metro-general (Multi-Tenant Isolated)</span>
        </div>
        <div>
          <span>Audit Log: Append-Only</span>
        </div>
      </div>
    </div>
  );
}
