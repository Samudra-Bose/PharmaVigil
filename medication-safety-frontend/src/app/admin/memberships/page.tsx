"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserCheck, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getMemberships();
        setMemberships(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-700" />
            Hospital Membership Requests & Role Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grant, modify, or revoke clinical roles at Metro General Hospital
          </p>
        </div>

        <Link href="/admin">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Applicant / Staff</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned / Requested Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {memberships.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.displayName}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{m.email}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{m.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={m.status === "ACTIVE" ? "authorized" : "moderate"}>
                      {m.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/memberships/${m.id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                        Manage <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
