"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { Kbd } from "@/components/ui/Kbd";
import { 
  FileText, 
  ZoomIn, 
  AlertTriangle, 
  Check, 
  ArrowRight,
  Plus,
  Trash2,
  ScanText
} from "lucide-react";

export default function OcrExtractPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState<Array<{ id: number; text: string; confidence: number }>>([
    { id: 1, text: "Tab. Warfarin 5mg - 1 Tab OD x 30 days", confidence: 0.96 },
    { id: 2, text: "Tab. Aspirin 100mg - 1 Tab OD x 15 days", confidence: 0.94 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const data = await api.getCase(caseId);
        setCaseData(data);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  const handleUpdateLine = (id: number, text: string) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, text } : l)));
  };

  const handleAddLine = () => {
    const nextId = lines.length ? Math.max(...lines.map((l) => l.id)) + 1 : 1;
    setLines([...lines, { id: nextId, text: "", confidence: 1.0 }]);
  };

  const handleRemoveLine = (id: number) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleProceed = async () => {
    setSaving(true);
    try {
      await api.updateExtractedText(caseId, lines);
      router.push(`/pharmacist/cases/${caseId}/medicines`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PipelineStepper currentStep={2} />

      {/* Untrusted OCR Warning Alert */}
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold text-amber-950 flex items-center gap-2">
          <span>Clinical Safety Protocol (REQ-SAFE-001): Untrusted OCR Review</span>
        </AlertTitle>
        <AlertDescription className="text-amber-900 mt-1">
          Optical character recognition outputs are classified as untrusted drafts. The pharmacist must cross-verify each extracted line
          against the prescription scan on the left and correct any misrecognized drug names, dosages, or frequencies before medicine reconciliation.
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane: Scan Image Preview */}
          <Card className="flex flex-col shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold">Prescription Source Scan</span>
              <span className="font-mono text-[11px] text-slate-500 font-tabular">Case: {caseId}</span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center items-center bg-slate-900/5 min-h-[350px]">
              <div className="w-full bg-white p-6 rounded border border-slate-300 shadow-xs font-mono text-xs space-y-3 leading-relaxed">
                <div className="border-b border-slate-200 pb-2 text-[10px] text-slate-500 flex justify-between font-tabular">
                  <span className="font-bold text-slate-800">METRO GENERAL HOSPITAL • OUTPATIENT Rx</span>
                  <span>2026-10-27</span>
                </div>
                <div className="text-slate-900 font-bold text-sm">
                  Patient: Rajan Sharma (P-9021)
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">1.</span> Tab. Warfarin 5mg — 1 Tab OD x 30 days
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">2.</span> Tab. Aspirin 100mg — 1 Tab OD x 15 days
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 pt-1">
                  Dr. Arvind Patel, MD (Reg #MED-4091)
                </div>
              </div>
            </div>
          </Card>

          {/* Right Pane: OCR Text Extraction Editor */}
          <Card className="flex flex-col shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold flex items-center gap-1.5">
                <ScanText className="w-3.5 h-3.5 text-slate-500" />
                Extracted Text Blocks ({lines.length} lines)
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-slate-900 hover:text-slate-700 font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[450px]">
              {lines.map((line, idx) => (
                <div key={line.id} className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Line {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <ClinicalTooltip
                        term={`${Math.round(line.confidence * 100)}% Confidence`}
                        explanation="Optical model confidence for raw character pattern recognition. Does not indicate clinical validity."
                      >
                        <Badge variant={line.confidence >= 0.9 ? "info" : "moderate"} className="text-[10px] py-0 font-tabular">
                          {Math.round(line.confidence * 100)}%
                        </Badge>
                      </ClinicalTooltip>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title="Remove line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <Input
                    value={line.text}
                    onChange={(e) => handleUpdateLine(line.id, e.target.value)}
                    className="font-mono text-xs bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                size="sm"
                variant="primary"
                onClick={handleProceed}
                loading={saving}
                className="gap-2 text-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirm Extraction & Match Medicines <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
