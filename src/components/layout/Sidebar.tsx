"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { openShortcutsModal } from "@/components/layout/ShortcutsModal";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Search,
  Camera,
  History,
  AlertTriangle,
  FileText,
  PlusCircle,
  Pill,
  Clock,
  Users,
  UserCheck,
  RotateCcw,
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  BedDouble,
  ShieldAlert,
  FileSearch,
  BookOpenCheck,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "urgent" | "neutral";
}

export const Sidebar: React.FC = () => {
  const { role, hospitalName } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Responsive default: collapse on medium desktop (768px - 1180px), expand on wide screens
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("pharmavigil_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      } else if (window.innerWidth < 1200) {
        setCollapsed(true);
      }
    } catch {
      // Ignore in SSR
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("pharmavigil_sidebar_collapsed", String(next));
    } catch {
      // Ignore
    }
  };

  let effectiveRole = role;
  if (!effectiveRole) {
    if (pathname?.startsWith("/doctor")) effectiveRole = "DOCTOR";
    else if (pathname?.startsWith("/patient")) effectiveRole = "PATIENT";
    else if (pathname?.startsWith("/admin")) effectiveRole = "HOSPITAL_ADMIN";
    else if (pathname?.startsWith("/pharmacist")) effectiveRole = "PHARMACIST";
    else effectiveRole = "PHARMACIST";
  }

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  let items: NavItem[] = [];
  let roleTitle = "Portal";

  const roleTheme = {
    activeBg: "bg-teal-50 text-teal-950 font-bold border border-teal-200/90 shadow-2xs",
    activeIcon: "text-teal-700 stroke-[2.2]",
    activePip: "bg-teal-600",
    tag: "bg-teal-50 text-teal-800 border-teal-200/80",
    logoColor: "text-teal-400",
    statusDot: "bg-teal-600",
  };

  if (effectiveRole === "PHARMACIST") {
    roleTitle = "Pharmacy CDS";
    items = [
      {
        label: "Work Queue",
        href: "/pharmacist",
        icon: ClipboardList,
        badge: "1",
        badgeVariant: "urgent",
      },
      {
        label: "Inpatient Orders",
        href: "/pharmacist/orders",
        icon: BedDouble,
      },
      {
        label: "Patient Search",
        href: "/pharmacist/patients/search",
        icon: Search,
      },
      {
        label: "Prescription Capture",
        href: "/pharmacist/capture",
        icon: Camera,
      },
      {
        label: "Audit & Dispense History",
        href: "/pharmacist/history",
        icon: History,
      },
    ];
  } else if (effectiveRole === "DOCTOR") {
    roleTitle = "Clinical Review (MD)";
    items = [
      {
        label: "Triage Task Queue",
        href: "/doctor",
        icon: AlertTriangle,
        badge: "1",
        badgeVariant: "urgent",
      },
      { label: "Inpatient Orders", href: "/doctor/orders", icon: ListOrdered },
      {
        label: "Prescriptions Ledger",
        href: "/doctor/prescriptions",
        icon: FileText,
      },
      {
        label: "Author Revision",
        href: "/doctor/prescriptions/new",
        icon: PlusCircle,
      },
      { label: "Consultations", href: "/doctor/appointments", icon: Calendar },
    ];
  } else if (effectiveRole === "PATIENT") {
    roleTitle = "Patient Hub";
    items = [
      { label: "Health Overview", href: "/patient", icon: LayoutDashboard },
      { label: "My Prescriptions", href: "/patient/prescriptions", icon: Pill },
      { label: "Appointments", href: "/patient/appointments", icon: Calendar },
      {
        label: "Report Meds & Allergies",
        href: "/patient/medication-history",
        icon: ShieldAlert,
      },
      { label: "Medication History", href: "/patient/history", icon: Clock },
    ];
  } else if (effectiveRole === "HOSPITAL_ADMIN") {
    roleTitle = "Hospital Governance";
    items = [
      { label: "Governance Dashboard", href: "/admin", icon: LayoutDashboard },
      {
        label: "Staff Memberships",
        href: "/admin/memberships",
        icon: UserCheck,
        badge: "1",
      },
      { label: "Clinician Directory", href: "/admin/users", icon: Users },
      { label: "Audit Trail", href: "/admin/audit", icon: FileSearch },
      { label: "Clinical Rules", href: "/admin/rules", icon: BookOpenCheck },
      {
        label: "Scoped Demo Reset",
        href: "/admin/demo-reset",
        icon: RotateCcw,
      },
    ];
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-white border-r border-slate-200/80 shrink-0 transition-all duration-200 select-none z-30 text-slate-900",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Clinical Portal Navigation"
    >
      {/* Workspace Context Header (Clean Healthcare Architecture) */}
      <div
        className={cn(
          "p-3.5 border-b border-slate-100 flex items-center",
          collapsed ? "justify-center" : "justify-between px-4"
        )}
      >
        {!collapsed ? (
          <Link href="/" className="overflow-hidden min-w-0 pr-1 flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs shrink-0 group-hover:bg-slate-800 transition-colors">
              <ShieldCheck className={cn("size-4", roleTheme.logoColor)} />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>PharmaVigil</span>
                <span className={cn("text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border", roleTheme.tag)}>
                  CDS
                </span>
              </div>
              <div
                className="text-[11px] font-medium text-slate-500 truncate"
                title={hospitalName}
              >
                {roleTitle}
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="size-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs shrink-0"
            title={`PharmaVigil - ${roleTitle}`}
          >
            <ShieldCheck className={cn("size-4", roleTheme.logoColor)} />
          </Link>
        )}

        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className={cn(
            "p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer",
            collapsed && "hidden"
          )}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronLeft className="size-3.5" />
        </button>
      </div>

      {/* Nav List with Refined Soft Pills */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname?.startsWith(item.href) &&
              (pathname === item.href ||
                pathname.charAt(item.href.length) === "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl text-xs transition-all group relative cursor-pointer",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
                isActive
                  ? roleTheme.activeBg
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? roleTheme.activeIcon : "text-slate-400 group-hover:text-slate-700"
                )}
              />

              {!collapsed && (
                <span className="flex-1 truncate tracking-tight">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold",
                    item.badgeVariant === "urgent"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200/60"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Indicator Pip for active state when collapsed */}
              {collapsed && isActive && (
                <span className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full", roleTheme.activePip)} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status (Clean 1-Line Status) */}
      <div
        className={cn(
          "p-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono",
          collapsed ? "justify-center" : "px-3.5"
        )}
      >
        {!collapsed ? (
          <button
            type="button"
            onClick={openShortcutsModal}
            className="w-full flex items-center justify-between text-left hover:text-slate-800 transition-colors group cursor-pointer"
            title="Click to view keyboard shortcuts (?)"
            aria-label="View keyboard shortcuts"
          >
            <span className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", roleTheme.statusDot)} />
              <span className="group-hover:text-slate-700">Fails-Closed Active</span>
            </span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 group-hover:bg-slate-200 rounded border border-slate-200 text-slate-600 group-hover:text-slate-900 transition-colors">
              ⌥1..4
            </kbd>
          </button>
        ) : (
          <button
            onClick={toggleCollapsed}
            aria-label="Expand sidebar navigation"
            className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
