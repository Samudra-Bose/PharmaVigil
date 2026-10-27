"use client";

import React from "react";
import type { OcrProgressState } from "@/lib/ocr/types";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OcrProgressBarProps {
  progressState: OcrProgressState;
  onCancel?: () => void;
}

export const OcrProgressBar: React.FC<OcrProgressBarProps> = ({
  progressState,
  onCancel,
}) => {
  const { status, progress, phase, error } = progressState;
  const percentage = Math.round(Math.min(1.0, Math.max(0, progress)) * 100);

  if (phase === "IDLE" || phase === "COMPLETE") {
    return null;
  }

  return (
    <div
      data-testid="ocr-progress-container"
      className="p-4 rounded-lg border border-teal-200 bg-teal-50/70 shadow-sm space-y-3 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Loader2 className="w-4 h-4 text-teal-700 animate-spin shrink-0" />
          <span className="text-xs font-semibold text-teal-900 truncate">
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-teal-800">
            {percentage}%
          </span>
          {onCancel && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="h-6 px-1.5 text-xs text-slate-500 hover:text-rose-700 hover:bg-rose-50"
              title="Cancel OCR"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-teal-200/60 rounded-full h-2 overflow-hidden">
        <div
          data-testid="ocr-progress-fill"
          className="bg-teal-600 h-2 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {error && (
        <div className="text-[11px] text-rose-700 font-medium">{error}</div>
      )}
    </div>
  );
};
