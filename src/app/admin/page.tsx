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
  ChevronLeft,
  Activity,
  TrendingUp,
  User,
  ShieldAlert,
  Check,
  AlertCircle,
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

  // Interactive UI state for Charts and Calendar
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "daily">("weekly");
  const [activeDayIndex, setActiveDayIndex] = useState<number>(4); // Thursday
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(28);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const chartData = {
    weekly: [
      { day: "Su", count: 0, height: "h-8", time: "0 verified" },
      { day: "Mo", count: 2, height: "h-20", time: "2 verified" },
      { day: "Tu", count: 3, height: "h-28", time: "3 verified" },
      { day: "We", count: 4, height: "h-36", time: "4 verified" },
      { day: "Th", count: 3, height: "h-36", time: "3 verified" },
      { day: "Fr", count: 1, height: "h-16", time: "1 verified" },
      { day: "Sa", count: 0, height: "h-8", time: "0 verified" },
    ],
    monthly: [
      { day: "W1", count: 8, height: "h-24", time: "8 verified" },
      { day: "W2", count: 12, height: "h-32", time: "12 verified" },
      { day: "W3", count: 15, height: "h-36", time: "15 verified" },
      { day: "W4", count: 10, height: "h-28", time: "10 verified" },
    ],
    daily: [
      { day: "09h", count: 1, height: "h-20", time: "1 verified" },
      { day: "11h", count: 2, height: "h-36", time: "2 verified" },
      { day: "14h", count: 1, height: "h-24", time: "1 verified" },
      { day: "16h", count: 1, height: "h-20", time: "1 verified" },
    ],
  };

  const currentChartBars = chartData[timeRange];
  const safeActiveDayIndex = activeDayIndex >= currentChartBars.length ? 0 : activeDayIndex;
  const activeChartItem = currentChartBars[safeActiveDayIndex];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header with calm typography & distinct button hierarchy */}
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
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/60">
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
                      className="h-7 px-3 rounded-lg bg-[#111317] hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight data-icon="inline-end" className="size-3 text-emerald-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>All credentialing events are cryptographically recorded in the audit trail.</span>
              <Link href="/admin/audit" className="text-emerald-700 font-semibold hover:underline">
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

        {/* Right Column (4 cols): Credentialing Activity + Calendar + Directory */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Credentialing Throughput Activity Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Credentialing Throughput</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <TrendingUp className="size-3" />
                      +12% faster verification
                    </span>
                  </div>
                </div>
                <select
                  aria-label="Filter credentialing throughput by time range"
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value as "weekly" | "monthly" | "daily");
                    setActiveDayIndex(0);
                  }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              {/* Minimal Bar Chart */}
              <div className="pt-5 pb-2">
                <div className="h-36 flex items-end justify-between gap-3 px-2 relative">
                  {/* Floating Tooltip */}
                  <div
                    className="absolute top-0 bg-[#111317] text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-md flex items-center gap-1.5 z-20 pointer-events-none transition-all duration-200"
                    style={{
                      left: `${Math.max(15, Math.min(85, ((safeActiveDayIndex + 0.5) / currentChartBars.length) * 100))}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>
                      {activeChartItem.count} {activeChartItem.count === 1 ? "Staff" : "Staff"} Handled
                    </span>
                  </div>

                  {/* Day Bars */}
                  {currentChartBars.map((item, i) => {
                    const isActive = i === safeActiveDayIndex;
                    return (
                      <button
                        key={item.day}
                        type="button"
                        onClick={() => setActiveDayIndex(i)}
                        aria-label={`${item.day}: ${item.count} applications handled`}
                        className="flex-1 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                      >
                        <div className="w-full max-w-[12px] bg-slate-100 rounded-full h-28 flex items-end">
                          <div
                            className={`w-full rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-emerald-600 ring-2 ring-emerald-300/50"
                                : "bg-slate-800 group-hover:bg-slate-700"
                            } ${item.height}`}
                          />
                        </div>
                        <span className={`text-[10px] font-mono transition-colors ${isActive ? "font-bold text-slate-900" : "text-slate-400"}`}>
                          {item.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Hospital Tenancy:</span>
              <span className="font-semibold text-emerald-800">Enforced Partition</span>
            </div>
          </div>

          {/* Mini Calendar & Quick Portals */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-lux flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 text-xs">
                <span className="font-bold text-slate-900">
                  {monthNames[calendarMonth]}, {calendarYear}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
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
                  const isSelected = day === selectedCalendarDay;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedCalendarDay(day)}
                      className={`py-1 rounded-full text-[10px] flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Admin Quick Directories */}
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
                      <span className="font-bold text-slate-900">Staff Applications</span>
                    </div>
                    <ChevronRight className="size-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                <Link href="/admin/audit" className="block group">
                  <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px] group-hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-3.5 text-slate-700" />
                      <span className="font-bold text-slate-900">Compliance Audit</span>
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
      </div>
    </div>
  );
}
