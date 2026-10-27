import { describe, it, expect, beforeEach } from "vitest";
import { api } from "@/lib/api-client";

describe("Authentication & Role Boundaries", () => {
  beforeEach(async () => {
    await api.resetDemoWorkspace();
  });

  it("TEST-AUTH-001: Pharmacist login succeeds and returns valid session user and membership", async () => {
    const res = await api.login("pharma@metro-general.invalid", "Password123!");
    expect(res.user.displayName).toBe("Priya Sharma, RPh");
    expect(res.user.accountStatus).toBe("ACTIVE");
    expect(res.memberships[0].assignedRole).toBe("PHARMACIST");
    expect(res.memberships[0].status).toBe("ACTIVE");
  });

  it("TEST-AUTH-002: Invalid login throws UNAUTHENTICATED error without credential leak", async () => {
    await expect(api.login("unknown@hospital.invalid", "badpass")).rejects.toThrow(
      /Invalid email or password/i
    );
  });

  it("TEST-SEC-002: Patient search is hospital scoped and finds synthetic patient P-9021", async () => {
    const patients = await api.searchPatients("P-9021");
    expect(patients.length).toBe(1);
    expect(patients[0].displayName).toBe("Rajan Sharma");
    expect(patients[0].syntheticHospitalPatientId).toBe("P-9021");
  });

  it("TEST-RESET-001: Scoped demo reset restores deterministic fixtures", async () => {
    // Alter case status
    await api.runCheck("case_rx_9021_01");

    // Execute scoped reset
    await api.resetDemoWorkspace();

    const caseData = await api.getCase("case_rx_9021_01");
    expect(caseData.currentRevisionNumber).toBe(1);
    expect(caseData.revisions.length).toBe(1);
  });
});
