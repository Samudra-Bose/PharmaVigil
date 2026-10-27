import { describe, it, expect, beforeEach } from "vitest";
import { api } from "@/lib/api-client";

describe("Registration, Onboarding & Admin Membership Management", () => {
  beforeEach(async () => {
    await api.resetDemoWorkspace();
  });

  it("TEST-AUTH-REG-001: Registering creates a PENDING membership for admin review", async () => {
    const applicant = {
      displayName: "Dr. Ananya Roy",
      email: "ananya.roy@metro-general.invalid",
      requestedRole: "DOCTOR" as const,
    };

    const registration = await api.registerApplicant(applicant);
    expect(registration.id).toBeDefined();
    expect(registration.status).toBe("PENDING");

    const memberships = await api.getMemberships();
    const created = memberships.find((m) => m.email === applicant.email);
    expect(created).toBeDefined();
    expect(created?.status).toBe("PENDING");
    expect(created?.role).toBe("DOCTOR");
    expect(created?.displayName).toBe("Dr. Ananya Roy");
  });

  it("TEST-ADMIN-MEM-001: Admin approves pending applicant credentials to ACTIVE", async () => {
    const applicant = {
      displayName: "Pharmacist Meera Nair",
      email: "meera.nair@metro-general.invalid",
      requestedRole: "PHARMACIST" as const,
    };

    const reg = await api.registerApplicant(applicant);
    const membershipsBefore = await api.getMemberships();
    const target = membershipsBefore.find((m) => m.id === reg.id);
    expect(target?.status).toBe("PENDING");

    // Admin approves
    await api.updateMembershipStatus(reg.id, "ACTIVE", "PHARMACIST");

    const membershipsAfter = await api.getMemberships();
    const approved = membershipsAfter.find((m) => m.id === reg.id);
    expect(approved?.status).toBe("ACTIVE");
  });

  it("TEST-ADMIN-MEM-002: Admin can suspend and reactivate credentials", async () => {
    const memberships = await api.getMemberships();
    const activeStaff = memberships.find((m) => m.status === "ACTIVE");
    expect(activeStaff).toBeDefined();

    if (activeStaff) {
      // Suspend
      await api.updateMembershipStatus(activeStaff.id, "SUSPENDED", activeStaff.role);
      let updated = (await api.getMemberships()).find((m) => m.id === activeStaff.id);
      expect(updated?.status).toBe("SUSPENDED");

      // Reactivate
      await api.updateMembershipStatus(activeStaff.id, "ACTIVE", activeStaff.role);
      updated = (await api.getMemberships()).find((m) => m.id === activeStaff.id);
      expect(updated?.status).toBe("ACTIVE");
    }
  });

  it("TEST-ADMIN-RESET-001: Scoped demo reset resets mock state to initial fixtures", async () => {
    // Add applicant
    await api.registerApplicant({
      displayName: "Temporary Applicant",
      email: "temp@example.invalid",
      requestedRole: "PATIENT",
    });

    let currentMems = await api.getMemberships();
    expect(currentMems.some((m) => m.email === "temp@example.invalid")).toBe(true);

    // Reset workspace
    await api.resetDemoWorkspace();

    const resetMems = await api.getMemberships();
    expect(resetMems.some((m) => m.email === "temp@example.invalid")).toBe(false);
  });
});
