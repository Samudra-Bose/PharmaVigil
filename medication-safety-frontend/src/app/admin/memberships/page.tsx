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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant / Staff Member</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Assigned / Requested Role</TableHead>
              <TableHead>Credential Status</TableHead>
              <TableHead className="w-28 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-bold text-slate-900">{m.displayName}</TableCell>
                <TableCell className="font-mono text-slate-600 text-xs">{m.email}</TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-800">{m.role}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={m.status === "ACTIVE" ? "authorized" : "moderate"}>
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/memberships/${m.id}`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7">
                      Manage <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
