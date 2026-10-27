"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { AppointmentRecord } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { formatDateTime } from "@/lib/utils";
import { SegmentedControl } from "@/components/heroui/SegmentedControl";
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

      {/* Filter Tabs (HeroUI Segmented Control) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { id: "ALL", label: "All", count: appointments.length },
            { id: "SCHEDULED", label: "Scheduled", count: appointments.filter((a) => a.status === "SCHEDULED").length },
            { id: "COMPLETED", label: "Completed", count: appointments.filter((a) => a.status === "COMPLETED").length },
            { id: "CANCELLED", label: "Cancelled", count: appointments.filter((a) => a.status === "CANCELLED").length },
          ]}
          ariaLabel="Appointment Status Filter"
        />
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-slate-500 shadow-subtle">
          No appointments found matching filter "{filter}".
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-44">Date & Time</TableHead>
                  <TableHead>Patient Context</TableHead>
                  <TableHead className="w-36">Department</TableHead>
                  <TableHead>Clinical Consultation Purpose</TableHead>
                  <TableHead className="w-28 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => (
                  <TableRow key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-slate-900 font-tabular">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateTime(apt.slotStart)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {apt.patientDisplayName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                        ID: {apt.patientId}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-slate-700 text-xs">
                        {apt.department}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-slate-800">
                        {apt.reason}
                      </div>
                      {apt.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          {apt.notes}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {getStatusBadge(apt.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((apt) => (
              <div
                key={apt.id}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDateTime(apt.slotStart)}
                  </span>
                  {getStatusBadge(apt.status)}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {apt.patientDisplayName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ID: {apt.patientId} • Department: {apt.department}
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="font-semibold text-slate-800">{apt.reason}</div>
                  {apt.notes && (
                    <div className="text-[11px] text-slate-500 italic mt-0.5">{apt.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
