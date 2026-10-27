"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, Building2, User, LogOut, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { UserRole } from "@/types";

export const AppHeader: React.FC = () => {
  const { user, membership, role, hospitalName, logout, switchRole } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider shadow-sm group-hover:bg-slate-800 transition-colors">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-semibold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                PharmaVigil
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                  v0.1
                </span>
              </span>
            </div>
          </Link>

          {/* Hospital indicator */}
          {membership && (
            <div className="hidden sm:flex items-center gap-1.5 pl-3 ml-3 border-l border-slate-200 text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-800">{hospitalName}</span>
            </div>
          )}
        </div>

        {/* User and Role Switcher */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Quick-Persona Switcher for Demo */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0" />
              <label htmlFor="role-select" className="text-slate-500 text-[11px] font-medium hidden md:inline">
                Portal:
              </label>
              <select
                id="role-select"
                value={role || ""}
                onChange={handleRoleChange}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="PHARMACIST">Pharmacist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PATIENT">Patient</option>
                <option value="HOSPITAL_ADMIN">Administrator</option>
              </select>
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {role}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={logout}
                className="text-slate-500 hover:text-slate-900 p-1.5 h-8 w-8 ml-1"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button size="sm" variant="outline">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" variant="primary">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
