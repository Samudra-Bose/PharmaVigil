"use client";

import React from "react";
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
  ListOrdered,
  BedDouble,
  ShieldAlert,
  FileSearch,
  BookOpenCheck,
} from "lucide-react";

export const RoleNavigation: React.FC = () => {
  const { role } = useAuth();
  const pathname = usePathname();

  if (!role || pathname?.startsWith("/auth")) {
    return null;
  }

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  let items: NavItem[] = [];

  if (role === "PHARMACIST") {
    items = [
      { label: "Work Queue", href: "/pharmacist", icon: ClipboardList },
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
      { label: "New Capture", href: "/pharmacist/capture", icon: Camera },
      { label: "Audit & History", href: "/pharmacist/history", icon: History },
    ];
  } else if (role === "DOCTOR") {
    items = [
      { label: "Triage Task Queue", href: "/doctor", icon: AlertTriangle },
      { label: "Inpatient Orders", href: "/doctor/orders", icon: ListOrdered },
      { label: "Prescriptions", href: "/doctor/prescriptions", icon: FileText },
      {
        label: "Create Revision",
        href: "/doctor/prescriptions/new",
        icon: PlusCircle,
      },
      { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
    ];
  } else if (role === "PATIENT") {
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
  } else if (role === "HOSPITAL_ADMIN") {
    items = [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Memberships", href: "/admin/memberships", icon: UserCheck },
      { label: "Staff Users", href: "/admin/users", icon: Users },
      { label: "Audit Trail", href: "/admin/audit", icon: FileSearch },
      { label: "Clinical Rules", href: "/admin/rules", icon: BookOpenCheck },
      { label: "Demo Reset", href: "/admin/demo-reset", icon: RotateCcw },
    ];
  }

  return (
    <nav
      aria-label="Role Portal Navigation"
      className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
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
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors",
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
              )}
            >
              <Icon
                className={cn(
                  "w-3.5 h-3.5",
                  isActive ? "text-slate-900" : "text-slate-400",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
