"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Building2,
  User,
  LogOut,
  Menu,
  Search,
  ChevronDown,
  Stethoscope,
  Pill,
  UserCheck,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { openCommandPalette } from "@/components/layout/CommandPalette";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export const AppHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, membership, role, hospitalName, logout, switchRole, isMockMode } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPortalMenuOpen(false);
  }, [pathname]);

  const getHeaderAccent = () => {
    return "from-teal-700 via-teal-500 to-slate-800";
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case "PHARMACIST":
      case "DOCTOR":
      case "PATIENT":
      case "HOSPITAL_ADMIN":
        return {
          pill: "bg-teal-50 text-teal-900 border-teal-200/90 font-bold",
          dot: "bg-teal-600",
        };
      default:
        return {
          pill: "bg-slate-100 text-slate-800 border-slate-200/80 font-medium",
          dot: "bg-slate-500",
        };
    }
  };

  const roleTheme = role ? getRoleBadgeStyle(role) : null;

  return (
    <>
      <div className={cn("h-[2.5px] w-full bg-gradient-to-r transition-all duration-300", getHeaderAccent())} />
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

            <Link href="/" className="flex lg:hidden items-center gap-2 group">
              <div className="size-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider shadow-2xs group-hover:bg-slate-800 transition-colors">
                <Shield className="size-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight">
                  PharmaVigil
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200/60">
                  CDS
                </span>
              </div>
            </Link>

            {/* Hospital Tenancy Tag */}
            {membership && (
              <div className="hidden sm:flex items-center gap-1.5 lg:pl-0 sm:pl-2.5 sm:ml-1 lg:border-l-0 sm:border-l border-slate-200/80 text-xs text-slate-500">
                <Building2 className="size-3.5 text-slate-400 shrink-0" />
                <span
                  className="font-semibold text-slate-800 truncate max-w-[140px] md:max-w-[180px]"
                  title={hospitalName}
                >
                  {hospitalName}
                </span>
                <span
                  className="size-1.5 rounded-full bg-emerald-500 shrink-0"
                  title="Connected"
                />
              </div>
            )}
          </div>

          {/* Center: Command Palette Trigger Button (Eduplex / Raycast Spotlight Style) */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <button
              type="button"
              onClick={openCommandPalette}
              className="w-full flex items-center justify-between pl-3.5 pr-2.5 py-1.5 text-xs rounded-full bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 text-slate-500 hover:text-slate-800 transition-all shadow-2xs group cursor-pointer text-left"
              title="Search prescriptions, patients, clinical rules (⌘K)"
              aria-label="Open Command Palette Search"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="size-3.5 text-slate-400 group-hover:text-teal-700 transition-colors shrink-0" />
                <span className="truncate text-slate-400 group-hover:text-slate-600">
                  Search prescriptions, patients, clinical rules...
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Kbd className="bg-white border-slate-200 text-slate-400 group-hover:text-slate-700 text-[10px]">
                  ⌘K
                </Kbd>
              </div>
            </button>
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
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border select-none transition-colors",
                      roleTheme?.pill
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        roleTheme?.dot
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
                      className="text-[11px] font-semibold bg-slate-50 border border-slate-200/80 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer hidden md:inline-block shadow-2xs"
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

              {/* Mobile Quick Spotlight Search */}
              <button
                type="button"
                onClick={openCommandPalette}
                className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Search Command Palette (⌘K)"
                aria-label="Search Command Palette"
              >
                <Search className="size-4" />
              </button>

              {/* Notifications Bell */}
              <NotificationBell />

              {/* User Profile & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
                <div className="size-7 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 text-xs font-semibold shrink-0">
                  <User className="size-3.5 text-slate-600" />
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
                  className="text-slate-400 hover:text-slate-800 p-1 size-7"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={openCommandPalette}
                className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Search Command Palette (⌘K)"
                aria-label="Search Command Palette"
              >
                <Search className="size-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPortalMenuOpen(!portalMenuOpen)}
                  className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  aria-expanded={portalMenuOpen}
                  aria-haspopup="true"
                >
                  <KeyRound className="size-3.5 text-teal-700" />
                  <span>Portal Sign In</span>
                  <ChevronDown className="size-3 text-slate-400" />
                </button>

                {portalMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setPortalMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 z-50 space-y-1 text-xs animate-in fade-in zoom-in-95">
                      <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">
                        Choose Clinical Portal
                      </div>

                      <Link
                        href="/auth/login/doctor"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors group"
                      >
                        <div className="size-6 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                          <Stethoscope className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Doctor Portal</div>
                          <div className="text-[10px] text-slate-500">Physician triage & orders</div>
                        </div>
                      </Link>

                      <Link
                        href="/auth/login/pharmacist"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors group"
                      >
                        <div className="size-6 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                          <Pill className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Pharmacist Terminal</div>
                          <div className="text-[10px] text-slate-500">OCR & gated dispensing</div>
                        </div>
                      </Link>

                      <Link
                        href="/auth/login/patient"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors group"
                      >
                        <div className="size-6 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                          <UserCheck className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Patient Care Hub</div>
                          <div className="text-[10px] text-slate-500">Prescriptions & pickup</div>
                        </div>
                      </Link>

                      <Link
                        href="/auth/login/admin"
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors group"
                      >
                        <div className="size-6 rounded-lg bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                          <ShieldAlert className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">Hospital Admin</div>
                          <div className="text-[10px] text-slate-500">Rulesets & audit ledger</div>
                        </div>
                      </Link>

                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <Link
                          href="/auth/login"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <span>All Portals Directory</span>
                          <span className="text-teal-700 font-mono text-[10px]">→</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button asChild size="sm" variant="primary" className="h-8 text-xs font-semibold px-3">
                <Link href="/auth/register">Register</Link>
              </Button>
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
