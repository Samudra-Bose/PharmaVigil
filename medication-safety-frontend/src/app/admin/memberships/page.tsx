"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { UserCheck, ArrowRight, ArrowLeft, CheckCircle2, Ban, Mail, Shield } from "lucide-react";

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getMemberships();
      setMemberships(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickStatusChange = async (id: string, newStatus: "ACTIVE" | "SUSPENDED" | "PENDING", currentRole: any) => {
    setActionLoading(id);
    try {
      await api.updateMembershipStatus(id, newStatus, currentRole);
      const updated = await api.getMemberships();
      setMemberships(updated);
    } finally {
      setActionLoading(null);
    }
  };

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
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead>Applicant / Staff Member</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Assigned / Requested Role</TableHead>
                  <TableHead>Credential Status</TableHead>
                  <TableHead className="w-56 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((m) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-bold text-slate-900">{m.displayName}</TableCell>
                    <TableCell className="font-mono text-slate-600 text-xs">{m.email}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-800 text-xs">{m.role}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.status === "ACTIVE" ? "authorized" : "moderate"}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="primary"
                            loading={actionLoading === m.id}
                            onClick={() => handleQuickStatusChange(m.id, "ACTIVE", m.role)}
                            className="text-[11px] h-7 px-2 bg-emerald-700 hover:bg-emerald-800"
                            title="Approve applicant credentials"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                          </Button>
                        )}
                        {m.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={actionLoading === m.id}
                            onClick={() => handleQuickStatusChange(m.id, "SUSPENDED", m.role)}
                            className="text-[11px] h-7 px-2 text-rose-700 border-rose-200 hover:bg-rose-50"
                            title="Suspend role access"
                          >
                            <Ban className="w-3 h-3 mr-1" /> Suspend
                          </Button>
                        )}
                        {m.status === "SUSPENDED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={actionLoading === m.id}
                            onClick={() => handleQuickStatusChange(m.id, "ACTIVE", m.role)}
                            className="text-[11px] h-7 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            title="Reactivate membership"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Reactivate
                          </Button>
                        )}
                        <Link href={`/admin/memberships/${m.id}`}>
                          <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                            Manage <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {memberships.map((m) => (
              <div
                key={m.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{m.displayName}</div>
                  <Badge variant={m.status === "ACTIVE" ? "authorized" : "moderate"}>
                    {m.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {m.email}
                </div>

                <div className="text-xs text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Role: <span className="font-bold text-slate-900">{m.role}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {m.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="primary"
                      loading={actionLoading === m.id}
                      onClick={() => handleQuickStatusChange(m.id, "ACTIVE", m.role)}
                      className="text-xs h-8 bg-emerald-700 hover:bg-emerald-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  )}
                  {m.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={actionLoading === m.id}
                      onClick={() => handleQuickStatusChange(m.id, "SUSPENDED", m.role)}
                      className="text-xs h-8 text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                    </Button>
                  )}
                  {m.status === "SUSPENDED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={actionLoading === m.id}
                      onClick={() => handleQuickStatusChange(m.id, "ACTIVE", m.role)}
                      className="text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Reactivate
                    </Button>
                  )}
                  <Link href={`/admin/memberships/${m.id}`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-8">
                      Manage <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
