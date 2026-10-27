"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import type { PrescriptionItem, MedicineCandidate } from "@/types";
import { Button } from "@/components/ui/Button";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  FileEdit, 
  Plus, 
  Trash2, 
  Check, 
  ArrowLeft, 
  Sparkles,
  GitCommit 
} from "lucide-react";

function CreateRevisionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || "case_rx_9021_01";

  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [catalogue, setCatalogue] = useState<MedicineCandidate[]>([]);
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      rawExtractedText: "Warfarin Sodium 5mg",
      catalogueItemId: "cat_warfarin_5",
      canonicalIngredientIds: ["ing_warfarin"],
      brandText: "Coumadin",
      strengthValue: 5,
      strengthUnit: "mg",
      dosageForm: "Tablet",
      doseValue: 1,
      doseUnit: "Tablet",
      route: "Oral",
      frequency: "Once Daily (At Night)",
      durationValue: 30,
      durationUnit: "days",
      matchConfidence: 1.0,
      matchStatus: "CONFIRMED",
    },
    {
      rawExtractedText: "Paracetamol 500mg (Analgesic Replacement)",
      catalogueItemId: "cat_paracetamol_500",
      canonicalIngredientIds: ["ing_paracetamol"],
      brandText: "Crocin",
      strengthValue: 500,
      strengthUnit: "mg",
      dosageForm: "Tablet",
      doseValue: 1,
      doseUnit: "Tablet",
      route: "Oral",
      frequency: "As Needed for Pain (Max 3/day)",
      durationValue: 15,
      durationUnit: "days",
      matchConfidence: 1.0,
      matchStatus: "CONFIRMED",
    },
  ]);

  const [changeReason, setChangeReason] = useState(
    "Discontinued Aspirin to eliminate gastrointestinal bleeding hazard with Warfarin. Substituted with Paracetamol 500mg for analgesia."
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, cat] = await Promise.all([
          api.getCase(caseId),
          api.searchCatalogue(""),
        ]);
        setCaseData(c);
        setCatalogue(cat);
      } catch (err) {
        console.error("Error loading case:", err);
      }
    }
    loadData();
  }, [caseId]);

  const handleApplyRecommendedSubstitution = () => {
    setItems([
      {
        rawExtractedText: "Warfarin Sodium 5mg",
        catalogueItemId: "cat_warfarin_5",
        canonicalIngredientIds: ["ing_warfarin"],
        brandText: "Coumadin",
        strengthValue: 5,
        strengthUnit: "mg",
        dosageForm: "Tablet",
        doseValue: 1,
        doseUnit: "Tablet",
        route: "Oral",
        frequency: "Once Daily (At Night)",
        durationValue: 30,
        durationUnit: "days",
        matchConfidence: 1.0,
        matchStatus: "CONFIRMED",
      },
      {
        rawExtractedText: "Paracetamol 500mg (Analgesic Replacement)",
        catalogueItemId: "cat_paracetamol_500",
        canonicalIngredientIds: ["ing_paracetamol"],
        brandText: "Crocin",
        strengthValue: 500,
        strengthUnit: "mg",
        dosageForm: "Tablet",
        doseValue: 1,
        doseUnit: "Tablet",
        route: "Oral",
        frequency: "As Needed for Pain (Max 3/day)",
        durationValue: 15,
        durationUnit: "days",
        matchConfidence: 1.0,
        matchStatus: "CONFIRMED",
      },
    ]);
    setChangeReason(
      "Substituted Aspirin with Paracetamol 500mg to eliminate Warfarin drug-drug interaction bleeding hazard."
    );
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createRevision(caseId, items, changeReason);
      api.switchDemoRole("PHARMACIST");
      router.push(`/pharmacist/cases/${caseId}/check`);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  };

  const nextRevisionNumber = (caseData?.currentRevisionNumber || 1) + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-slate-700" />
            Issue Prescription Revision {nextRevisionNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription ID: <span className="font-mono font-bold text-slate-800">{caseId}</span> • Superceding Revision {caseData?.currentRevisionNumber || 1}
          </p>
        </div>

        <Link href="/doctor/prescriptions">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </Button>
        </Link>
      </div>

      {/* Demo Accelerator Button */}
      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-950">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">
            One-Click Clinical Resolution: Substitute Aspirin with Paracetamol 500mg
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleApplyRecommendedSubstitution}
          className="border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs gap-1.5 h-7"
        >
          <Check className="w-3.5 h-3.5" /> Apply Clean Substitution
        </Button>
      </div>

      {error && <ErrorDisplay error={error} />}

      <form onSubmit={handleSubmitRevision} className="space-y-6">
        {/* Prescribed Items Editor */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Revised Medication Items (Revision {nextRevisionNumber})
            </h3>
            <span className="text-xs text-slate-500 font-mono">{items.length} item(s)</span>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Item {idx + 1}: {item.canonicalIngredientIds.join(", ")}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono">Medication & Strength</label>
                    <input
                      type="text"
                      value={item.rawExtractedText}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].rawExtractedText = e.target.value;
                        setItems(updated);
                      }}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono">Dose & Frequency</label>
                    <input
                      type="text"
                      value={item.frequency || "Once Daily"}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].frequency = e.target.value;
                        setItems(updated);
                      }}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono">Duration (Days)</label>
                    <input
                      type="number"
                      value={item.durationValue || 30}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].durationValue = parseInt(e.target.value) || 30;
                        setItems(updated);
                      }}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Reason Field */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-2">
          <label htmlFor="reason" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Prescription Revision Clinical Justification <span className="text-rose-600">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Document why Revision {nextRevisionNumber} was created and how it resolves the prior clinical concern.
          </p>
          <textarea
            id="reason"
            rows={3}
            required
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            className="w-full p-3 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="gap-2 text-xs"
          >
            <GitCommit className="w-4 h-4 text-emerald-400" /> Create Revision {nextRevisionNumber} & Send to Pharmacy
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateRevisionPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-8"><Skeleton className="h-64 w-full" /></div>}>
      <CreateRevisionContent />
    </Suspense>
  );
}
