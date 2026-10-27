/**
 * Tesseract.js Web Worker Orchestrator
 * Executes optical character recognition client-side inside a browser Web Worker,
 * preserving clinical privacy and keeping the main UI thread at 60fps.
 */

import { createWorker, type Worker } from "tesseract.js";
import type { OcrProgressState, OcrResult, OcrWordDetail } from "./types";

let activeWorker: Worker | null = null;
let currentLanguage = "eng";

/**
 * Initializes or reuses the Tesseract Web Worker
 */
export async function getOrInitWorker(
  lang: string = "eng",
  onProgress?: (progress: OcrProgressState) => void,
): Promise<Worker> {
  if (activeWorker && currentLanguage === lang) {
    return activeWorker;
  }

  if (activeWorker) {
    await activeWorker.terminate();
    activeWorker = null;
  }

  onProgress?.({
    status: "Initializing Tesseract Web Worker...",
    progress: 0.05,
    phase: "INITIALIZING",
  });

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === "loading tesseract core") {
        onProgress?.({
          status: "Loading OCR Core Engine...",
          progress: 0.15,
          phase: "INITIALIZING",
        });
      } else if (m.status === "loading language traineddata") {
        onProgress?.({
          status: "Loading Medical Lexicon Trained Data...",
          progress: 0.35,
          phase: "LOADING_MODEL",
        });
      } else if (m.status === "recognizing text") {
        const pct = Math.round((m.progress || 0) * 100);
        // Map 0..1 recognition to 0.40..0.95 overall progress
        const overall = 0.4 + (m.progress || 0) * 0.55;
        onProgress?.({
          status: `Scanning & Recognizing Prescription (${pct}%)...`,
          progress: Math.min(0.95, overall),
          phase: "RECOGNIZING",
        });
      }
    },
  });

  activeWorker = worker;
  currentLanguage = lang;
  return worker;
}

/**
 * Runs optical character recognition on an image canvas, file, or data URI
 */
export async function recognizePrescriptionImage(
  imageSource: string | HTMLCanvasElement | File | Blob,
  onProgress?: (progress: OcrProgressState) => void,
  abortSignal?: AbortSignal,
): Promise<OcrResult> {
  const startTime = Date.now();

  try {
    const worker = await getOrInitWorker("eng", onProgress);

    if (abortSignal?.aborted) {
      throw new DOMException(
        "OCR process was cancelled by the user",
        "AbortError",
      );
    }

    onProgress?.({
      status: "Processing image pixel matrix...",
      progress: 0.4,
      phase: "RECOGNIZING",
    });

    const { data } = await worker.recognize(imageSource as any);

    if (abortSignal?.aborted) {
      throw new DOMException(
        "OCR process was cancelled by the user",
        "AbortError",
      );
    }

    onProgress?.({
      status: "Formatting recognized text...",
      progress: 0.98,
      phase: "PARSING",
    });

    const rawWords: any[] =
      (data as any).words ||
      (data.blocks
        ? data.blocks.flatMap((b) =>
            b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words)),
          )
        : []);

    const words: OcrWordDetail[] = rawWords.map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox
        ? {
            x0: w.bbox.x0,
            y0: w.bbox.y0,
            x1: w.bbox.x1,
            y1: w.bbox.y1,
          }
        : undefined,
    }));

    const result: OcrResult = {
      rawText: data.text || "",
      confidence: Math.round(data.confidence || 0),
      words,
      processingTimeMs: Date.now() - startTime,
    };

    onProgress?.({
      status: "Extraction complete!",
      progress: 1.0,
      phase: "COMPLETE",
    });

    return result;
  } catch (err: any) {
    if (err.name === "AbortError") {
      onProgress?.({
        status: "OCR Cancelled",
        progress: 0,
        phase: "IDLE",
      });
      throw err;
    }

    const message = err?.message || "Optical character recognition failed";
    onProgress?.({
      status: `Error: ${message}`,
      progress: 0,
      phase: "ERROR",
      error: message,
    });
    throw err;
  }
}

/**
 * Cleanly terminates the background Tesseract Web Worker to release memory
 */
export async function terminateOcrWorker(): Promise<void> {
  if (activeWorker) {
    try {
      await activeWorker.terminate();
    } catch {
      // Ignore cleanup error
    } finally {
      activeWorker = null;
    }
  }
}
