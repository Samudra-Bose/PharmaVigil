import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AlertCardSkeleton,
  CossMetricStripSkeleton,
  PatientIdentityCardSkeleton,
  PipelineStepperSkeleton,
  PrescriptionTableSkeleton,
  ExtractionEditorSkeleton,
} from "@/components/skeletons";

describe("Component-Exact Loading Skeletons Suite", () => {
  it("renders AlertCardSkeleton with status role and clinical structure", () => {
    const { container } = render(<AlertCardSkeleton className="custom-alert-skel" />);
    const statusElem = screen.getByRole("status");
    expect(statusElem).toBeInTheDocument();
    expect(statusElem).toHaveAttribute("aria-label", "Loading clinical alert...");
    expect(container.querySelector(".custom-alert-skel")).toBeInTheDocument();
    // Verify pulse elements present
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(5);
  });

  it("renders CossMetricStripSkeleton with default 4 columns and custom columnCount", () => {
    const { container, rerender } = render(<CossMetricStripSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading operational metrics...");
    // 4 columns by default
    const defaultCols = container.querySelectorAll(".min-h-\\[72px\\]");
    expect(defaultCols.length).toBe(4);

    // Custom 6 columns
    rerender(<CossMetricStripSkeleton columnCount={6} />);
    const customCols = container.querySelectorAll(".min-h-\\[72px\\]");
    expect(customCols.length).toBe(6);
  });

  it("renders PatientIdentityCardSkeleton with avatar, tags, and allergy/med rails", () => {
    const { container } = render(<PatientIdentityCardSkeleton className="custom-patient-skel" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading patient identity...");
    expect(container.querySelector(".custom-patient-skel")).toBeInTheDocument();
    // Check avatar pulse placeholder
    expect(container.querySelector(".w-8.h-8.rounded-full")).toBeInTheDocument();
    // Check grid layout (allergies & meds)
    expect(container.querySelector(".grid.grid-cols-1.md\\:grid-cols-2")).toBeInTheDocument();
  });

  it("renders PipelineStepperSkeleton with 5 step indicators and track separators", () => {
    const { container } = render(<PipelineStepperSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading clinical workflow steps...");
    // 5 step node circles
    const stepCircles = container.querySelectorAll(".w-7.h-7.rounded-full");
    expect(stepCircles.length).toBe(5);
    // 4 track connectors
    const connectors = container.querySelectorAll(".h-0\\.5.mx-3");
    expect(connectors.length).toBe(4);
  });

  it("renders PrescriptionTableSkeleton with custom row counts and header placeholder", () => {
    const { container, rerender } = render(<PrescriptionTableSkeleton rowCount={3} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading prescription records...");
    const rows = container.querySelectorAll(".px-4.py-3\\.5");
    expect(rows.length).toBe(3);

    // Re-render with 7 rows
    rerender(<PrescriptionTableSkeleton rowCount={7} />);
    const updatedRows = container.querySelectorAll(".px-4.py-3\\.5");
    expect(updatedRows.length).toBe(7);
  });

  it("renders ExtractionEditorSkeleton with 2-pane scan and line editor layout", () => {
    const { container } = render(<ExtractionEditorSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading prescription extraction editor...");
    // 2 top-level panels
    const panels = container.querySelectorAll(".bg-white.rounded-lg.border.border-slate-200.overflow-hidden");
    expect(panels.length).toBe(2);
  });
});
