"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, Building2, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: Array<{ role: UserRole; label: string; shortcut: string }> = [
  { role: "PHARMACIST", label: "Pharmacist", shortcut: "⌥1" },
  { role: "DOCTOR", label: "Doctor", shortcut: "⌥2" },
  { role: "PATIENT", label: "Patient", shortcut: "⌥3" },
  { role: "HOSPITAL_ADMIN", label: "Admin", shortcut: "⌥4" },
];

export const AppHeader: React.FC = () => {
  const { user, membership, role, hospitalName, logout, switchRole } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 select-none">
        <div className="w-full px-3 sm:px-5 lg:px-6 h-12 sm:h-13 flex items-center justify-between gap-2">
          {/* Brand & Left Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Open portal navigation"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider shadow-2xs group-hover:bg-slate-800 transition-colors">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight">
                  PharmaVigil
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-medium px-1 py-0.1 bg-teal-50 text-teal-800 rounded border border-teal-200/60">
                  CDS
                </span>
              </div>
            </Link>

            {/* Hospital Tenancy Tag */}
            {membership && (
              <div className="hidden sm:flex items-center gap-1.5 pl-2.5 ml-1 border-l border-slate-200/80 text-xs text-slate-500">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700 truncate max-w-[140px] md:max-w-[180px]" title={hospitalName}>
                  {hospitalName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected" />
              </div>
            )}
          </div>

          {/* User and Role Switcher */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Desktop Segmented Role Switcher (Shown on screens ≥ 1024px) */}
              <nav
                aria-label="Role Switcher"
                className="hidden xl:flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/70 text-xs"
              >
                {ROLE_OPTIONS.map((opt) => {
                  const isActive = role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => switchRole(opt.role)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900",
                        isActive
                          ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-semibold"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                      )}
                    >
                      <span>{opt.label}</span>
                      <kbd className="text-[9px] font-mono text-slate-400 font-normal">
                        {opt.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </nav>

              {/* Compact Role Select (For widths under 1280px, including 900px!) */}
              <div className="xl:hidden flex items-center">
                <select
                  aria-label="Select Portal Role"
                  value={role || ""}
                  onChange={(e) => switchRole(e.target.value as UserRole)}
                  className="bg-slate-100/90 border border-slate-200/80 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer h-7"
                >
                  <option value="PHARMACIST">Pharmacist (⌥1)</option>
                  <option value="DOCTOR">Doctor (⌥2)</option>
                  <option value="PATIENT">Patient (⌥3)</option>
                  <option value="HOSPITAL_ADMIN">Admin (⌥4)</option>
                </select>
              </div>

              {/* User Profile & Sign Out */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200/80">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 text-xs font-semibold shrink-0">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[110px]">
                    {user.displayName}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {role}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className="text-slate-400 hover:text-slate-800 p-1 h-7 w-7"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/auth/login">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" variant="primary" className="h-7 text-xs">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
};
