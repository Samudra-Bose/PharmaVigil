"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import type { AppointmentRecord } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Plus,
  Clock,
  User,
  ArrowLeft,
  XCircle,
  CheckCircle2,
} from "lucide-react";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.listAppointments({
          patientId: "pat_rajan_9021",
        });
        setAppointments(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled appointment?"))
      return;
    setCancellingId(id);
    try {
      await api.cancelAppointment(id);
      clinicalToast.info(
        "Appointment Cancelled",
        "Slot released back to outpatient schedule.",
      );
      const updated = await api.listAppointments({
        patientId: "pat_rajan_9021",
      });
      setAppointments(updated);
    } catch (err) {
      clinicalToast.error(err, "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = appointments.filter((a) => a.status === "SCHEDULED");
  const past = appointments.filter((a) => a.status !== "SCHEDULED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            My Hospital Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upcoming doctor consultations and clinical pharmacy visits at Metro
            General Hospital
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="text-xs gap-1.5">
            <Link href="/patient">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </Button>
          <Button asChild size="sm" variant="violet" className="text-xs gap-1.5">
            <Link href="/patient/appointments/new">
              <Plus className="w-3.5 h-3.5" /> Book Consultation
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <PrescriptionTableSkeleton rowCount={3} />
      ) : (
        <div className="space-y-6">
          {/* Upcoming Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Upcoming Scheduled
              Appointments ({upcoming.length})
            </h2>

            {upcoming.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500 shadow-2xs">
                No upcoming consultations scheduled. You can book a follow-up
                consultation with your attending cardiologist.
              </Card>
            ) : (
              <div className="space-y-3">
                {upcoming.map((apt) => (
                  <Card
                    key={apt.id}
                    className="shadow-2xs border-l-4 border-l-violet-600"
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {apt.clinicianDisplayName}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({apt.department})
                          </span>
                          <Badge variant="info">Scheduled</Badge>
                        </div>

                        <div className="text-xs text-slate-700 font-medium">
                          Purpose:{" "}
                          {apt.reason || "Outpatient Clinical Follow-up"}
                        </div>

                        <div className="text-[11px] text-slate-500 font-mono font-tabular flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatDateTime(apt.slotStart)}</span>
                          <span>• Metro General Hospital (Room 204)</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(apt.id)}
                        loading={cancellingId === apt.id}
                        className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200 shrink-0 gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Appointment
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments Section */}
          {past.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Past Consultations & Completed Visits
              </h2>

              <div className="space-y-2">
                {past.map((apt) => (
                  <Card key={apt.id} className="bg-slate-50/60 shadow-2xs">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {apt.clinicianDisplayName} ({apt.department})
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {apt.reason}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px] font-tabular">
                          {formatDateTime(apt.slotStart)}
                        </span>
                        <Badge
                          variant={
                            apt.status === "COMPLETED" ? "authorized" : "failed"
                          }
                        >
                          {apt.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
