"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import type { PrescriptionItem, MedicineCandidate } from "@/types";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { 
  Pill, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert
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
    if (hasUnresolvedItems) {
      clinicalToast.warning(
        "Unconfirmed Medicines",
        "All items must be explicitly confirmed to proceed"
      );
      return;
    }
    setSubmitting(true);
    try {
      await api.confirmMedicines(caseId, items);
      clinicalToast.success(
        "Medicine Mappings Saved",
        "Verified against hospital formulary catalogue"
      );
      router.push(`/pharmacist/cases/${caseId}/check`);
    } catch (err) {
      clinicalToast.error(err, "Failed to save medicine mappings");
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
            Case: <span className="font-mono font-bold text-slate-800 font-tabular">{caseId}</span> • Patient ID: {caseData?.patientId}
          </p>
        </div>
      </div>

      {/* Safety Blocker Banner */}
      {hasUnresolvedItems ? (
        <Alert variant="destructive" className="shadow-subtle">
          <ShieldAlert className="h-4 w-4 text-rose-700" />
          <AlertTitle className="font-bold text-rose-950">Safety Blocker (REQ-SAFE-002): Ambiguous Item Detected</AlertTitle>
          <AlertDescription className="text-rose-900 mt-1 text-xs">
            Unmapped or ambiguous medicines cannot advance to rule evaluation. Confirm all ingredients and dosage forms below
            to clear this gate.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="p-3.5 rounded-lg bg-teal-50/50 border border-teal-200 text-xs text-teal-950 flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="font-medium">All prescription items have been successfully mapped to verified catalogue ingredients. Ready for deterministic safety check.</span>
        </div>
      )}

      {loading ? (
        <PrescriptionTableSkeleton rowCount={3} />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-64">Raw Extracted Text</TableHead>
                  <TableHead>Catalogue Ingredient Mapping</TableHead>
                  <TableHead className="w-44">Strength & Form</TableHead>
                  <TableHead className="w-40">Frequency & Duration</TableHead>
                  <TableHead className="w-32">
                    <ClinicalTooltip
                      term="Match Status"
                      explanation="Must be explicitly CONFIRMED against verified hospital catalogue before safety checking."
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="font-mono text-slate-900">
                      <div className="text-xs font-semibold">{item.rawExtractedText}</div>
                    </TableCell>

                    <TableCell>
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
                        className="w-full text-xs font-semibold rounded-md border border-slate-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                      >
                        <option value="">-- Select Catalogue Item --</option>
                        {catalogue.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.displayName}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 font-tabular">
                        Ingredients: {item.canonicalIngredientIds.join(", ")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={item.strengthValue || ""}
                          onChange={(e) =>
                            handleUpdateItem(idx, { strengthValue: parseFloat(e.target.value) || 0 })
                          }
                          className="w-14 px-1.5 py-1 text-xs font-mono rounded border border-slate-300 font-tabular bg-white"
                        />
                        <span className="text-xs font-mono text-slate-500">{item.strengthUnit || "mg"}</span>
                        <input
                          type="text"
                          value={item.dosageForm || "Tablet"}
                          onChange={(e) => handleUpdateItem(idx, { dosageForm: e.target.value })}
                          className="w-20 px-1.5 py-1 text-xs rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-slate-900">{item.frequency || "Once Daily"}</div>
                      <div className="text-[11px] text-slate-500 font-mono font-tabular">{item.durationValue} {item.durationUnit}</div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={item.matchStatus === "CONFIRMED" ? "authorized" : "incomplete"}
                        className="text-[10px] py-0.5"
                      >
                        {item.matchStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 font-mono">
                    Item {idx + 1}
                  </span>
                  <Badge
                    variant={item.matchStatus === "CONFIRMED" ? "authorized" : "incomplete"}
                    className="text-[10px]"
                  >
                    {item.matchStatus}
                  </Badge>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded font-mono border border-slate-100">
                  {item.rawExtractedText}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Matched Catalogue Product
                  </label>
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
                    className="w-full text-xs font-semibold rounded-md border border-slate-300 p-2 bg-white"
                  >
                    <option value="">-- Select Catalogue Item --</option>
                    {catalogue.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Strength</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.strengthValue || ""}
                        onChange={(e) =>
                          handleUpdateItem(idx, { strengthValue: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 p-1 rounded border border-slate-300 text-xs font-mono"
                      />
                      <span className="font-mono text-slate-500">{item.strengthUnit || "mg"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Dosage Form</span>
                    <input
                      type="text"
                      value={item.dosageForm || "Tablet"}
                      onChange={(e) => handleUpdateItem(idx, { dosageForm: e.target.value })}
                      className="w-full p-1 rounded border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500">
          Step 3 of 5 • All medications mapped to canonical identifiers
        </div>

        <Button
          size="md"
          variant="primary"
          disabled={hasUnresolvedItems}
          loading={submitting}
          onClick={handleProceed}
          className="gap-2 text-xs w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
        >
          <Check className="w-4 h-4 text-emerald-400" /> Confirm Medicines & Run Safety Check <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
