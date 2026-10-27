"use client";

import React, { useEffect } from "react";
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
  X,
  Building2,
  LogOut,
  ArrowLeftRight
} from "lucide-react";
import type { UserRole } from "@/types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { role, user, hospitalName, switchRole, logout } = useAuth();
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Trap ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  let items: NavItem[] = [];

  if (role === "PHARMACIST") {
    items = [
      { label: "Work Queue", href: "/pharmacist", icon: ClipboardList, badge: "1" },
      { label: "Patient Search", href: "/pharmacist/patients/search", icon: Search },
      { label: "Prescription Capture", href: "/pharmacist/capture", icon: Camera },
      { label: "Audit & Dispense History", href: "/pharmacist/history", icon: History },
    ];
  } else if (role === "DOCTOR") {
    items = [
      { label: "Triage Task Queue", href: "/doctor", icon: AlertTriangle, badge: "1" },
      { label: "Prescriptions Ledger", href: "/doctor/prescriptions", icon: FileText },
      { label: "Author Revision", href: "/doctor/prescriptions/new", icon: PlusCircle },
      { label: "Consultation Queue", href: "/doctor/appointments", icon: Calendar },
    ];
  } else if (role === "PATIENT") {
    items = [
      { label: "Health Overview", href: "/patient", icon: LayoutDashboard },
      { label: "My Prescriptions", href: "/patient/prescriptions", icon: Pill },
      { label: "Appointments", href: "/patient/appointments", icon: Calendar },
      { label: "Medication History", href: "/patient/history", icon: Clock },
    ];
  } else if (role === "HOSPITAL_ADMIN") {
    items = [
      { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Membership Requests", href: "/admin/memberships", icon: UserCheck, badge: "1" },
      { label: "Clinician Directory", href: "/admin/users", icon: Users },
      { label: "Scoped Demo Reset", href: "/admin/demo-reset", icon: RotateCcw },
    ];
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 shadow-xl z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
              PharmaVigil Navigation
            </div>
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              {hospitalName}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Switcher on Mobile */}
        <div className="p-3 border-b border-slate-100 bg-slate-100/70">
          <label htmlFor="mobile-role-select" className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Switch Demo Portal
          </label>
          <div className="relative">
            <select
              id="mobile-role-select"
              value={role || ""}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="PHARMACIST">Pharmacist Portal</option>
              <option value="DOCTOR">Doctor Portal</option>
              <option value="PATIENT">Patient Hub</option>
              <option value="HOSPITAL_ADMIN">Administrator</option>
            </select>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors min-h-[44px]",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-teal-400" : "text-slate-500")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {user && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-xs font-bold text-slate-900 truncate">{user.displayName}</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
                Role: {role}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-200 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
