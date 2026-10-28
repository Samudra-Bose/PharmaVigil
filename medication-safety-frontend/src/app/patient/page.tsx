"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  FIXTURE_PATIENT,
  INITIAL_FIXTURE_CASE,
  INITIAL_FIXTURE_APPOINTMENTS,
  type PatientRecord,
  type FixtureCase,
  type AppointmentRecord,
} from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import {
  Pill,
  Clock,
  Calendar,
  Phone,
  ArrowRight,
  PlusCircle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  User,
} from "lucide-react";

export default function PatientHomePage() {
  const [patient, setPatient] = useState<PatientRecord>(FIXTURE_PATIENT);
  const [cases, setCases] = useState<FixtureCase[]>([INITIAL_FIXTURE_CASE]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(INITIAL_FIXTURE_APPOINTMENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [p, c, apts] = await Promise.all([
          api.getPatient("P-9021"),
          api.getCases(),
          api.listAppointments({ patientId: "P-9021" }),
        ]);
        if (p) setPatient(p);
        if (c && c.length > 0) setCases(c);
        if (apts) setAppointments(apts);
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
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* 1. Rythea-Style Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lux border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-forest-900 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Patient Care Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              MRN: {patient?.syntheticHospitalPatientId || "P-9021"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {patient?.displayName || "Rajan Sharma"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cardiology Outpatient Clinic • <span className="font-semibold text-slate-700">Metro General Hospital</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/patient/appointments/new">
            <button className="h-9 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-lux flex items-center gap-1.5 transition-all">
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" /> Book Visit
            </button>
          </Link>
          <Link href="/patient/prescriptions">
            <button className="h-9 px-4 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-lux flex items-center gap-1.5 transition-all">
              <Pill className="w-3.5 h-3.5 text-emerald-300" /> My Prescriptions
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Asymmetric Clinical Hero Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Active Regimen & Dose Schedule */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-600" /> Current Prescription Regimen
                </span>
                <Badge variant={isReady ? "authorized" : "moderate"} className="text-[11px]">
                  {isReady ? "Ready for Pharmacy Pick-up" : "Under Pharmacist Safety Review"}
                </Badge>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cardiology Regimen (Dr. Arvind Patel)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Prescription v{activeRx?.currentRevisionNumber || 1} • {activeRx?.items.length || 2} prescribed medication{activeRx?.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2.5">
                {activeRx?.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.brandText ? `${item.brandText} • ` : ""}{item.dosageForm}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold font-mono text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shrink-0">
                      {item.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Link href={`/patient/prescriptions/${activeRx?.id || "case_rx_9021_01"}`}>
                <button className="h-8 px-3 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-all">
                  <span>View Dosing Schedule</span>
                  <ArrowRight className="w-3 h-3 text-emerald-300" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Pharmacy Pickup & Upcoming Consultations */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-lux border border-slate-100/90 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Upcoming Appointment
                </span>
                {upcomingApt && <Badge variant="info">Scheduled</Badge>}
              </div>

              {upcomingApt ? (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {upcomingApt.reason}
                  </h3>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{formatDateTime(upcomingApt.slotStart)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Clinician: <span className="font-semibold text-slate-800">{upcomingApt.clinicianDisplayName}</span> ({upcomingApt.department})
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-600">
                  <h3 className="text-sm font-bold text-slate-900">
                    Metro General Hospital Outpatient Pharmacy
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Open: 8:00 AM – 8:00 PM (Mon–Sat)
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Counter Helpline: +91 11 2345 6789
                  </div>
                </div>
              )}

              {/* Obsidian Pickup Notice Card */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white shadow-lux-black space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pharmacy Pickup Instructions</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Present your synthetic Patient MRN <span className="font-mono font-bold text-white">P-9021</span> at Outpatient Counter 3. Dispensing requires pharmacist safety clearance.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link href="/patient/appointments" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                All Consultations ({appointments.length})
              </Link>
              <Link href="/patient/history">
                <button className="h-8 px-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200/80 transition-all">
                  Past Medication History
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
