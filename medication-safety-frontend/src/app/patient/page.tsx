"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { PatientRecord, FixtureCase, AppointmentRecord } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import { 
  Pill, 
  Clock, 
  Calendar, 
  Building2, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  User,
  PlusCircle 
} from "lucide-react";

export default function PatientHomePage() {
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [p, c, apts] = await Promise.all([
          api.getPatient("P-9021"),
          api.getCases(),
          api.listAppointments({ patientId: "P-9021" }),
        ]);
        setPatient(p);
        setCases(c);
        setAppointments(apts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRx = cases[0];
  const isReady = activeRx?.status === "DISPENSING_AUTHORIZED";
  const upcomingApt = appointments.find((a) => a.status === "SCHEDULED");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Patient Welcome Header */}
      <Card className="shadow-subtle border-slate-200 bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Patient Care Hub
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              Welcome back, {patient?.displayName || "Rajan Sharma"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Hospital Patient ID: <span className="font-mono font-bold text-slate-800 font-tabular">{patient?.syntheticHospitalPatientId}</span> • Metro General Hospital
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/patient/appointments/new">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <PlusCircle className="w-3.5 h-3.5" /> Book Consultation
              </Button>
            </Link>
            <Link href="/patient/prescriptions">
              <Button size="sm" variant="primary" className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800">
                <Pill className="w-3.5 h-3.5" /> My Prescriptions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Prescription Status Card */}
          <Card className="shadow-subtle flex flex-col justify-between border-slate-200">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" /> Active Prescription
                </span>
                <Badge variant={isReady ? "authorized" : "moderate"}>
                  {isReady ? "Ready for Pharmacy Pick-up" : "Under Pharmacist Review"}
                </Badge>
              </div>

              <div>
                <div className="text-base font-bold text-slate-900">
                  Cardiology Outpatient Order (Dr. Arvind Patel)
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Revision {activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} prescribed medicines
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
                {activeRx?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">{item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
                <Button size="sm" variant="primary" className="text-xs gap-1.5 bg-slate-900 hover:bg-slate-800">
                  View Full Schedule & Instructions <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Upcoming Appointment or Pharmacy Hours */}
          <Card className="shadow-subtle flex flex-col justify-between border-slate-200">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Consultation
                </span>
                {upcomingApt && <Badge variant="info">Scheduled</Badge>}
              </div>

              {upcomingApt ? (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-slate-900">
                    {upcomingApt.reason}
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateTime(upcomingApt.slotStart)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Clinician: <span className="font-semibold text-slate-700">{upcomingApt.clinicianDisplayName}</span> ({upcomingApt.department})
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="text-sm font-semibold text-slate-900">
                    Metro General Hospital Outpatient Pharmacy (Counter 3)
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Open: 8:00 AM – 8:00 PM (Mon–Sat)
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Helpline: +91 11 2345 6789
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900">
                Have your synthetic patient ID <span className="font-mono font-bold font-tabular">P-9021</span> ready for any in-person consultations or counter visits.
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Link href="/patient/appointments" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                All Appointments ({appointments.length})
              </Link>
              <Link href="/patient/history">
                <Button size="sm" variant="outline" className="text-xs">
                  Past Medication History
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
