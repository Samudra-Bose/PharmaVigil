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
import { Users, ArrowLeft } from "lucide-react";

export default function AdminUsersPage() {
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
            <Users className="w-5 h-5 text-indigo-600" />
            Hospital Staff & User Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered accounts associated with Metro General Hospital
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
          <Link href="/admin">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Assigned Clinical Role</TableHead>
              <TableHead>Account Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((m) => {
              const roleVariant =
                m.role === "DOCTOR"
                  ? "sapphire"
                  : m.role === "PHARMACIST"
                    ? "emerald"
                    : m.role === "PATIENT"
                      ? "violet"
                      : "indigo";
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-bold text-slate-900">
                    {m.displayName}
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">
                    {m.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant as any} className="text-[11px]">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={m.status === "ACTIVE" ? "authorized" : "moderate"}
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
