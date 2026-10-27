"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Kbd } from "@/components/ui/Kbd";
import { 
  Camera, 
  Upload, 
  FileText, 
  ZoomIn, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Image as ImageIcon 
} from "lucide-react";

function CapturePrescriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "P-9021";

  const [mode, setMode] = useState<string>("IMAGE");
  const [sampleLoaded, setSampleLoaded] = useState(true);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [manualText, setManualText] = useState(
    "Rx: Rajan Sharma (P-9021)\nTab. Warfarin 5mg - 1 Tab OD x 30 days\nTab. Aspirin 100mg - 1 Tab OD x 15 days\nDr. Arvind Patel, MD (Reg #MED-4091)"
  );
  const [submitting, setSubmitting] = useState(false);

  const handleCreateCapture = async () => {
    setSubmitting(true);
    try {
      const rawText = mode === "IMAGE"
        ? "Rx: Rajan Sharma (P-9021)\nTab. Warfarin 5mg - 1 Tab OD x 30 days\nTab. Aspirin 100mg - 1 Tab OD x 15 days\nDr. Arvind Patel, MD"
        : manualText;

      const created = await api.createCapture(patientId, rawText);
      router.push(`/pharmacist/cases/${created.id}/extract`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PipelineStepper currentStep={2} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-slate-700" />
            Prescription Capture & Image Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Linked to Confirmed Patient: <span className="font-mono font-bold text-slate-800 font-tabular">{patientId}</span> (Rajan Sharma)
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="IMAGE" className="gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Camera / Scan Ingestion
            </TabsTrigger>
            <TabsTrigger value="MANUAL" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Manual Text Fallback
            </TabsTrigger>
          </TabsList>

          {mode === "IMAGE" && (
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
              <span>Zoom hotkey:</span> <Kbd>Click to inspect</Kbd>
            </div>
          )}
        </div>

        <TabsContent value="IMAGE" className="space-y-4 m-0">
          {/* Quick Demo Prescription Loader */}
          <div className="p-3 bg-slate-100 rounded-md border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-800">
                Seeded Synthetic Prescription Fixture (Warfarin + Aspirin DDI Demo):
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSampleLoaded(true)}
              className="text-xs gap-1.5 h-7"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Re-load Seeded Sample
            </Button>
          </div>

          {/* Image Canvas / Viewfinder with Click-to-Zoom */}
          <Card className="overflow-hidden shadow-2xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Scanned Prescription Image Preview</span>
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-600" /> Click to Zoom <Kbd>ESC</Kbd>
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center bg-slate-900/5 min-h-[300px]">
              {sampleLoaded ? (
                <div
                  onClick={() => setZoomOpen(true)}
                  className="max-w-md w-full bg-white p-6 rounded-md border border-slate-300 shadow-md font-mono text-xs space-y-3 cursor-zoom-in hover:border-slate-400 hover:shadow-lg transition-all select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setZoomOpen(true);
                  }}
                  aria-label="Click to enlarge prescription image"
                >
                  <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-slate-500 text-[10px]">
                    <span className="font-bold text-slate-800">METRO GENERAL HOSPITAL • OUTPATIENT Rx</span>
                    <span className="font-tabular">2026-10-27</span>
                  </div>
                  <div className="text-slate-900 font-semibold text-sm">
                    Patient: Rajan Sharma (P-9021) • Age: 58 • M
                  </div>
                  <div className="space-y-2 py-2 border-y border-dashed border-slate-200 text-slate-800">
                    <div>1. Tab. Warfarin 5mg — 1 Tab OD at night x 30 days</div>
                    <div>2. Tab. Aspirin 100mg — 1 Tab OD with breakfast x 15 days</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 pt-1">
                    Dr. Arvind Patel, MD (Cardiology)
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-2">
                  <Upload className="w-8 h-8 mx-auto" />
                  <p className="text-xs">Drag and drop prescription scan or connect physical webcam</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="MANUAL" className="space-y-3 m-0">
          <Card className="p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <FileText className="w-4 h-4 text-slate-600" />
              Manual Prescription Transcription
            </div>
            <p className="text-xs text-slate-500">
              Use this fallback when camera OCR is illegible or camera hardware is unavailable.
            </p>
            <Textarea
              rows={6}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste raw prescription text here..."
              className="font-mono"
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accessible Radix Click-to-Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>High-Resolution Prescription Zoom</DialogTitle>
            <DialogDescription>
              Verify raw scan details, handwritten dosage notations, and doctor signatures.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-white p-6 rounded border border-slate-300 font-mono text-sm space-y-4 leading-relaxed text-slate-900 shadow-xs">
            <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-slate-500 text-xs">
              <span className="font-bold text-slate-900">METRO GENERAL HOSPITAL • OUTPATIENT DEPARTMENT</span>
              <span className="font-tabular">Date: 2026-10-27</span>
            </div>
            <div className="font-bold text-base text-slate-900">
              Patient: Rajan Sharma (P-9021) • Age: 58 • Gender: Male
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-slate-900 text-xs">
              <div className="font-bold text-slate-900 uppercase">PRESCRIPTION ITEMS:</div>
              <div>1. <span className="font-bold">Tab. Warfarin 5mg</span> — 1 Tab OD (At Night) x 30 days</div>
              <div>2. <span className="font-bold">Tab. Aspirin 100mg</span> — 1 Tab OD (Morning with food) x 15 days</div>
            </div>
            <div className="pt-2 text-right text-xs text-slate-600">
              Attending Physician: <span className="font-bold text-slate-900">Dr. Arvind Patel, MD</span> (Reg: MED-4091)
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="primary"
          onClick={handleCreateCapture}
          loading={submitting}
          className="gap-2 text-xs"
        >
          Save Capture & Review OCR Extraction <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CapturePrescriptionPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-8"><Skeleton className="h-64 w-full" /></div>}>
      <CapturePrescriptionContent />
    </Suspense>
  );
}
