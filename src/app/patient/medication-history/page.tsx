"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { PatientAllergy, PatientMedicationHistoryItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import {
  ShieldAlert,
  Pill,
  AlertTriangle,
  Plus,
  Clock,
  HeartPulse,
  Info,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function PatientMedicationHistoryPage() {
  const { user } = useAuth();
  const patientId = (user as any)?.syntheticHospitalPatientId || "P-9021";

  const [activeTab, setActiveTab] = useState<"ALLERGIES" | "HOME_MEDS">("ALLERGIES");
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [medications, setMedications] = useState<PatientMedicationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Allergy Form
  const [allergySubstance, setAllergySubstance] = useState("");
  const [allergyType, setAllergyType] = useState<"ALLERGY" | "ADVERSE_REACTION" | "INTOLERANCE">("ALLERGY");
  const [allergySeverity, setAllergySeverity] = useState<"MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING">("MODERATE");
  const [allergyReaction, setAllergyReaction] = useState("");

  // New Medication Form
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medUnit, setMedUnit] = useState("mg");
  const [medRoute, setMedRoute] = useState("ORAL");
  const [medFrequency, setMedFrequency] = useState("Once daily");
  const [medStatus, setMedStatus] = useState<"ACTIVE" | "STOPPED">("ACTIVE");
  const [medStartDate, setMedStartDate] = useState(new Date().toISOString().split("T")[0]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allgs, meds] = await Promise.all([
        api.getAllergies(patientId),
        api.getMedicationHistory(patientId),
      ]);
      setAllergies(allgs);
      setMedications(meds);
    } catch (err) {
      console.error("Failed to load patient history", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergySubstance.trim()) {
      toast.error("Please enter the name of the medicine, food, or substance.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.addAllergy(patientId, {
        substanceText: allergySubstance.trim(),
        recordType: allergyType,
        severity: allergySeverity,
        reactionDescription: allergyReaction.trim() || undefined,
        // Server will enforce PATIENT_REPORTED and REPORTED
      });

      toast.success("Allergy record submitted for clinical review!");
      setAllergyModalOpen(false);
      setAllergySubstance("");
      setAllergyReaction("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit allergy.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      toast.error("Please enter the medication or supplement name.");
      return;
    }
    if (!medDose.trim()) {
      toast.error("Please enter the dose quantity.");
      return;
    }

    try {
      setSubmitting(true);
      await api.addMedicationHistory(patientId, {
        medicineName: medName.trim(),
        dose: medDose.trim(),
        unit: medUnit,
        route: medRoute,
        frequency: medFrequency,
        status: medStatus,
        startDate: medStartDate,
      });

      toast.success("Home medication reported for clinical verification!");
      setMedModalOpen(false);
      setMedName("");
      setMedDose("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit home medication.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "LIFE_THREATENING":
      case "SEVERE":
        return <Badge variant="critical">{severity}</Badge>;
      case "MODERATE":
        return <Badge variant="warning">{severity}</Badge>;
      case "MILD":
        return <Badge variant="info">{severity}</Badge>;
      default:
        return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Reported Medications & Known Allergies
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Patient self-reporting portal for declaring home therapies, over-the-counter supplements, and drug reactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "ALLERGIES" ? (
            <Button
              size="sm"
              variant="primary"
              className="text-xs gap-1.5 shadow-xs"
              onClick={() => setAllergyModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> + Report Known Allergy
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              className="text-xs gap-1.5 shadow-xs"
              onClick={() => setMedModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" /> + Report Home Medication
            </Button>
          )}
        </div>
      </div>

      {/* Clinical Safety Disclaimer Banner */}
      <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900 block">Clinical Verification Notice</span>
          <p className="mt-0.5 leading-relaxed text-amber-800">
            Self-reported medications and allergies are visible to your healthcare team with a{" "}
            <span className="font-semibold underline">Patient-Reported</span> verification badge. Your physician or pharmacist will formally verify these entries during your next clinical visit.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ALLERGIES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "ALLERGIES"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Known Allergies & Adverse Reactions ({allergies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("HOME_MEDS")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "HOME_MEDS"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Home Medications & Supplements ({medications.length})</span>
        </button>
      </div>

      {/* Tab 1: Allergies */}
      {activeTab === "ALLERGIES" && (
        <>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : allergies.length === 0 ? (
            <EmptyState
              title="No allergies reported"
              description="You have not reported any drug allergies or adverse reactions yet. If you have known reactions, report them to keep your clinical team informed."
              actionLabel="Report Allergy"
              onAction={() => setAllergyModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {allergies.map((alg) => (
                <div
                  key={alg.id}
                  className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-2.5 relative text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">{alg.substanceText}</h2>
                      <span className="text-[11px] text-slate-500 font-medium">{alg.recordType}</span>
                    </div>
                    {getSeverityBadge(alg.severity)}
                  </div>

                  {alg.reactionDescription && (
                    <div className="p-2.5 rounded bg-slate-50 text-slate-700 border border-slate-150">
                      <strong className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Reaction Experienced:</strong>
                      <p>{alg.reactionDescription}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px] font-bold">
                        {alg.sourceType || "PATIENT_REPORTED"}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold">
                        {alg.verificationStatus || "REPORTED"}
                      </span>
                    </div>

                    <span className="text-slate-400 font-mono text-[10px]">
                      {alg.recordedAt ? new Date(alg.recordedAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Home Medications */}
      {activeTab === "HOME_MEDS" && (
        <>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : medications.length === 0 ? (
            <EmptyState
              title="No home medications declared"
              description="Keep your doctors and pharmacists informed by reporting current chronic medications, over-the-counter tablets, or dietary supplements."
              actionLabel="Add Home Medication"
              onAction={() => setMedModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Medication / Supplement</th>
                      <th className="py-3 px-4">Dosage & Unit</th>
                      <th className="py-3 px-4">Route & Frequency</th>
                      <th className="py-3 px-4">Therapy Status</th>
                      <th className="py-3 px-4">Verification Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {medications.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{m.medicineName}</div>
                          {m.startDate && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Started: {new Date(m.startDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {m.dose} {m.unit}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{m.route}</span>
                          <span className="text-slate-500 block text-[11px]">{m.frequency}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={m.status === "ACTIVE" ? "authorized" : "neutral"}>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px] font-bold">
                              {m.sourceType || "PATIENT_REPORTED"}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold">
                              {m.verificationStatus || "REPORTED"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Report Allergy */}
      <Modal
        isOpen={allergyModalOpen}
        onClose={() => setAllergyModalOpen(false)}
        title="Report Known Drug Allergy or Adverse Reaction"
      >
        <form onSubmit={handleCreateAllergy} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Substance or Medicine Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={allergySubstance}
              onChange={(e) => setAllergySubstance(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Aspirin"
              className="text-xs h-8"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Type of Reaction
              </label>
              <select
                value={allergyType}
                onChange={(e) => setAllergyType(e.target.value as any)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
              >
                <option value="ALLERGY">Allergy (Immune-mediated / Rash / Anaphylaxis)</option>
                <option value="ADVERSE_REACTION">Adverse Reaction (Severe nausea / Vomiting)</option>
                <option value="INTOLERANCE">Intolerance (Mild stomach upset)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Severity
              </label>
              <select
                value={allergySeverity}
                onChange={(e) => setAllergySeverity(e.target.value as any)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
              >
                <option value="MILD">Mild (Localized rash, itching)</option>
                <option value="MODERATE">Moderate (Generalized hives, swelling)</option>
                <option value="SEVERE">Severe (Shortness of breath, throat tightness)</option>
                <option value="LIFE_THREATENING">Life-Threatening (Anaphylaxis shock)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reaction Description & Timing
            </label>
            <Textarea
              rows={3}
              value={allergyReaction}
              onChange={(e) => setAllergyReaction(e.target.value)}
              placeholder="e.g. Experienced intense facial swelling and hives within 30 minutes of swallowing tablet..."
              className="text-xs"
            />
          </div>

          <div className="p-2.5 rounded bg-amber-50 text-[11px] text-amber-900 border border-amber-200">
            <strong>Note:</strong> This entry will be stored with a <em>Patient-Reported</em> tag and verified by your clinician during your next appointment.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" size="sm" variant="outline" onClick={() => setAllergyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Allergy Report"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Report Home Medication */}
      <Modal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        title="Report Home Medication or Supplement"
      >
        <form onSubmit={handleCreateMedication} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Medication or Supplement Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Metformin 500mg, Omega-3 Fish Oil, Vitamin D3"
              className="text-xs h-8"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dose Amount <span className="text-red-500">*</span>
              </label>
              <Input
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                placeholder="e.g. 500, 1, 20"
                className="text-xs h-8 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={medUnit}
                onChange={(e) => setMedUnit(e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="mcg">mcg</option>
                <option value="mL">mL</option>
                <option value="tablets">tablets</option>
                <option value="capsules">capsules</option>
                <option value="drops">drops</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Route
              </label>
              <select
                value={medRoute}
                onChange={(e) => setMedRoute(e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
              >
                <option value="ORAL">Oral (Swallowed)</option>
                <option value="TOPICAL">Topical (Skin cream/patch)</option>
                <option value="INHALATION">Inhalation (Inhaler/Nebulizer)</option>
                <option value="SUBLINGUAL">Sublingual (Under tongue)</option>
                <option value="EYE_DROPS">Eye Drops</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Frequency
              </label>
              <Input
                value={medFrequency}
                onChange={(e) => setMedFrequency(e.target.value)}
                placeholder="e.g. Once daily, Twice daily"
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Status
              </label>
              <select
                value={medStatus}
                onChange={(e) => setMedStatus(e.target.value as any)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
              >
                <option value="ACTIVE">Currently Taking (Active)</option>
                <option value="STOPPED">Stopped / Discontinued</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Approximate Start Date
              </label>
              <Input
                type="date"
                value={medStartDate}
                onChange={(e) => setMedStartDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" size="sm" variant="outline" onClick={() => setMedModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Home Medication"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
