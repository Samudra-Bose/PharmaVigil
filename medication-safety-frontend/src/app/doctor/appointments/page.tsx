"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { AppointmentRecord } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { formatDateTime } from "@/lib/utils";
import { Calendar, Clock, User, ArrowLeft, Filter, CheckCircle2 } from "lucide-react";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.listAppointments();
        setAppointments(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = appointments.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  const getStatusBadge = (status: AppointmentRecord["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge variant="info">Scheduled</Badge>;
      case "COMPLETED":
        return <Badge variant="authorized">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="failed">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-700" />
            Clinical Consultations & Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cardiology & Outpatient appointment schedule for Dr. Arvind Patel, MD (Metro General Hospital)
          </p>
        </div>

        <Link href="/doctor">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Triage Deck
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-600 mr-2">Status Filter:</span>
        <div className="flex items-center gap-1.5" role="tablist">
          {["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"].map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500 shadow-2xs">
          No appointments found matching filter "{filter}".
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">Date & Time</TableHead>
              <TableHead>Patient Context</TableHead>
              <TableHead className="w-36">Department</TableHead>
              <TableHead>Clinical Consultation Purpose</TableHead>
              <TableHead className="w-28 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell className="font-mono text-slate-700 text-xs font-tabular">
                  <div className="font-bold text-slate-900">{formatDateTime(apt.slotStart)}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" /> 30 min duration
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-900">{apt.patientDisplayName}</div>
                  <div className="text-[11px] text-slate-500 font-mono font-tabular">ID: {apt.patientId}</div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-700">{apt.department}</span>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-slate-800">{apt.reason || "Outpatient Follow-up"}</div>
                  {apt.notes && (
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{apt.notes}</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(apt.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
