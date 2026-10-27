import { describe, it, expect, beforeEach } from "vitest";
import { api } from "@/lib/api-client";
import { INITIAL_PRESCRIPTION_ITEMS } from "@/lib/mock-data/fixtures";

describe("Prescription Revision & Outpatient Pipeline", () => {
  beforeEach(async () => {
    await api.resetDemoWorkspace();
  });

  it("TEST-RX-001: Doctor revision creates immutable Revision 2 and preserves Revision 1", async () => {
    const caseId = "case_rx_9021_01";
    const initialCase = await api.getCase(caseId);
    expect(initialCase.currentRevisionNumber).toBe(1);
    expect(initialCase.revisions.length).toBe(1);

    // Doctor records disposition and creates revision replacing Aspirin with Paracetamol
    await api.recordDoctorDisposition(
      "alert_ddi_001",
      "CHANGE_REQUIRED",
      "Discontinued Aspirin to prevent bleeding hazard. Substituted Paracetamol 500mg."
    );

    const revisedItems = [
      INITIAL_PRESCRIPTION_ITEMS[0], // Warfarin
      {
        rawExtractedText: "Tab. Paracetamol 500mg - 1 Tab OD",
        catalogueItemId: "cat_paracetamol_500",
        canonicalIngredientIds: ["ing_paracetamol"],
        brandText: "Crocin",
        strengthValue: 500,
        strengthUnit: "mg",
        dosageForm: "Tablet",
        doseValue: 1,
        doseUnit: "Tablet",
        route: "Oral",
        frequency: "Once Daily",
        durationValue: 15,
        durationUnit: "days",
        matchConfidence: 1.0,
        matchStatus: "CONFIRMED" as const,
      },
    ];

    const revisedCase = await api.createRevision(
      caseId,
      revisedItems,
      "Substituted Aspirin with Paracetamol to eliminate Warfarin interaction."
    );

    // Verify Revision 2 is created and Revision 1 is still preserved in history
    expect(revisedCase.currentRevisionNumber).toBe(2);
    expect(revisedCase.revisions.length).toBe(2);
    expect(revisedCase.revisions[0].revisionNumber).toBe(1);
    expect(revisedCase.revisions[1].revisionNumber).toBe(2);
  });

  it("TEST-E2E-001: Full outpatient pipeline leads to successful workflow authorization without safe claims", async () => {
    const caseId = "case_rx_9021_01";

    // 1. Initial check is FLAGGED
    const initialCheck = await api.runCheck(caseId);
    expect(initialCheck.data.outcome).toBe("FLAGGED");

    // 2. Doctor acknowledges and records CHANGE_REQUIRED
    await api.recordDoctorDisposition(
      "alert_ddi_001",
      "CHANGE_REQUIRED",
      "Replacing Aspirin with safe alternative."
    );

    // 3. Doctor issues Revision 2 with Paracetamol
    const cleanItems = [
      INITIAL_PRESCRIPTION_ITEMS[0],
      {
        rawExtractedText: "Tab. Paracetamol 500mg",
        catalogueItemId: "cat_paracetamol_500",
        canonicalIngredientIds: ["ing_paracetamol"],
        strengthValue: 500,
        strengthUnit: "mg",
        dosageForm: "Tablet",
        doseValue: 1,
        doseUnit: "Tablet",
        frequency: "Once Daily",
        durationValue: 15,
        durationUnit: "days",
        matchConfidence: 1.0,
        matchStatus: "CONFIRMED" as const,
      },
    ];

    await api.createRevision(caseId, cleanItems, "Replaced Aspirin with Paracetamol.");

    // 4. Pharmacist re-runs safety check on Revision 2
    const recheckResult = await api.runCheck(caseId);
    expect(recheckResult.data.outcome).toBe("NO_MATCHING_RULE");
    expect(recheckResult.data.alerts.length).toBe(0);

    // 5. Pharmacist successfully authorizes dispensing for Revision 2
    await api.authorizeDispensing(caseId, 2);

    // 6. Verify case status is DISPENSING_AUTHORIZED
    const finalCase = await api.getCase(caseId);
    expect(finalCase.status).toBe("DISPENSING_AUTHORIZED");
    expect(finalCase.dispensingAuthorization?.expectedVersion).toBe(2);
    expect(finalCase.dispensingAuthorization?.authorizedAt).toBeDefined();
  });
});
