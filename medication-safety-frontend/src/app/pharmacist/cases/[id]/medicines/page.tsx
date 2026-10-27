"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import type { PrescriptionItem, MedicineCandidate } from "@/types";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Pill, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Search,
  Plus
} from "lucide-react";

export default function MedicineMatchingPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [catalogue, setCatalogue] = useState<MedicineCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [c, cat] = await Promise.all([
          api.getCase(caseId),
          api.searchCatalogue(""),
        ]);
        setCaseData(c);
        setItems(c.items);
        setCatalogue(cat);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  const hasUnresolvedItems = items.some(
    (item) => item.matchStatus !== "CONFIRMED"
  );

  const handleUpdateItem = (index: number, updates: Partial<PrescriptionItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    setItems(updated);
  };

  const handleProceed = async () => {
    if (hasUnresolvedItems) return;
    setSubmitting(true);
    try {
      await api.confirmMedicines(caseId, items);
      router.push(`/pharmacist/cases/${caseId}/check`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PipelineStepper currentStep={3} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-slate-700" />
            Medicine Identity & Catalogue Confirmation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Case: <span className="font-mono font-bold text-slate-800">{caseId}</span> • Patient ID: {caseData?.patientId}
          </p>
        </div>
      </div>

      {/* Safety Blocker Banner */}
      {hasUnresolvedItems ? (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-950 flex items-start gap-2.5 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Safety Blocker (REQ-SAFE-002):</span> Unmapped or ambiguous
            medicines cannot advance to rule evaluation. Confirm all ingredients and dosage forms below
            to clear this gate.
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>All prescription items have been successfully mapped to verified catalogue ingredients.</span>
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Raw Extracted Text</th>
                  <th className="py-3 px-4">Catalogue Ingredient Mapping</th>
                  <th className="py-3 px-4">Strength & Form</th>
                  <th className="py-3 px-4">Frequency & Duration</th>
                  <th className="py-3 px-4">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono text-slate-900 max-w-xs">
                      {item.rawExtractedText}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={item.catalogueItemId || ""}
                        onChange={(e) => {
                          const selected = catalogue.find((c) => c.id === e.target.value);
                          if (selected) {
                            handleUpdateItem(idx, {
                              catalogueItemId: selected.id,
                              canonicalIngredientIds: selected.canonicalIngredientIds,
                              matchStatus: "CONFIRMED",
                            });
                          }
                        }}
                        className="w-full text-xs font-semibold rounded border border-slate-300 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="">-- Select Catalogue Item --</option>
                        {catalogue.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.displayName}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Ingredients: {item.canonicalIngredientIds.join(", ")}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={item.strengthValue || ""}
                          onChange={(e) =>
                            handleUpdateItem(idx, { strengthValue: parseFloat(e.target.value) || 0 })
                          }
                          className="w-14 px-1.5 py-1 text-xs font-mono rounded border border-slate-300"
                        />
                        <span className="text-xs self-center font-mono">{item.strengthUnit || "mg"}</span>
                        <input
                          type="text"
                          value={item.dosageForm || "Tablet"}
                          onChange={(e) => handleUpdateItem(idx, { dosageForm: e.target.value })}
                          className="w-20 px-1.5 py-1 text-xs rounded border border-slate-300"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-slate-900">{item.frequency || "Once Daily"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.durationValue} {item.durationUnit}</div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={item.matchStatus === "CONFIRMED" ? "authorized" : "incomplete"}
                        className="text-[10px] py-0.5"
                      >
                        {item.matchStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500">
          Step 3 of 5 • Both medications mapped to canonical identifiers
        </div>

        <Button
          size="md"
          variant="primary"
          disabled={hasUnresolvedItems}
          loading={submitting}
          onClick={handleProceed}
          className="gap-2 text-xs w-full sm:w-auto"
        >
          <Check className="w-4 h-4 text-emerald-400" /> Confirm Medicines & Run Safety Check <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
