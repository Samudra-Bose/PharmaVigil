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
  ShieldCheck,
  ArrowUpRight,
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
        "hidden lg:flex flex-col bg-[#111317] border-r border-[#222731] shrink-0 transition-all duration-200 select-none z-30 text-white",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Clinical Portal Navigation"
    >
      {/* Workspace Context Header (Dark Eduplex Aesthetic) */}
      <div
        className={cn(
          "p-3.5 border-b border-white/10 flex items-center",
          collapsed ? "justify-center" : "justify-between px-4"
        )}
      >
        {!collapsed ? (
          <Link href="/" className="overflow-hidden min-w-0 pr-1 flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10 shrink-0">
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>PharmaVigil</span>
                <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">CDS</span>
              </div>
              <div
                className="text-[11px] font-medium text-slate-400 truncate mt-0.5"
                title={hospitalName}
              >
                {roleTitle} • {hospitalName}
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="size-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10 shrink-0"
            title={`PharmaVigil - ${roleTitle}`}
          >
            <ShieldCheck className="size-4 text-emerald-600" />
          </Link>
        )}

        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
          className={cn(
            "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400",
            collapsed && "hidden"
          )}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronLeft className="size-3.5" />
        </button>
      </div>

      {/* Nav List with Eduplex Pistachio Active Pill */}
      <nav className="flex-1 py-4 px-2.5 flex flex-col gap-1.5 overflow-y-auto">
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
                "flex items-center rounded-2xl text-xs transition-all group relative",
                collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5",
                isActive
                  ? "bg-[#bbf7d0] text-slate-950 font-bold shadow-md shadow-emerald-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-slate-950 stroke-[2.2]" : "text-slate-400 group-hover:text-white"
                )}
              />

              {!collapsed && (
                <span className="flex-1 truncate tracking-tight text-xs">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    item.badgeVariant === "urgent"
                      ? "bg-rose-500 text-white"
                      : isActive
                        ? "bg-slate-950 text-white"
                        : "bg-white/10 text-slate-300"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Indicator Pip for active state when collapsed */}
              {collapsed && isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-400 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Refined Clinical Bottom Feature Card */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight text-white">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Safety Engine Active</span>
            </div>
            <div className="size-6 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="size-3.5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-normal leading-snug">
            Deterministic rule checks enforced. Dispensing fails closed until clinician sign-off.
          </p>
        </div>
      )}

      {/* Footer System Status */}
      <div
        className={cn(
          "p-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono",
          collapsed ? "justify-center" : "px-3.5"
        )}
      >
        {!collapsed ? (
          <>
            <span>Hotkeys: </span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-slate-300">⌥1..4</kbd>
          </>
        ) : (
          <button
            onClick={toggleCollapsed}
            aria-label="Expand sidebar navigation"
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Expand Sidebar"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
