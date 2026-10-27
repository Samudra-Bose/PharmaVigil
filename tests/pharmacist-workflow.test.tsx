import { describe, it, expect, beforeEach } from "vitest";
import { api } from "@/lib/api-client";
import { INITIAL_PRESCRIPTION_ITEMS } from "@/lib/mock-data/fixtures";

describe("Pharmacist Critical Clinical Workflow", () => {
  beforeEach(async () => {
    await api.resetDemoWorkspace();
  });

  it("TEST-PHARM-PAT-001: Multi-patient lookup returns matching synthetic records", async () => {
    // Lookup by ID
    const results9021 = await api.searchPatients("P-9021");
    expect(results9021.length).toBe(1);
    expect(results9021[0].displayName).toBe("Rajan Sharma");

    const results9022 = await api.searchPatients("P-9022");
    expect(results9022.length).toBe(1);
    expect(results9022[0].displayName).toBe("Sunita Verma");

    const results9023 = await api.searchPatients("P-9023");
    expect(results9023.length).toBe(1);
    expect(results9023[0].displayName).toBe("Amit Kumar");

    // Lookup by Name
    const resultsSunita = await api.searchPatients("Sunita");
    expect(resultsSunita.length).toBe(1);
    expect(resultsSunita[0].syntheticHospitalPatientId).toBe("P-9022");
  });

  it("TEST-PHARM-PAT-002: Patient record retrieval contains demographics and synthetic link status", async () => {
    const patient = await api.getPatient("P-9021");
    expect(patient.syntheticHospitalPatientId).toBe("P-9021");
    expect(patient.displayName).toBe("Rajan Sharma");
    expect(patient.dateOfBirth).toBe("1968-04-12");
    expect(patient.gender).toBe("MALE");
    expect(patient.linkStatus).toBe("LINKED");
  });

  it("TEST-PHARM-OCR-001: Pharmacist can correct extracted OCR text and persist changes", async () => {
    const caseId = "case_rx_9021_01";
    const initialCase = await api.getCase(caseId);
    expect(initialCase.extractedRawText).toBeDefined();

    const updatedLines = [
      { id: 1, text: "Rx: Tab. Warfarin 5mg - Corrected Line", confidence: 0.99 },
      { id: 2, text: "Tab. Aspirin 75mg - Verified", confidence: 0.95 },
    ];

    const updatedCase = await api.updateExtractedText(caseId, updatedLines);
    expect(updatedCase.extractedRawText).toContain("Corrected Line");

    const reloaded = await api.getCase(caseId);
    expect(reloaded.extractedRawText).toContain("Corrected Line");
  });

  it("TEST-PHARM-MED-001: Medicine reconciliation confirms matched items", async () => {
    const caseId = "case_rx_9021_01";
    const confirmedItems = INITIAL_PRESCRIPTION_ITEMS.map((item) => ({
      ...item,
      matchStatus: "CONFIRMED" as const,
    }));

    const result = await api.confirmMedicines(caseId, confirmedItems);
    expect(result.items.length).toBe(2);
    expect(result.items.every((i) => i.matchStatus === "CONFIRMED")).toBe(true);
  });

  it("TEST-PHARM-MED-002: Searching catalogue returns relevant candidate medications", async () => {
    const warfarinResults = await api.searchCatalogue("Warfarin");
    expect(warfarinResults.length).toBeGreaterThan(0);
    expect(warfarinResults[0].displayName).toContain("Warfarin");

    const paracetamolResults = await api.searchCatalogue("Paracetamol");
    expect(paracetamolResults.length).toBeGreaterThan(0);
    expect(paracetamolResults[0].displayName).toContain("Paracetamol");
  });

  it("TEST-PHARM-OCR-002: Enforces individual line verification and persists line count fidelity", async () => {
    const caseId = "case_rx_9021_01";
    const multiLines = [
      { id: 1, text: "Tab. Warfarin Sodium 5mg", confidence: 0.98 },
      { id: 2, text: "Tab. Paracetamol 500mg", confidence: 0.95 },
      { id: 3, text: "Tab. Metformin HCl 500mg", confidence: 0.92 },
    ];

    const updated = await api.updateExtractedText(caseId, multiLines);
    expect(updated.extractedRawText.split("\n").length).toBe(3);
    expect(updated.extractedRawText).toContain("Metformin");
  });
});
