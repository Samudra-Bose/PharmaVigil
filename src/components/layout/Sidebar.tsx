"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
  Activity,
  ListOrdered,
  BedDouble,
  ShieldAlert,
  FileSearch,
  BookOpenCheck,
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
        // Default to compact mode on viewports under 1200px (e.g. 900px, 1024px)
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

  if (!role || pathname?.startsWith("/auth")) {
    return null;
  }

  let items: NavItem[] = [];
  let roleTitle = "Portal";

  if (role === "PHARMACIST") {
    roleTitle = "Pharmacy CDS";
    items = [
      { label: "Work Queue", href: "/pharmacist", icon: ClipboardList, badge: "1" },
      { label: "Inpatient Orders", href: "/pharmacist/orders", icon: BedDouble },
      { label: "Patient Search", href: "/pharmacist/patients/search", icon: Search },
      { label: "Prescription Capture", href: "/pharmacist/capture", icon: Camera },
      { label: "Audit & Dispense History", href: "/pharmacist/history", icon: History },
    ];
  } else if (role === "DOCTOR") {
    roleTitle = "Clinical Review (MD)";
    items = [
      { label: "Triage Task Queue", href: "/doctor", icon: AlertTriangle, badge: "1", badgeVariant: "urgent" },
      { label: "Inpatient Orders", href: "/doctor/orders", icon: ListOrdered },
      { label: "Prescriptions Ledger", href: "/doctor/prescriptions", icon: FileText },
      { label: "Author Revision", href: "/doctor/prescriptions/new", icon: PlusCircle },
      { label: "Consultations", href: "/doctor/appointments", icon: Calendar },
    ];
  } else if (role === "PATIENT") {
    roleTitle = "Patient Hub";
    items = [
      { label: "Health Overview", href: "/patient", icon: LayoutDashboard },
      { label: "My Prescriptions", href: "/patient/prescriptions", icon: Pill },
      { label: "Appointments", href: "/patient/appointments", icon: Calendar },
      { label: "Report Meds & Allergies", href: "/patient/medication-history", icon: ShieldAlert },
      { label: "Medication History", href: "/patient/history", icon: Clock },
    ];
  } else if (role === "HOSPITAL_ADMIN") {
    roleTitle = "Hospital Governance";
    items = [
      { label: "Governance Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Staff Memberships", href: "/admin/memberships", icon: UserCheck, badge: "1" },
      { label: "Clinician Directory", href: "/admin/users", icon: Users },
      { label: "Audit Trail", href: "/admin/audit", icon: FileSearch },
      { label: "Clinical Rules", href: "/admin/rules", icon: BookOpenCheck },
      { label: "Scoped Demo Reset", href: "/admin/demo-reset", icon: RotateCcw },
    ];
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-slate-50/70 border-r border-slate-200/80 shrink-0 transition-all duration-200 select-none z-30",
        collapsed ? "w-14" : "w-52"
      )}
      aria-label="Clinical Portal Navigation"
    >
      {/* Workspace Context Header */}
      <div className={cn("p-2.5 border-b border-slate-200/60 flex items-center justify-between", collapsed ? "justify-center px-1" : "px-3")}>
        {!collapsed && (
          <div className="overflow-hidden min-w-0 pr-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{roleTitle}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate mt-0.5" title={hospitalName}>
              {hospitalName}
            </div>
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname?.startsWith(item.href) &&
              (pathname === item.href || pathname.charAt(item.href.length) === "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-xs transition-all group relative",
                collapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5",
                isActive
                  ? "bg-white text-slate-900 shadow-2xs font-semibold border border-slate-200/90"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40 font-medium"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-700"
                )}
              />

              {!collapsed && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded font-medium",
                    item.badgeVariant === "urgent"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Indicator Pip for active state when collapsed */}
              {collapsed && isActive && (
                <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-teal-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className={cn("p-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono text-center", collapsed ? "hidden" : "block")}>
        <span>Hotkeys: </span>
        <kbd className="px-1 py-0.2 bg-white rounded border border-slate-200 text-slate-600">⌥1..4</kbd>
      </div>
    </aside>
  );
};
