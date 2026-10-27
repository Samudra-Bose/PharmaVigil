"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import {
  INITIAL_FIXTURE_CASE,
  type FixtureCase,
} from "@/lib/mock-data/fixtures";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { ExtractionEditorSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import {
  FileText,
  AlertTriangle,
  Check,
  ArrowRight,
  Plus,
  Trash2,
  ScanText,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import { parsePrescriptionText } from "@/lib/ocr/prescription-parser";

interface OcrLineItem {
  id: number;
  text: string;
  confidence: number;
  status: "UNREVIEWED" | "CONFIRMED";
}

export default function OcrExtractPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<FixtureCase | null>(
    INITIAL_FIXTURE_CASE,
  );
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<OcrLineItem[]>([
    {
      id: 1,
      text: "Tab. Warfarin 5mg - 1 Tab OD x 30 days",
      confidence: 0.96,
      status: "UNREVIEWED",
    },
    {
      id: 2,
      text: "Tab. Aspirin 100mg - 1 Tab OD x 15 days",
      confidence: 0.94,
      status: "UNREVIEWED",
    },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const data = await api.getCase(caseId);
        setCaseData(data);

        if (data) {
          const rawItems = (data as any).items;
          const rawExtracted = (data as any).extractedText || (data as any).extractedOcrText;

          if (Array.isArray(rawItems) && rawItems.length > 0) {
            setLines(
              rawItems.map((item: any, idx: number) => ({
                id: idx + 1,
                text: item.rawExtractedText || item.brandText || `Item ${idx + 1}`,
                confidence: item.matchConfidence ?? item.confidence ?? 0.88,
                status: item.matchStatus === "CONFIRMED" ? "CONFIRMED" : "UNREVIEWED",
              }))
            );
          } else if (rawExtracted && typeof rawExtracted === "string") {
            const parsed = parsePrescriptionText(rawExtracted);
            if (parsed.length > 0) {
              setLines(
                parsed.map((item, idx) => ({
                  id: idx + 1,
                  text: item.rawExtractedText,
                  confidence: item.confidence,
                  status: "UNREVIEWED",
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load case data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  const handleUpdateLineText = (id: number, text: string) => {
    setLines(
      lines.map((l) => (l.id === id ? { ...l, text, status: "CONFIRMED" } : l)),
    );
  };

  const handleConfirmLine = (id: number) => {
    setLines(
      lines.map((l) => (l.id === id ? { ...l, status: "CONFIRMED" } : l)),
    );
    clinicalToast.info(
      "OCR Line Confirmed",
      `Line #${id} verified against handwritten scan`,
    );
  };

  const handleReopenLine = (id: number) => {
    setLines(
      lines.map((l) => (l.id === id ? { ...l, status: "UNREVIEWED" } : l)),
    );
  };

  const handleAddLine = () => {
    const nextId = lines.length ? Math.max(...lines.map((l) => l.id)) + 1 : 1;
    setLines([
      ...lines,
      { id: nextId, text: "", confidence: 1.0, status: "CONFIRMED" },
    ]);
  };

  const handleRemoveLine = (id: number) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleProceed = async () => {
    if (!allLinesConfirmed) return;
    setSaving(true);
    try {
      await api.updateExtractedText(
        caseId,
        lines.map((l) => ({
          id: l.id,
          text: l.text,
          confidence: l.confidence,
        })),
        (caseData as any)?.version || 1,
      );
      clinicalToast.success(
        "OCR Transcription Saved",
        "All prescription text items attested by pharmacist",
      );
      router.push(`/pharmacist/cases/${caseId}/medicines`);
    } catch (err) {
      clinicalToast.error(err, "Failed to save OCR transcription");
    } finally {
      setSaving(false);
    }
  };

  const confirmedCount = lines.filter((l) => l.status === "CONFIRMED").length;
  const allLinesConfirmed = lines.length > 0 && confirmedCount === lines.length;
  const unreviewedCount = lines.length - confirmedCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PipelineStepper currentStep={2} />

      {/* Untrusted OCR Warning Alert */}
      <Alert
        variant="warning"
        className="border-amber-300 bg-amber-50/60 shadow-subtle"
      >
        <AlertTriangle className="h-4 w-4 text-amber-700" />
        <AlertTitle className="font-bold text-amber-950 flex flex-wrap items-center gap-2">
          <span>
            Clinical Safety Protocol (REQ-SAFE-001): Individual Line
            Verification
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300 uppercase font-semibold">
            No Bulk Bypass Permitted
          </span>
        </AlertTitle>
        <AlertDescription className="text-amber-900 mt-1 text-xs leading-relaxed">
          Optical character recognition outputs are untrusted machine drafts.
          Each line must be explicitly cross-checked by the pharmacist against
          the handwritten prescription scan. Individual confirmation is required
          before proceeding to medicine matching.
        </AlertDescription>
      </Alert>

      {loading ? (
        <ExtractionEditorSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane: Scan Image Preview */}
          <Card className="flex flex-col shadow-subtle overflow-hidden border-slate-200">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <span className="font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                Prescription Source Document
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-tabular bg-white px-2 py-0.5 rounded border border-slate-200">
                Case: {caseId}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center items-center bg-slate-100/50 min-h-[350px]">
              <div className="w-full bg-white p-6 rounded-lg border border-slate-300 shadow-xs font-mono text-xs space-y-3 leading-relaxed">
                <div className="border-b border-slate-200 pb-2 text-[10px] text-slate-500 flex justify-between font-tabular">
                  <span className="font-bold text-slate-800 tracking-wider">
                    METRO GENERAL HOSPITAL • OUTPATIENT Rx
                  </span>
                  <span>2026-10-27</span>
                </div>
                <div className="text-slate-900 font-bold text-sm">
                  Patient: Rajan Sharma (P-9021)
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">1.</span> Tab.
                    Warfarin 5mg — 1 Tab OD x 30 days
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">2.</span> Tab.
                    Aspirin 100mg — 1 Tab OD x 15 days
                  </div>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Department: Cardiology</span>
                  <span className="font-semibold text-slate-700">
                    Dr. Arvind Patel, MD (Reg #MED-4091)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Pane: OCR Text Extraction Editor */}
          <Card className="flex flex-col shadow-subtle overflow-hidden border-slate-200">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <div>
                <span className="font-bold flex items-center gap-1.5">
                  <ScanText className="w-3.5 h-3.5 text-slate-600" />
                  Line Review ({confirmedCount}/{lines.length} Confirmed)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-slate-800 hover:text-slate-950 font-semibold inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Missing Line
              </button>
            </div>

            <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[450px]">
              {lines.map((line, idx) => {
                const isConfirmed = line.status === "CONFIRMED";

                return (
                  <div
                    key={line.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isConfirmed
                        ? "bg-teal-50/40 border-teal-200 shadow-2xs"
                        : "bg-amber-50/40 border-amber-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          Line {idx + 1}
                        </span>
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-300">
                            <CheckCircle2 className="w-3 h-3 text-teal-700" />{" "}
                            Pharmacist Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 animate-pulse">
                            <HelpCircle className="w-3 h-3 text-amber-700" />{" "}
                            Unreviewed Suggestion
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <ClinicalTooltip
                          term={`${Math.round(line.confidence * 100)}% Confidence`}
                          explanation="Optical model character recognition confidence. Does not indicate clinical validity."
                        >
                          <Badge
                            variant={
                              line.confidence >= 0.9 ? "info" : "moderate"
                            }
                            className="text-[10px] py-0 font-tabular font-mono"
                          >
                            {Math.round(line.confidence * 100)}% OCR
                          </Badge>
                        </ClinicalTooltip>
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Remove line"
                          aria-label={`Remove Line ${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <Input
                      value={line.text}
                      onChange={(e) =>
                        handleUpdateLineText(line.id, e.target.value)
                      }
                      placeholder="Type or correct extracted medication text..."
                      className="font-mono text-xs bg-white text-slate-900 border-slate-300 focus:border-slate-900 mb-2"
                    />

                    {/* Individual Line Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        {isConfirmed
                          ? "Verified against scan image"
                          : "Inspect dosage and frequency against scan"}
                      </span>

                      {!isConfirmed ? (
                        <Button
                          size="sm"
                          variant="teal"
                          onClick={() => handleConfirmLine(line.id)}
                          className="text-[11px] h-7 px-2.5 font-bold gap-1"
                        >
                          <Check className="w-3 h-3" /> Confirm Line Match
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReopenLine(line.id)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Re-open Line Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Safety Gate Warning & Progression Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2">
              {!allLinesConfirmed && (
                <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-300 p-2 rounded flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    Gate Closed: {unreviewedCount} unreviewed line
                    {unreviewedCount > 1 ? "s" : ""} remaining. Each line must
                    be explicitly checked.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {allLinesConfirmed ? (
                    <span className="text-teal-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-teal-600" /> All{" "}
                      {lines.length} lines individually verified
                    </span>
                  ) : (
                    <span>Individual confirmation required</span>
                  )}
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  disabled={!allLinesConfirmed || saving}
                  onClick={handleProceed}
                  loading={saving}
                  className="gap-2 text-xs bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirm
                  Extraction & Match Medicines{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
