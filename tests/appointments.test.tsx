import { describe, it, expect, beforeEach } from "vitest";
import { api } from "@/lib/api-client";

describe("Appointments Workflow (Patient & Doctor)", () => {
  beforeEach(async () => {
    await api.resetDemoWorkspace();
  });

  it("TEST-APPT-001: Lists initial fixture appointments", async () => {
    const list = await api.listAppointments();
    expect(list.length).toBeGreaterThan(0);
    const first = list[0];
    expect(first.patientDisplayName).toBeDefined();
    expect(first.clinicianDisplayName).toBeDefined();
    expect(first.status).toBe("SCHEDULED");
  });

  it("TEST-APPT-002: Filters appointments by patient ID", async () => {
    const list = await api.listAppointments({ patientId: "P-9021" });
    expect(list.length).toBeGreaterThan(0);
    list.forEach((app) => {
      expect(app.patientId === "P-9021" || app.patientDisplayName.includes("Rajan Sharma")).toBe(true);
    });
  });

  it("TEST-APPT-003: Patient books a new consultation appointment", async () => {
    const initialList = await api.listAppointments();
    const initialCount = initialList.length;

    const newAppointment = await api.createAppointment({
      patientId: "P-9021",
      patientDisplayName: "Rajan Sharma",
      clinicianUserId: "usr_doctor_01",
      clinicianDisplayName: "Dr. Arvind Patel, MD",
      department: "Cardiology",
      slotStart: "2026-10-30T10:00:00Z",
      slotEnd: "2026-10-30T10:30:00Z",
      reason: "Follow-up INR monitoring after medication revision",
    });

    expect(newAppointment.id).toBeDefined();
    expect(newAppointment.status).toBe("SCHEDULED");
    expect(newAppointment.patientDisplayName).toBe("Rajan Sharma");
    expect(newAppointment.department).toBe("Cardiology");

    const updatedList = await api.listAppointments();
    expect(updatedList.length).toBe(initialCount + 1);
  });

  it("TEST-APPT-004: Patient cancels an upcoming appointment", async () => {
    const list = await api.listAppointments();
    const scheduled = list.find((a) => a.status === "SCHEDULED");
    expect(scheduled).toBeDefined();

    if (scheduled) {
      const cancelled = await api.cancelAppointment(scheduled.id);
      expect(cancelled.status).toBe("CANCELLED");

      const refreshedList = await api.listAppointments();
      const updatedItem = refreshedList.find((a) => a.id === scheduled.id);
      expect(updatedItem?.status).toBe("CANCELLED");
    }
  });

  it("TEST-APPT-005: Doctor filters appointments by clinician ID", async () => {
    const list = await api.listAppointments({ clinicianId: "usr_doctor_01" });
    list.forEach((a) => {
      expect(a.clinicianUserId).toBe("usr_doctor_01");
    });
  });
});
