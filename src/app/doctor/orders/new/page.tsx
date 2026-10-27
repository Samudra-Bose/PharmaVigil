"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { InpatientMedicationOrderItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import {
  ListOrdered,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Pill,
  Clock,
  Send,
} from "lucide-react";

interface MedicationItemForm {
  catalogueItemId?: string;
  name: string;
  brandName?: string;
  dose: string;
  unit: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const SCHEDULE_FREQUENCIES = [
  { value: "Q8H", label: "Q8H — Every 8 hours (3x daily)" },
  { value: "Q12H", label: "Q12H — Every 12 hours (Twice daily)" },
  { value: "Q24H", label: "Q24H — Every 24 hours (Once daily)" },
  { value: "BID", label: "BID — Twice daily with meals" },
  { value: "TID", label: "TID — Three times daily" },
  { value: "QID", label: "QID — Four times daily" },
  { value: "STAT", label: "STAT — Immediately (single dose)" },
  { value: "PRN", label: "PRN — As needed for breakthrough symptoms" },
];

const ROUTES = [
  { value: "INTRAVENOUS", label: "Intravenous (IV)" },
  { value: "ORAL", label: "Oral (PO)" },
  { value: "SUBCUTANEOUS", label: "Subcutaneous (SC)" },
  { value: "INTRAMUSCULAR", label: "Intramuscular (IM)" },
  { value: "INHALATION", label: "Inhalation" },
  { value: "TOPICAL", label: "Topical" },
  { value: "SUBLINGUAL", label: "Sublingual" },
];

const PRELOADED_DRUGS = [
  { name: "Ceftriaxone", brandName: "Monocef 1g Injection", dose: "1", unit: "g", route: "INTRAVENOUS", frequency: "Q24H", duration: "7 days", instructions: "Infuse in 100mL 0.9% Normal Saline over 30 minutes" },
  { name: "Piperacillin + Tazobactam", brandName: "Tazomac 4.5g Injection", dose: "4.5", unit: "g", route: "INTRAVENOUS", frequency: "Q8H", duration: "5 days", instructions: "Extended infusion over 3 hours to optimize PK/PD target" },
  { name: "Vancomycin", brandName: "Vancogen 1g Infusion", dose: "1", unit: "g", route: "INTRAVENOUS", frequency: "Q12H", duration: "7 days", instructions: "Infuse over 60-120 minutes. Check trough prior to 4th dose." },
  { name: "Enoxaparin", brandName: "Clexane 40mg PFS", dose: "40", unit: "mg", route: "SUBCUTANEOUS", frequency: "Q24H", duration: "5 days", instructions: "Deep subcutaneous injection in anterolateral abdominal wall" },
  { name: "Ondansetron", brandName: "Emeset 8mg IV", dose: "8", unit: "mg", route: "INTRAVENOUS", frequency: "STAT", duration: "Single dose", instructions: "Slow IV push over 3-5 minutes" },
  { name: "Paracetamol", brandName: "Crocin 500", dose: "500", unit: "mg", route: "ORAL", frequency: "BID", duration: "3 days", instructions: "Take with water after food" },
  { name: "Metformin", brandName: "Glyciphage 500", dose: "500", unit: "mg", route: "ORAL", frequency: "BID", duration: "30 days", instructions: "Take with morning and evening meals" },
];

export default function NewDoctorOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState("P-9021");
  const [ward, setWard] = useState("Cardiology Ward 4B");
  const [bed, setBed] = useState("Bed 12");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<MedicationItemForm[]>([
    {
      name: "Ceftriaxone",
      brandName: "Monocef 1g Injection",
      dose: "1",
      unit: "g",
      route: "INTRAVENOUS",
      frequency: "Q24H",
      duration: "7 days",
      instructions: "Infuse in 100mL 0.9% Normal Saline over 30 minutes",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        brandName: "",
        dose: "",
        unit: "mg",
        route: "INTRAVENOUS",
        frequency: "Q8H",
        duration: "5 days",
        instructions: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("An inpatient order must contain at least one medication item.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MedicationItemForm, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const selectPreloadedDrug = (index: number, drug: typeof PRELOADED_DRUGS[0]) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        name: drug.name,
        brandName: drug.brandName,
        dose: drug.dose,
        unit: drug.unit,
        route: drug.route,
        frequency: drug.frequency,
        duration: drug.duration,
        instructions: drug.instructions,
      };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation gates
    if (!patientId.trim()) {
      toast.error("Please select a target synthetic inpatient record.");
      return;
    }

    if (items.length === 0) {
      toast.error("At least one medication order item is required.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name.trim()) {
        toast.error(`Item #${i + 1}: Medication name or ingredient is required.`);
        return;
      }
      const numDose = parseFloat(item.dose);
      if (isNaN(numDose) || numDose <= 0) {
        toast.error(`Item #${i + 1}: Positive dose numeric value is required.`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const formattedItems: InpatientMedicationOrderItem[] = items.map((it, idx) => ({
        id: `item_ord_${Date.now()}_${idx}`,
        canonicalIngredientIds: [it.name.trim()],
        brandName: it.brandName?.trim() || undefined,
        dose: it.dose.trim(),
        unit: it.unit.trim(),
        route: it.route,
        frequency: it.frequency,
        duration: it.duration || undefined,
        instructions: it.instructions || undefined,
      }));

      const created = await api.createMedicationOrder({
        patientId,
        items: formattedItems,
        notes: notes.trim() || undefined,
        ward: ward.trim() || undefined,
        bed: bed.trim() || undefined,
        scheduleFrequency: items[0]?.frequency || "Q8H",
        route: items[0]?.route || "INTRAVENOUS",
      });

      toast.success(`Inpatient order #${created.id} submitted successfully!`);
      router.push("/doctor/orders");
    } catch (err: any) {
      console.error("Order prescribing failed", err);
      toast.error(err.message || "Failed to submit medication order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/doctor/orders"
              className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-teal-700" />
              Prescribe Inpatient Medication Order
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-7">
            Author hospital-scoped scheduled inpatient therapies with administration frequencies, routes, and instructions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient and Hospital Location Card */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-slate-600" /> 1. Inpatient Location & Patient Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Patient Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Patient Record <span className="text-red-500">*</span>
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium focus:ring-1 focus:ring-slate-900"
              >
                <option value="P-9021">P-9021 — Rajan Sharma (Male, 58y, Penicillin Allergy)</option>
                <option value="P-9022">P-9022 — Priya Nair (Female, 34y, ICU Sepsis)</option>
                <option value="P-9023">P-9023 — Amitabh Sen (Male, 67y, Oncology Care)</option>
              </select>
            </div>

            {/* Ward */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hospital Ward / Unit
              </label>
              <Input
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Cardiology Ward 4B, ICU"
                className="h-8 text-xs"
              />
            </div>

            {/* Bed */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Bed ID
              </label>
              <Input
                value={bed}
                onChange={(e) => setBed(e.target.value)}
                placeholder="e.g. Bed 12"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Medication Items Repeater */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-700" /> 2. Ordered Medications ({items.length})
            </h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              className="text-xs gap-1 h-7"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medication
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3 relative text-xs"
              >
                {/* Item Number & Quick Formulary Matcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">
                      Medication Entry #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Formulary Quick-Pick:</span>
                    <select
                      onChange={(e) => {
                        const found = PRELOADED_DRUGS.find((d) => d.name === e.target.value);
                        if (found) selectPreloadedDrug(idx, found);
                      }}
                      defaultValue=""
                      className="h-6 px-1.5 text-[11px] rounded border border-slate-200 bg-white"
                    >
                      <option value="" disabled>Select drug...</option>
                      {PRELOADED_DRUGS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} ({d.dose}{d.unit} {d.route})
                        </option>
                      ))}
                    </select>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Drug Generic Ingredient <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      placeholder="e.g. Ceftriaxone, Piperacillin"
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  {/* Brand Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Commercial Brand Name (Optional)
                    </label>
                    <Input
                      value={item.brandName || ""}
                      onChange={(e) => updateItem(idx, "brandName", e.target.value)}
                      placeholder="e.g. Monocef 1g Injection"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Dose Value */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Dose Value <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min="0.01"
                      value={item.dose}
                      onChange={(e) => updateItem(idx, "dose", e.target.value)}
                      placeholder="e.g. 1, 500"
                      className="h-8 text-xs font-mono"
                      required
                    />
                  </div>

                  {/* Dose Unit */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Dose Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(idx, "unit", e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
                    >
                      <option value="g">g (grams)</option>
                      <option value="mg">mg (milligrams)</option>
                      <option value="mcg">mcg (micrograms)</option>
                      <option value="mL">mL (milliliters)</option>
                      <option value="tablets">tablets</option>
                      <option value="units">units</option>
                    </select>
                  </div>

                  {/* Route */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Administration Route <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.route}
                      onChange={(e) => updateItem(idx, "route", e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
                    >
                      {ROUTES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Schedule Frequency */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Inpatient Schedule <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, "frequency", e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-medium"
                    >
                      {SCHEDULE_FREQUENCIES.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Duration
                    </label>
                    <Input
                      value={item.duration}
                      onChange={(e) => updateItem(idx, "duration", e.target.value)}
                      placeholder="e.g. 5 days, 7 days, Single dose"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Specific Instructions */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Specific Administration Instructions
                    </label>
                    <Input
                      value={item.instructions}
                      onChange={(e) => updateItem(idx, "instructions", e.target.value)}
                      placeholder="e.g. Infuse over 30 mins in 100mL 0.9% NaCl"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Notes & Rationale */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-slate-600" /> 3. Clinical Rationale & Nursing Notes
          </h2>

          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1">
              Instructions for Pharmacy & Inpatient Nursing Staff
            </label>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Post-op antimicrobial coverage. Monitor renal clearance and check for IV site phlebitis..."
              className="text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/doctor/orders">
            <Button type="button" size="sm" variant="outline" className="text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Cancel & Back
            </Button>
          </Link>

          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={submitting}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Prescribing Order..." : "Submit Inpatient Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
