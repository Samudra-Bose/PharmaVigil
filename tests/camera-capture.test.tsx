import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OcrProgressBar } from "../src/components/clinical/OcrProgressBar";
import { CameraCaptureModal } from "../src/components/clinical/CameraCaptureModal";
import type { OcrProgressState } from "../src/lib/ocr/types";

describe("Camera Capture & OCR Progress Components", () => {
  it("TEST-OCR-PROG-001: Renders progress bar when phase is active", () => {
    const progressState: OcrProgressState = {
      status: "Scanning & Recognizing Prescription (65%)...",
      progress: 0.65,
      phase: "RECOGNIZING",
    };

    render(<OcrProgressBar progressState={progressState} />);

    expect(screen.getByTestId("ocr-progress-container")).toBeInTheDocument();
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("Scanning & Recognizing Prescription (65%)...")).toBeInTheDocument();
    
    const fill = screen.getByTestId("ocr-progress-fill");
    expect(fill).toHaveStyle({ width: "65%" });
  });

  it("TEST-OCR-PROG-002: Does not render when phase is IDLE or COMPLETE", () => {
    const idleState: OcrProgressState = {
      status: "Ready",
      progress: 0,
      phase: "IDLE",
    };
    const { rerender } = render(<OcrProgressBar progressState={idleState} />);
    expect(screen.queryByTestId("ocr-progress-container")).not.toBeInTheDocument();

    const completeState: OcrProgressState = {
      status: "Extraction Complete",
      progress: 1.0,
      phase: "COMPLETE",
    };
    rerender(<OcrProgressBar progressState={completeState} />);
    expect(screen.queryByTestId("ocr-progress-container")).not.toBeInTheDocument();
  });

  it("TEST-OCR-PROG-003: Invokes onCancel callback when Cancel button is clicked", () => {
    const onCancel = vi.fn();
    const progressState: OcrProgressState = {
      status: "Recognizing...",
      progress: 0.4,
      phase: "RECOGNIZING",
    };

    render(<OcrProgressBar progressState={progressState} onCancel={onCancel} />);

    const cancelBtn = screen.getByTitle("Cancel OCR");
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("TEST-CAM-001: Does not render CameraCaptureModal when isOpen is false", () => {
    const onClose = vi.fn();
    const onCapture = vi.fn();

    render(<CameraCaptureModal isOpen={false} onClose={onClose} onCapture={onCapture} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("TEST-CAM-002: Renders modal and handles close action", () => {
    const onClose = vi.fn();
    const onCapture = vi.fn();

    render(<CameraCaptureModal isOpen={true} onClose={onClose} onCapture={onCapture} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Live Prescription Scanner")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Close scanner");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
