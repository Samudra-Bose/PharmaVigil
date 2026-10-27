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
  Shield,
  Activity,
  HeartPulse
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "urgent" | "neutral";
}

export const Sidebar: React.FC = () => {
  const { role, user, hospitalName } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Load persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pharmavigil_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
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
    roleTitle = "Pharmacy Operations";
    items = [
      { label: "Work Queue", href: "/pharmacist", icon: ClipboardList, badge: "1" },
      { label: "Patient Search", href: "/pharmacist/patients/search", icon: Search },
      { label: "Prescription Capture", href: "/pharmacist/capture", icon: Camera },
      { label: "Audit & Dispense History", href: "/pharmacist/history", icon: History },
    ];
  } else if (role === "DOCTOR") {
    roleTitle = "Clinical Review (MD)";
    items = [
      { label: "Triage Task Queue", href: "/doctor", icon: AlertTriangle, badge: "1", badgeVariant: "urgent" },
      { label: "Prescriptions Ledger", href: "/doctor/prescriptions", icon: FileText },
      { label: "Author Revision", href: "/doctor/prescriptions/new", icon: PlusCircle },
      { label: "Consultation Queue", href: "/doctor/appointments", icon: Calendar },
    ];
  } else if (role === "PATIENT") {
    roleTitle = "Patient Health Hub";
    items = [
      { label: "Health Overview", href: "/patient", icon: LayoutDashboard },
      { label: "My Prescriptions", href: "/patient/prescriptions", icon: Pill },
      { label: "Appointments", href: "/patient/appointments", icon: Calendar },
      { label: "Medication History", href: "/patient/history", icon: Clock },
    ];
  } else if (role === "HOSPITAL_ADMIN") {
    roleTitle = "Hospital Administration";
    items = [
      { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Membership Requests", href: "/admin/memberships", icon: UserCheck, badge: "1" },
      { label: "Clinician Directory", href: "/admin/users", icon: Users },
      { label: "Scoped Demo Reset", href: "/admin/demo-reset", icon: RotateCcw },
    ];
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-white border-r border-slate-200 shrink-0 transition-all duration-200 select-none",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label="Clinical Portal Navigation"
    >
      {/* Workspace Context Header */}
      <div className={cn("p-3.5 border-b border-slate-100 flex items-center justify-between", collapsed ? "justify-center px-2" : "")}>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{roleTitle}</span>
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate mt-0.5" title={hospitalName}>
              {hospitalName}
            </div>
          </div>
        )}

        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
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
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-semibold transition-all group relative",
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-700"
                )}
              />

              {!collapsed && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full",
                    item.badgeVariant === "urgent"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Indicator Pip for active state when collapsed */}
              {collapsed && isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal-400 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Clinician Session Card */}
      <div className={cn("p-2.5 border-t border-slate-100 bg-slate-50/70", collapsed ? "text-center p-2" : "")}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 text-xs font-bold">
              {user?.displayName ? user.displayName.charAt(0) : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.displayName}
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
                {role}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold" title={`${user?.displayName} (${role})`}>
            {user?.displayName ? user.displayName.charAt(0) : "U"}
          </div>
        )}
      </div>
    </aside>
  );
};
