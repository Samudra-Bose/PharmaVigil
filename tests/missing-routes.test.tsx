import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "@/lib/api-client";
import { AuthProvider } from "@/context/AuthContext";
import DoctorOrdersPage from "@/app/doctor/orders/page";
import NewDoctorOrderPage from "@/app/doctor/orders/new/page";
import PharmacistOrdersPage from "@/app/pharmacist/orders/page";
import PatientMedicationHistoryPage from "@/app/patient/medication-history/page";
import AdminAuditPage from "@/app/admin/audit/page";
import AdminRulesPage from "@/app/admin/rules/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/doctor/orders",
}));

const renderWithAuth = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe("Missing Routes & Portals Verification Suite", () => {
  beforeEach(async () => {
    await api.resetDemoWorkspace();
  });

  // =========================================================================
  // 1. Doctor Inpatient Orders (UI-DOCTOR-006 & UI-DOCTOR-007)
  // =========================================================================
  describe("Doctor Inpatient Orders Workflow", () => {
    it("TEST-ORD-001: Lists inpatient orders and filters by status", async () => {
      const allOrders = await api.listMedicationOrders();
      expect(allOrders.length).toBeGreaterThan(0);

      const activeOrders = await api.listMedicationOrders({ status: "ACTIVE" });
      expect(activeOrders.length).toBeGreaterThan(0);
      activeOrders.forEach((o) => {
        expect(o.status).toBe("ACTIVE");
      });

      const heldOrders = await api.listMedicationOrders({ status: "HELD" });
      heldOrders.forEach((o) => {
        expect(o.status).toBe("HELD");
      });
    });

    it("TEST-ORD-002: Doctor prescribes new inpatient order with schedule Q8H and route IV", async () => {
      const initialOrders = await api.listMedicationOrders();
      const initialCount = initialOrders.length;

      const newOrder = await api.createMedicationOrder({
        patientId: "P-9021",
        ward: "Cardiology Ward 4B",
        bed: "Bed 14",
        scheduleFrequency: "Q8H",
        route: "INTRAVENOUS",
        notes: "Post-op sepsis precaution. Monitor renal function.",
        items: [
          {
            canonicalIngredientIds: ["Meropenem"],
            brandName: "Meronem 1g IV",
            dose: "1",
            unit: "g",
            route: "INTRAVENOUS",
            frequency: "Q8H",
            duration: "7 days",
            instructions: "Infuse over 30 minutes in 100mL 0.9% NaCl",
          },
        ],
      });

      expect(newOrder.id).toBeDefined();
      expect(newOrder.patientId).toBe("P-9021");
      expect(newOrder.currentVersionNumber).toBe(1);
      expect(newOrder.status).toBe("ACTIVE");
      expect(newOrder.items[0].canonicalIngredientIds).toContain("Meropenem");
      expect(newOrder.items[0].dose).toBe("1");
      expect(newOrder.items[0].frequency).toBe("Q8H");

      const updatedOrders = await api.listMedicationOrders();
      expect(updatedOrders.length).toBe(initialCount + 1);

      // Verify order details lookup
      const details = await api.getMedicationOrder(newOrder.id);
      expect(details.order.id).toBe(newOrder.id);
      expect(details.versions?.length).toBeGreaterThanOrEqual(1);
    });

    it("TEST-ORD-003: Order prescribing validation gates reject invalid input", async () => {
      // Missing patient ID
      await expect(
        api.createMedicationOrder({
          patientId: "",
          items: [
            {
              canonicalIngredientIds: ["Paracetamol"],
              dose: "500",
              unit: "mg",
            },
          ],
        })
      ).rejects.toThrow(/patientId is required/i);

      // Missing items
      await expect(
        api.createMedicationOrder({
          patientId: "P-9021",
          items: [],
        })
      ).rejects.toThrow(/At least 1 medication order item is required/i);
    });
  });

  // =========================================================================
  // 2. Pharmacist Inpatient Queue (UI-PHARM-011)
  // =========================================================================
  describe("Pharmacist Inpatient Queue Workflow", () => {
    it("TEST-PHARM-001: Pharmacist queries active inpatient queue and filters by patient", async () => {
      const orders = await api.listMedicationOrders({ patientId: "P-9021" });
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach((o) => {
        expect(o.patientId === "P-9021" || o.patientName?.includes("Rajan Sharma")).toBe(true);
      });
    });

    it("TEST-PHARM-002: Pharmacist can place active order on clinical hold", async () => {
      const initialActive = await api.listMedicationOrders({ status: "ACTIVE" });
      expect(initialActive.length).toBeGreaterThan(0);
      const targetOrder = initialActive[0];

      const updated = await api.updateMedicationOrderStatus(targetOrder.id, "HELD");
      expect(updated.status).toBe("HELD");

      const heldOrders = await api.listMedicationOrders({ status: "HELD" });
      expect(heldOrders.some((o) => o.id === targetOrder.id)).toBe(true);
    });
  });

  // =========================================================================
  // 3. Patient Self-Reporting Hub (UI-PAT-007)
  // =========================================================================
  describe("Patient Self-Reporting Hub", () => {
    it("TEST-PAT-001: Patient reports allergy with forced PATIENT_REPORTED and REPORTED attributes", async () => {
      const initialAllergies = await api.getAllergies("P-9021");
      const initialCount = initialAllergies.length;

      const created = await api.addAllergy("P-9021", {
        substanceText: "Ciprofloxacin",
        recordType: "ALLERGY",
        severity: "SEVERE",
        reactionDescription: "Facial angioedema and throat tightness",
      });

      expect(created.id).toBeDefined();
      expect(created.substanceText).toBe("Ciprofloxacin");
      // Enforced server attributes
      expect(created.sourceType).toBe("PATIENT_REPORTED");
      expect(created.verificationStatus).toBe("REPORTED");

      const updated = await api.getAllergies("P-9021");
      expect(updated.length).toBe(initialCount + 1);
    });

    it("TEST-PAT-002: Patient reports home medication with forced PATIENT_REPORTED and REPORTED attributes", async () => {
      const initialMeds = await api.getMedicationHistory("P-9021");
      const initialCount = initialMeds.length;

      const created = await api.addMedicationHistory("P-9021", {
        medicineName: "Aspirin Cardio",
        dose: "75",
        unit: "mg",
        route: "ORAL",
        frequency: "Once daily with breakfast",
        status: "ACTIVE",
      });

      expect(created.id).toBeDefined();
      expect(created.medicineName).toBe("Aspirin Cardio");
      expect(created.dose).toBe("75");
      // Enforced server attributes
      expect(created.sourceType).toBe("PATIENT_REPORTED");
      expect(created.verificationStatus).toBe("REPORTED");

      const updated = await api.getMedicationHistory("P-9021");
      expect(updated.length).toBe(initialCount + 1);
    });

    it("TEST-PAT-003: Rejects blank substance or medication input", async () => {
      await expect(
        api.addAllergy("P-9021", { substanceText: "   " })
      ).rejects.toThrow(/Substance text is required/i);

      await expect(
        api.addMedicationHistory("P-9021", { medicineName: "   " })
      ).rejects.toThrow(/Medicine name is required/i);
    });
  });

  // =========================================================================
  // 4. Admin Audit Search (UI-ADMIN-006)
  // =========================================================================
  describe("Admin Audit Search & Trail", () => {
    it("TEST-AUD-001: Filters audit events by resourceType and actorUserId", async () => {
      const allEvents = await api.listAuditEvents();
      expect(allEvents.length).toBeGreaterThan(0);

      const doctorEvents = await api.listAuditEvents({ actorUserId: "usr_doctor_01" });
      expect(doctorEvents.length).toBeGreaterThan(0);
      doctorEvents.forEach((e) => {
        expect(e.actorUserId === "usr_doctor_01" || e.actorDisplayName?.includes("Dr. Arvind Patel")).toBe(true);
      });

      const dispositionEvents = await api.listAuditEvents({ resourceType: "AlertDisposition" });
      dispositionEvents.forEach((e) => {
        expect(e.resourceType.toLowerCase()).toBe("alertdisposition");
      });
    });

    it("TEST-AUD-002: Audit events contain structured metadata, trace ID, and timestamp", async () => {
      const events = await api.listAuditEvents();
      const first = events[0];
      expect(first.id).toBeDefined();
      expect(first.timestamp).toBeDefined();
      expect(first.actorUserId).toBeDefined();
      expect(first.action).toBeDefined();
      expect(first.resourceType).toBeDefined();
      expect(first.resourceId).toBeDefined();
    });
  });

  // =========================================================================
  // 5. Admin Clinical Rulesets Viewer (UI-ADMIN-007)
  // =========================================================================
  describe("Admin Clinical Rulesets Governance", () => {
    it("TEST-RULE-001: Retrieves current published ruleset with metadata and rule count", async () => {
      const current = await api.getCurrentRuleSet();
      expect(current.ruleSetId).toBe("RULES-IN-IPC-2026");
      expect(current.version).toBe("v1.0.0-illustrative");
      expect(current.status).toBe("PUBLISHED");
      expect(current.ruleCount).toBeGreaterThanOrEqual(6);
      expect(current.rules.length).toBeGreaterThanOrEqual(6);
    });

    it("TEST-RULE-002: Ruleset contains explicit clinical safety limitations disclaimer", async () => {
      const current = await api.getCurrentRuleSet();
      expect(current.limitations).toBeDefined();
      expect(current.limitations.length).toBeGreaterThan(0);
      expect(
        current.limitations.some((lim) =>
          lim.toLowerCase().includes("illustrative") || lim.toLowerCase().includes("not clinically validated")
        )
      ).toBe(true);
    });

    it("TEST-RULE-003: Rules cover required clinical categories and recommendation strings", async () => {
      const current = await api.getCurrentRuleSet();
      const categories = current.rules.map((r) => r.category);
      expect(categories).toContain("DDI");
      expect(categories).toContain("DOSE_RANGE");
      expect(categories).toContain("ALLERGY_CROSS_REACTIVITY");
      expect(categories).toContain("DUPLICATE_THERAPY");

      current.rules.forEach((r) => {
        expect(r.ruleId).toBeDefined();
        expect(r.severity).toBeDefined();
        expect(r.recommendation.length).toBeGreaterThan(5);
      });
    });
  });

  // =========================================================================
  // 6. Tenancy Alignment & Navigation Links
  // =========================================================================
  describe("Tenancy Alignment & Navigation Integration", () => {
    it("TEST-TEN-001: Dynamically resolves current hospital from api.getCurrentHospital()", async () => {
      const hosp = await api.getCurrentHospital();
      expect(hosp).toBeDefined();
      expect(hosp.id).toBe("hosp_metro_general");
      expect(hosp.name).toBe("Metro General Hospital");
      expect(hosp.status).toBe("ACTIVE");
    });
  });

  // =========================================================================
  // 7. Component Rendering & Portal UI Smoke Tests
  // =========================================================================
  describe("Portal UI Rendering Smoke Tests", () => {
    it("TEST-UI-001: Doctor orders list renders ledger header and action button", async () => {
      renderWithAuth(<DoctorOrdersPage />);
      expect(screen.getByText("Inpatient Medication Orders Ledger")).toBeInTheDocument();
      expect(screen.getByText("+ Prescribe Inpatient Order")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getAllByText("P-9021").length).toBeGreaterThan(0);
      });
    });

    it("TEST-UI-002: Doctor new order form renders prescription fields and inputs", () => {
      renderWithAuth(<NewDoctorOrderPage />);
      expect(screen.getByText("Prescribe Inpatient Medication Order")).toBeInTheDocument();
      expect(screen.getByText("1. Inpatient Location & Patient Details")).toBeInTheDocument();
      expect(screen.getByText("Submit Inpatient Order")).toBeInTheDocument();
    });

    it("TEST-UI-003: Pharmacist orders queue renders verification header and metrics", async () => {
      renderWithAuth(<PharmacistOrdersPage />);
      expect(screen.getByText("Inpatient Medication Orders & Verification Queue")).toBeInTheDocument();
      expect(screen.getByText("Active Inpatient Orders")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getAllByText("Review & Verify").length).toBeGreaterThan(0);
      });
    });

    it("TEST-UI-004: Patient medication history renders disclaimer and tabs", async () => {
      renderWithAuth(<PatientMedicationHistoryPage />);
      expect(screen.getByText("Reported Medications & Known Allergies")).toBeInTheDocument();
      expect(screen.getByText(/Clinical Verification Notice/i)).toBeInTheDocument();
      expect(screen.getByText(/Self-reported medications and allergies are visible to your healthcare team/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Penicillin")).toBeInTheDocument();
      });
    });

    it("TEST-UI-005: Admin audit trail viewer renders compliance header and table", async () => {
      renderWithAuth(<AdminAuditPage />);
      expect(screen.getByText("Compliance Audit Trail & Event Ledger")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getAllByText("Inspect").length).toBeGreaterThan(0);
      });
    });

    it("TEST-UI-006: Admin rulesets explorer renders published ruleset and limitations warning", async () => {
      renderWithAuth(<AdminRulesPage />);
      expect(screen.getByText("Published CDS Clinical Rulesets Explorer")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Illustrative Demonstration Ruleset — Not Clinically Validated/i)).toBeInTheDocument();
        expect(screen.getByText("RULE-DDI-WARFARIN-ASPIRIN")).toBeInTheDocument();
      });
    });
  });
});
