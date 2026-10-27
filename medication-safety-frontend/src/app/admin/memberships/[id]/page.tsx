"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserCheck, ArrowLeft, Check, ShieldAlert } from "lucide-react";

export default function MembershipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [member, setMember] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("DOCTOR");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const all = await api.getMemberships();
      const target = all.find((m) => m.id === id) || all[0];
      setMember(target);
      if (target) {
        setSelectedRole(target.role);
        setStatus(target.status);
      }
    }
    load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateMembershipStatus(id, status as any, selectedRole as any);
      router.push("/admin/memberships");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-700" />
            Manage Membership: {member?.displayName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hospital Tenancy: Metro General Hospital
          </p>
        </div>

        <Link href="/admin/memberships">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
        <div>
          <span className="block text-slate-500 uppercase font-mono text-[10px] mb-1">User Email</span>
          <div className="font-mono font-bold text-slate-900 text-sm">{member?.email}</div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Assign Hospital Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 rounded border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="DOCTOR">Doctor / Attending Physician</option>
            <option value="PHARMACIST">Hospital Pharmacist</option>
            <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
            <option value="PATIENT">Patient</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Membership Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="ACTIVE">Active (Granted Full Role Permissions)</option>
            <option value="PENDING">Pending (Access Blocked)</option>
            <option value="SUSPENDED">Suspended (Access Revoked)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <Button type="submit" variant="primary" loading={submitting} className="gap-2 text-xs">
            <Check className="w-4 h-4 text-emerald-400" /> Save Membership Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
