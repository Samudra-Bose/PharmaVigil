"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";
import { PipelineStepper } from "@/components/clinical/PipelineStepper";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { CameraCaptureModal } from "@/components/clinical/CameraCaptureModal";
import { OcrProgressBar } from "@/components/clinical/OcrProgressBar";
import { preprocessImageForOcr } from "@/lib/ocr/image-preprocessor";
import {
  recognizePrescriptionImage,
  terminateOcrWorker,
} from "@/lib/ocr/tesseract-worker";
import { parsePrescriptionText } from "@/lib/ocr/prescription-parser";
import type { OcrProgressState, ParsedClinicalItem } from "@/lib/ocr/types";
import {
  Camera,
  Upload,
  FileText,
  RotateCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  ZoomIn,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

function CapturePrescriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "PAT-DEMO-001";

  // Tab mode: IMAGE vs MANUAL
  const [mode, setMode] = useState<string>("IMAGE");

  // Camera modal state
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  // Image & Canvas state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // OCR state
  const [ocrProgress, setOcrProgress] = useState<OcrProgressState>({
    status: "Ready",
    progress: 0,
    phase: "IDLE",
  });
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [parsedItems, setParsedItems] = useState<ParsedClinicalItem[]>([]);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Manual fallback state
  const [manualText, setManualText] = useState(
    "Tab. Warfarin 5mg - 1 Tab OD at night x 30 days\nTab. Aspirin 75mg - 1 Tab OD with food x 15 days",
  );
  const [submitting, setSubmitting] = useState(false);

  // Clean up OCR worker on page unmount
  useEffect(() => {
    return () => {
      terminateOcrWorker();
    };
  }, []);

  // Update preview canvas whenever imageUri or rotation changes
  useEffect(() => {
    let isCancelled = false;

    async function updatePreview() {
      if (!imageUri || !previewCanvasRef.current) return;
      try {
        const processed = await preprocessImageForOcr(imageUri, {
          rotationDegrees: rotationAngle,
          enhanceContrast: true,
          grayscale: true,
          maxDimension: 1200,
        });

        if (isCancelled || !previewCanvasRef.current) return;
        const targetCanvas = previewCanvasRef.current;
        targetCanvas.width = processed.width;
        targetCanvas.height = processed.height;
        const ctx = targetCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(processed, 0, 0);
        }
      } catch (err) {
        console.warn("Failed to render preview canvas:", err);
      }
    }

    updatePreview();
    return () => {
      isCancelled = true;
    };
  }, [imageUri, rotationAngle]);

  // Handle image capture from WebRTC Camera modal
  const handleCameraCapture = (capturedUri: string) => {
    setImageUri(capturedUri);
    setRotationAngle(0);
    setRecognizedText("");
    setParsedItems([]);
    setOcrWarning(null);
    clinicalToast.info(
      "Frame Captured",
      "Prescription ready for OCR extraction",
    );
  };

  // Handle image file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        clinicalToast.error(
          "File size exceeds 15MB limit. Please upload a smaller image.",
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUri(event.target.result as string);
          setRotationAngle(0);
          setRecognizedText("");
          setParsedItems([]);
          setOcrWarning(null);
          clinicalToast.info("Image Loaded", `Loaded ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Rotate image by 90 degrees clockwise
  const handleRotate90 = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  // Cancel OCR execution
  const handleCancelOcr = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessingOcr(false);
    setOcrProgress({
      status: "OCR Cancelled by user",
      progress: 0,
      phase: "IDLE",
    });
  };

  // Run live Tesseract OCR on current preprocessed image
  const handleRunOcr = async () => {
    if (!imageUri) {
      clinicalToast.error("Please take a photo or select an image first");
      return;
    }

    setIsProcessingOcr(true);
    setOcrWarning(null);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Preprocess image
      const processedCanvas = await preprocessImageForOcr(imageUri, {
        rotationDegrees: rotationAngle,
        enhanceContrast: true,
        grayscale: true,
        maxDimension: 1800,
      });

      // 2. Execute Tesseract OCR in Web Worker
      const result = await recognizePrescriptionImage(
        processedCanvas,
        (progress) => setOcrProgress(progress),
        controller.signal,
      );

      setRecognizedText(result.rawText);
      setOcrConfidence(result.confidence);

      // 3. Parse recognized text into structured prescription items
      const items = parsePrescriptionText(result.rawText, result.words);
      setParsedItems(items);

      if (result.confidence < 45 || items.length === 0) {
        setOcrWarning(
          "Low recognition confidence or blurry image detected. Verify image orientation, try rotating 90°, or use Manual Transcription.",
        );
      } else {
        clinicalToast.success(
          "Extraction Complete",
          `Recognized ${items.length} prescription medication item(s) (${result.confidence}% confidence)`,
        );
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        clinicalToast.info("OCR Cancelled", "Scan processing aborted");
      } else {
        clinicalToast.error(err, "OCR Recognition Failed");
        setOcrWarning(
          "OCR failed to process the image. Please retry or enter items manually.",
        );
      }
    } finally {
      setIsProcessingOcr(false);
      abortControllerRef.current = null;
    }
  };

  // Save Capture and ingest into backend API
  const handleSaveAndProceed = async () => {
    setSubmitting(true);
    try {
      const isImageMode = mode === "IMAGE";
      const rawText = isImageMode ? recognizedText : manualText;
      const itemsToIngest = isImageMode
        ? parsedItems
        : parsePrescriptionText(manualText);

      // 1. Create Capture record on backend
      const created = await api.createCapture(
        patientId,
        rawText,
        isImageMode ? "BROWSER_OCR" : "MANUAL_ENTRY",
      );

      // 2. Ingest structured items if items were parsed
      if (itemsToIngest.length > 0) {
        try {
          await api.updateExtraction(created.id, {
            extractedText: rawText,
            items: itemsToIngest.map((item) => ({
              rawExtractedText: item.rawExtractedText,
              brandText: item.brandText || null,
              strengthValue: item.strengthValue || null,
              strengthUnit: item.strengthUnit || null,
              dosageForm: item.dosageForm || null,
              doseValue: item.doseValue || 1,
              doseUnit: item.doseUnit || "unit",
              route: item.route || "ORAL",
              frequency: item.frequency || "OD",
              durationValue: item.durationValue || 7,
              durationUnit: item.durationUnit || "days",
              matchStatus: "UNRESOLVED",
              matchConfidence: item.confidence,
              canonicalIngredientIds: [],
            })),
          });
        } catch (updateErr) {
          console.warn("Capture item update non-fatal error:", updateErr);
        }
      }

      clinicalToast.success(
        "Capture Ingested",
        `Created clinical intake record #${created.id.slice(0, 8)}`,
      );

      router.push(`/pharmacist/cases/${created.id}/extract`);
    } catch (err: any) {
      clinicalToast.error(err, "Failed to save prescription capture");
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
            <Camera className="w-5 h-5 text-teal-700" />
            Live Prescription Capture & OCR Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Patient ID:{" "}
            <span className="font-mono font-bold text-slate-800 font-tabular">
              {patientId}
            </span>{" "}
            (Donna Noble)
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={mode} onValueChange={setMode} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger
              value="IMAGE"
              className="gap-1.5 text-xs font-semibold"
            >
              <Camera className="w-3.5 h-3.5" /> Camera / Document Scan
            </TabsTrigger>
            <TabsTrigger
              value="MANUAL"
              className="gap-1.5 text-xs font-semibold"
            >
              <FileText className="w-3.5 h-3.5" /> Manual Text Fallback
            </TabsTrigger>
          </TabsList>
        </div>

        {/* IMAGE MODE CONTENT */}
        <TabsContent value="IMAGE" className="space-y-4 m-0">
          {/* Action Trigger Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCameraModalOpen(true)}
              className="p-4 rounded-lg border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-teal-950">
                  Open Camera Scanner
                </div>
                <div className="text-[11px] text-teal-700 mt-0.5">
                  Live WebRTC stream with prescription alignment guide
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 transition-all flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Upload Scan / File
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Select PNG, JPG, or WEBP image from device
                </div>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* OCR Progress Bar */}
          <OcrProgressBar
            progressState={ocrProgress}
            onCancel={handleCancelOcr}
          />

          {/* Warning / Error Recovery Banner */}
          {ocrWarning && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="leading-relaxed font-medium">{ocrWarning}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRotate90}
                    className="h-6 text-[11px] gap-1"
                  >
                    <RotateCw className="w-3 h-3" /> Rotate 90°
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCameraModalOpen(true)}
                    className="h-6 text-[11px] gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retake Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setManualText(recognizedText || manualText);
                      setMode("MANUAL");
                    }}
                    className="h-6 text-[11px] gap-1"
                  >
                    <FileText className="w-3 h-3" /> Switch to Manual Entry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Canvas Preview & Pre-Processing Card */}
          {imageUri ? (
            <Card className="overflow-hidden shadow-sm border-slate-200">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">
                    Active Prescription Frame
                  </span>
                  {ocrConfidence !== null && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      OCR Confidence: {ocrConfidence}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRotate90}
                    className="h-7 text-xs gap-1"
                    title="Rotate 90 degrees clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={isProcessingOcr}
                    loading={isProcessingOcr}
                    onClick={handleRunOcr}
                    className="h-7 text-xs gap-1.5 bg-teal-600 hover:bg-teal-500 text-white"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Run OCR Extraction
                  </Button>
                </div>
              </div>

              <div className="p-4 flex flex-col items-center justify-center bg-slate-900/5 min-h-[260px] overflow-auto">
                <canvas
                  ref={previewCanvasRef}
                  className="max-h-[380px] max-w-full rounded border border-slate-300 shadow-sm object-contain"
                />
              </div>

              {/* Extracted Structured Items Preview */}
              {parsedItems.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Extracted Prescription Items ({parsedItems.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Attestation required in next step
                    </span>
                  </div>

                  <div className="space-y-2">
                    {parsedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">
                              {item.brandText}
                              {item.strengthValue && (
                                <span className="ml-1 text-slate-600 font-normal">
                                  {item.strengthValue} {item.strengthUnit}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.dosageForm} • {item.frequency} •{" "}
                              {item.route} • {item.durationValue}{" "}
                              {item.durationUnit}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700">
                          {Math.round(item.confidence * 100)}% conf
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            /* Empty State Prompt */
            <div className="p-8 text-center rounded-lg border-2 border-dashed border-slate-200 bg-white space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  No Prescription Scan Loaded
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click <strong>Open Camera Scanner</strong> to take a photo of
                  the patient's prescription or upload an existing scan.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* MANUAL FALLBACK CONTENT */}
        <TabsContent value="MANUAL" className="space-y-3 m-0">
          <Card className="p-5 shadow-sm space-y-3 border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <FileText className="w-4 h-4 text-slate-600" />
              Manual Prescription Transcription
            </div>
            <p className="text-xs text-slate-500">
              Paste or type prescription lines directly. The parser will
              automatically extract dosages, frequencies, and formulations.
            </p>
            <Textarea
              rows={6}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g. Tab. Amoxicillin 500mg - 1 Tab TID x 7 days..."
              className="font-mono text-xs"
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live WebRTC Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
        <div className="text-[11px] text-slate-400">
          PRD Invariant: OCR output is an untrusted suggestion until pharmacist
          review.
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={handleSaveAndProceed}
          loading={submitting}
          disabled={
            submitting || (mode === "IMAGE" && !imageUri && !recognizedText)
          }
          className="gap-2 text-xs bg-slate-900 hover:bg-slate-800 text-white"
        >
          Proceed to Extraction Review <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CapturePrescriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-8">
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CapturePrescriptionContent />
    </Suspense>
  );
}
