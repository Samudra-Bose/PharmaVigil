"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Shield, UserPlus, Info } from "lucide-react";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState<UserRole>("DOCTOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.registerApplicant({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        requestedRole,
      });
      // Registration requires admin approval; direct to pending page
      router.push("/auth/pending");
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-md bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Request Hospital Membership
          </h1>
          <p className="text-xs text-slate-500">
            Apply for staff or patient access at Metro General Hospital
          </p>
        </div>

        {/* Clinical Disclaimer */}
        <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Public registration creates an unverified account. Clinical roles (Doctor, Pharmacist)
            require explicit administrator verification and approval before access is granted.
          </p>
        </div>

        {error && <ErrorDisplay error={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Legal Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="e.g. Dr. Rajesh Kulkarni"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="user@hospital.invalid"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Create Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Requested Hospital Role
            </label>
            <select
              id="role"
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="PHARMACIST">Hospital Pharmacist</option>
              <option value="DOCTOR">Attending Doctor / Physician</option>
              <option value="PATIENT">Outpatient Patient Record</option>
            </select>
          </div>

          <Button type="submit" variant="primary" loading={loading} className="w-full gap-2">
            <UserPlus className="w-4 h-4" /> Submit Application
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
