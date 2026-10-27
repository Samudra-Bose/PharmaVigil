"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Calendar, Clock, User, ArrowLeft, Check, Sparkles } from "lucide-react";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [clinicianUserId, setClinicianUserId] = useState("usr_doctor_01");
  const [department, setDepartment] = useState("Cardiology");
  const [slotDate, setSlotDate] = useState("2026-11-05");
  const [slotTime, setSlotTime] = useState("11:30");
  const [reason, setReason] = useState("Follow-up on cardiovascular medications and anticoagulant monitoring");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const slotStart = `${slotDate}T${slotTime}:00Z`;
    // 30 minute slot
    const slotEnd = `${slotDate}T${slotTime.replace(/:\d\d/, ":59")}:00Z`;

    const clinicianName =
      clinicianUserId === "usr_doctor_01"
        ? "Dr. Arvind Patel, MD"
        : "Priya Sharma, RPh";

    try {
      await api.createAppointment({
        patientId: "pat_rajan_9021",
        patientDisplayName: "Rajan Sharma (P-9021)",
        clinicianUserId,
        clinicianDisplayName: clinicianName,
        department,
        slotStart,
        slotEnd,
        reason: reason.trim(),
      });
      router.push("/patient/appointments");
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-700" />
            Book Clinical Consultation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule a follow-up consultation with your care team at Metro General Hospital
          </p>
        </div>

        <Link href="/patient/appointments">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </Button>
        </Link>
      </div>

      {error && <ErrorDisplay error={error} />}

      <Card className="shadow-2xs">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="clinician" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Attending Clinician & Care Team Member
              </label>
              <select
                id="clinician"
                value={clinicianUserId}
                onChange={(e) => {
                  setClinicianUserId(e.target.value);
                  setDepartment(e.target.value === "usr_doctor_01" ? "Cardiology" : "Clinical Pharmacy");
                }}
                className="w-full p-2.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="usr_doctor_01">Dr. Arvind Patel, MD — Cardiology (Attending Physician)</option>
                <option value="usr_pharma_01">Priya Sharma, RPh — Outpatient Pharmacy Consultation</option>
              </select>
            </div>

            <div>
              <label htmlFor="dept" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Hospital Department
              </label>
              <Input
                id="dept"
                type="text"
                readOnly
                value={department}
                className="bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Preferred Date
                </label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Time Slot (30 mins)
                </label>
                <select
                  id="time"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full p-2 rounded-md border border-slate-300 text-xs font-mono text-slate-900 bg-white"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:30">04:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reason for Consultation / Symptoms
              </label>
              <Textarea
                id="reason"
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe reason for booking or medication queries..."
                className="text-xs"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="gap-2 text-xs"
              >
                <Check className="w-4 h-4 text-emerald-400" /> Confirm & Book Appointment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
