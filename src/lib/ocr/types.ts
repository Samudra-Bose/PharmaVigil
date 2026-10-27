/**
 * Types & Contracts for Clinical OCR Engine & Prescription Parsing
 */

export type OcrPhase =
  | "IDLE"
  | "INITIALIZING"
  | "LOADING_MODEL"
  | "RECOGNIZING"
  | "PARSING"
  | "COMPLETE"
  | "ERROR";

export interface OcrProgressState {
  status: string;
  progress: number; // 0.0 to 1.0
  phase: OcrPhase;
  error?: string;
}

export interface OcrWordDetail {
  text: string;
  confidence: number;
  bbox?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OcrResult {
  rawText: string;
  confidence: number; // 0 to 100
  words: OcrWordDetail[];
  processingTimeMs: number;
}

export type ClinicalDosageForm =
  | "TABLET"
  | "CAPSULE"
  | "SYRUP"
  | "INJECTION"
  | "OINTMENT"
  | "DROPS"
  | "OTHER";

export interface ParsedClinicalItem {
  id: string;
  rawExtractedText: string;
  brandText?: string;
  strengthValue?: number;
  strengthUnit?: string;
  dosageForm?: ClinicalDosageForm;
  doseValue?: number;
  doseUnit?: string;
  route?: string;
  frequency?: string;
  durationValue?: number;
  durationUnit?: string;
  confidence: number; // 0.0 to 1.0
  matchStatus: "CONFIRMED" | "AMBIGUOUS" | "UNSUPPORTED" | "UNRESOLVED";
}

export interface CameraDeviceOption {
  deviceId: string;
  label: string;
  facing: "environment" | "user" | "unknown";
}
