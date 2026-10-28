"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, Building2, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

export const AppHeader: React.FC = () => {
  const { user, membership, role, hospitalName, logout, switchRole, isMockMode } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 select-none">
        <div className="w-full px-3 sm:px-5 lg:px-6 h-12 sm:h-13 flex items-center justify-between gap-2">
          {/* Brand & Left Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {mounted && user && (
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
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
                <span
                  className="font-medium text-slate-700 truncate max-w-[140px] md:max-w-[180px]"
                  title={hospitalName}
                >
                  {hospitalName}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                  title="Connected"
                />
              </div>
            )}
          </div>

          {/* User Profile & Actions */}
          {!mounted ? (
            <div className="w-28 h-7 flex items-center justify-end" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Authenticated Role Badge & Quick Demo Persona Switcher */}
              {role && (
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid="user-role-badge"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border select-none",
                      role === "DOCTOR" &&
                        "bg-teal-50 text-teal-800 border-teal-200/80",
                      role === "PHARMACIST" &&
                        "bg-emerald-50 text-emerald-800 border-emerald-200/80",
                      role === "PATIENT" &&
                        "bg-sky-50 text-sky-800 border-sky-200/80",
                      role === "HOSPITAL_ADMIN" &&
                        "bg-purple-50 text-purple-800 border-purple-200/80",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        role === "DOCTOR" && "bg-teal-600",
                        role === "PHARMACIST" && "bg-emerald-600",
                        role === "PATIENT" && "bg-sky-600",
                        role === "HOSPITAL_ADMIN" && "bg-purple-600",
                      )}
                    />
                    <span>
                      {role === "HOSPITAL_ADMIN"
                        ? "Hospital Admin"
                        : role === "PHARMACIST"
                          ? "Pharmacist"
                          : role === "DOCTOR"
                            ? "Doctor"
                            : "Patient"}
                    </span>
                  </span>

                  {isMockMode && (
                    <select
                      value={role}
                      onChange={(e) => switchRole(e.target.value as any)}
                      className="text-[11px] font-semibold bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-0.5 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer hidden md:inline-block"
                      title="Switch Clinical Persona"
                      aria-label="Switch Clinical Persona"
                    >
                      <option value="PHARMACIST">🌿 Pharmacist</option>
                      <option value="DOCTOR">🩺 Doctor (MD)</option>
                      <option value="PATIENT">👤 Patient</option>
                      <option value="HOSPITAL_ADMIN">🛡️ Admin</option>
                    </select>
                  )}
                </div>
              )}

              {/* Notifications Bell */}
              <NotificationBell />

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
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
};
