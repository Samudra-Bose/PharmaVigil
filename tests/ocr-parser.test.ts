import { describe, it, expect } from "vitest";
import { parsePrescriptionText } from "../src/lib/ocr/prescription-parser";

describe("Clinical Prescription Parser Suite", () => {
  it("TEST-PARSE-001: Correctly parses standard printed prescription line with Tab form, strength, and frequency", () => {
    const rawText = "Tab. Amoxicillin 500mg - 1 Tab TID x 7 days";
    const items = parsePrescriptionText(rawText);

    expect(items.length).toBe(1);
    const item = items[0];
    expect(item.brandText?.toLowerCase()).toContain("amoxicillin");
    expect(item.dosageForm).toBe("TABLET");
    expect(item.strengthValue).toBe(500);
    expect(item.strengthUnit).toBe("mg");
    expect(item.frequency).toBe("TID");
    expect(item.durationValue).toBe(7);
    expect(item.durationUnit).toBe("days");
    expect(item.matchStatus).toBe("UNRESOLVED");
    expect(item.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it("TEST-PARSE-002: Correctly parses combination drug and Latin frequency abbreviations", () => {
    const rawText = `
Rx: Donna Noble (PAT-DEMO-001)
Tab. Augmentin 625mg - 1 Tab BD x 5 days
Cap. Ramipril 2.5mg - 1 Cap OD x 30 days
Dr. Clara Oswald, MD (Reg #4091)
`;
    const items = parsePrescriptionText(rawText);

    expect(items.length).toBe(2);

    // Item 1: Augmentin
    expect(items[0].brandText?.toLowerCase()).toContain("augmentin");
    expect(items[0].dosageForm).toBe("TABLET");
    expect(items[0].strengthValue).toBe(625);
    expect(items[0].frequency).toBe("BD");
    expect(items[0].durationValue).toBe(5);

    // Item 2: Ramipril
    expect(items[1].brandText?.toLowerCase()).toContain("ramipril");
    expect(items[1].dosageForm).toBe("CAPSULE");
    expect(items[1].strengthValue).toBe(2.5);
    expect(items[1].frequency).toBe("OD");
    expect(items[1].durationValue).toBe(30);
  });

  it("TEST-PARSE-003: Ignores clinic/doctor header lines when no medication directive exists", () => {
    const rawText = `
VentureForge Demo General Hospital
Department of Internal Medicine
Dr. Arthur Pendelton, MD
Date: 2026-10-28
Patient: Donna Noble
Tab. Spironolactone 25mg - 1 Tab OD x 15 days
`;
    const items = parsePrescriptionText(rawText);

    expect(items.length).toBe(1);
    expect(items[0].brandText?.toLowerCase()).toContain("spironolactone");
    expect(items[0].strengthValue).toBe(25);
  });

  it("TEST-PARSE-004: Gracefully handles multiline input with syrup and injection forms", () => {
    const rawText = `
Syr. Paracetamol 250mg/5ml - 5ml TDS x 3 days
Inj. Ceftriaxone 1g - IV STAT
`;
    const items = parsePrescriptionText(rawText);

    expect(items.length).toBe(2);
    expect(items[0].dosageForm).toBe("SYRUP");
    expect(items[0].frequency).toBe("TID"); // TDS normalized to TID

    expect(items[1].dosageForm).toBe("INJECTION");
    expect(items[1].strengthValue).toBe(1);
    expect(items[1].strengthUnit).toBe("g");
    expect(items[1].route).toBe("IV");
  });

  it("TEST-PARSE-005: Returns empty array on empty or whitespace-only text", () => {
    expect(parsePrescriptionText("")).toEqual([]);
    expect(parsePrescriptionText("   \n\n  \t  ")).toEqual([]);
  });

  it("TEST-PARSE-006: Falls back to raw draft items if no standard clinical tokens match", () => {
    const rawText = "NonStandardMedicationName\nAnotherUnformattedCompound";
    const items = parsePrescriptionText(rawText);
    expect(items.length).toBe(2);
    expect(items[0].brandText).toBe("NonStandardMedicationName");
    expect(items[0].matchStatus).toBe("UNRESOLVED");
    expect(items[0].confidence).toBe(0.5);
  });
});
