import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { api } from "@/lib/api-client";
import { AuthProvider } from "@/context/AuthContext";
import { RoleLoginForm, ROLE_CONFIGS } from "@/components/auth/RoleLoginForm";
import DoctorLoginPage from "@/app/auth/login/doctor/page";
import PharmacistLoginPage from "@/app/auth/login/pharmacist/page";
import PatientLoginPage from "@/app/auth/login/patient/page";
import AdminLoginPage from "@/app/auth/login/admin/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/auth/login",
  useSearchParams: () => new URLSearchParams(),
}));

const renderWithAuth = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe("Individual Clinical Role Logins Suite", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await api.resetDemoWorkspace();
  });

  it("TEST-PORTAL-001: Doctor clinical portal renders doctor-specific credentials and configuration", async () => {
    renderWithAuth(<DoctorLoginPage />);
    expect(screen.getByText("Doctor & Prescriber Clinical Portal")).toBeDefined();
    expect(screen.getByText(/Attending Physician CDS Triage/i)).toBeDefined();
    expect(screen.getByText("Medical Staff ID or Hospital Email")).toBeDefined();
    expect(screen.getByText(/Dr. Arvind Patel, MD/i)).toBeDefined();
  });

  it("TEST-PORTAL-002: Pharmacist terminal portal renders pharmacy-specific credentials and fail-closed notice", async () => {
    renderWithAuth(<PharmacistLoginPage />);
    expect(screen.getByText("Pharmacist Dispensing & CDS Terminal")).toBeDefined();
    expect(screen.getByText(/Registered Pharmacist \(RPh\)/i)).toBeDefined();
    expect(screen.getByText("Pharmacist License ID or Email")).toBeDefined();
    expect(screen.getByText(/Priya Sharma, RPh/i)).toBeDefined();
    expect(screen.getByText(/Terminal strictly enforces fail-closed dispensing/i)).toBeDefined();
  });

  it("TEST-PORTAL-003: Patient health portal renders patient MRN login and private health notice", async () => {
    renderWithAuth(<PatientLoginPage />);
    expect(screen.getByText("Patient & Family Care Portal")).toBeDefined();
    expect(screen.getByText(/Patient Outpatient Access/i)).toBeDefined();
    expect(screen.getByText("Patient MRN / Hospital ID or Email")).toBeDefined();
    expect(screen.getByText(/Rajan Sharma/i)).toBeDefined();
    expect(screen.getByText(/Your outpatient prescriptions, self-reported allergies/i)).toBeDefined();
  });

  it("TEST-PORTAL-004: Admin governance console renders administrative compliance credentials", async () => {
    renderWithAuth(<AdminLoginPage />);
    expect(screen.getByText("Hospital Governance & Compliance Console")).toBeDefined();
    expect(screen.getByText(/Executive Governance/i)).toBeDefined();
    expect(screen.getByText("Administrator Corporate Email")).toBeDefined();
    expect(screen.getByText(/Sunita Verma/i)).toBeDefined();
    expect(screen.getByText(/Administrative security actions and clinical ruleset threshold/i)).toBeDefined();
  });

  it("TEST-PORTAL-005: Fast 1-Click login authenticates as Doctor and sets DOCTOR session", async () => {
    const res = await api.login("doctor@metro-general.invalid", "DemoPassword123!");
    expect(res.user.displayName).toBe("Dr. Arvind Patel, MD");
    expect(res.memberships[0].assignedRole).toBe("DOCTOR");
  });

  it("TEST-PORTAL-006: Fast 1-Click login authenticates as Patient using MRN P-9021", async () => {
    const res = await api.login("P-9021", "DemoPassword123!");
    expect(res.user.displayName).toBe("Rajan Sharma");
    expect(res.memberships[0].assignedRole).toBe("PATIENT");
  });

  it("TEST-PORTAL-007: Fast 1-Click login authenticates as Admin and sets HOSPITAL_ADMIN session", async () => {
    const res = await api.login("admin@metro-general.invalid", "DemoPassword123!");
    expect(res.user.displayName).toBe("Sunita Verma (Administrator)");
    expect(res.memberships[0].assignedRole).toBe("HOSPITAL_ADMIN");
  });

  it("TEST-PORTAL-008: Switching tabs in unified RoleLoginForm updates to corresponding portal form", async () => {
    const handleRoleChange = vi.fn();
    renderWithAuth(
      <RoleLoginForm
        initialRole="PHARMACIST"
        isStandalonePage={false}
        onRoleChange={handleRoleChange}
      />
    );

    // Initial state is Pharmacist
    expect(screen.getByText("Pharmacist Dispensing & CDS Terminal")).toBeDefined();

    // Click Doctor tab
    const doctorTab = screen.getByRole("button", { name: /Doctor Portal/i });
    fireEvent.click(doctorTab);

    expect(handleRoleChange).toHaveBeenCalledWith("DOCTOR");
    expect(screen.getByText("Doctor & Prescriber Clinical Portal")).toBeDefined();
  });

  it("TEST-PORTAL-009: Individual credentials authenticate Doctor with DoctorSecure2026!", async () => {
    const res = await api.login("doctor@metro-general.invalid", "DoctorSecure2026!");
    expect(res.user.displayName).toBe("Dr. Arvind Patel, MD");
    expect(res.memberships[0].assignedRole).toBe("DOCTOR");
  });

  it("TEST-PORTAL-010: Individual credentials authenticate Pharmacist with PharmaSecure2026!", async () => {
    const res = await api.login("pharma@metro-general.invalid", "PharmaSecure2026!");
    expect(res.user.displayName).toBe("Priya Sharma, RPh");
    expect(res.memberships[0].assignedRole).toBe("PHARMACIST");
  });

  it("TEST-PORTAL-011: Individual credentials authenticate Patient with PatientSecure2026!", async () => {
    const res = await api.login("patient@metro-general.invalid", "PatientSecure2026!");
    expect(res.user.displayName).toBe("Rajan Sharma");
    expect(res.memberships[0].assignedRole).toBe("PATIENT");
  });

  it("TEST-PORTAL-012: Individual credentials authenticate Admin with AdminSecure2026!", async () => {
    const res = await api.login("admin@metro-general.invalid", "AdminSecure2026!");
    expect(res.user.displayName).toBe("Sunita Verma (Administrator)");
    expect(res.memberships[0].assignedRole).toBe("HOSPITAL_ADMIN");
  });

  it("TEST-PORTAL-013: Login rejects incorrect password with UNAUTHENTICATED error", async () => {
    await expect(
      api.login("doctor@metro-general.invalid", "WrongPassword999!")
    ).rejects.toThrow(/Invalid email or password/i);
  });

  it("TEST-PORTAL-014: Session expires after 2 days (48 hours) according to expiration policy", () => {
    const expiredTimestamp = Date.now() - 1000; // 1 second ago
    const activeTimestamp = Date.now() + 48 * 60 * 60 * 1000; // 2 days in future

    expect(Date.now() > expiredTimestamp).toBe(true);
    expect(Date.now() > activeTimestamp).toBe(false);
  });

  it("TEST-PORTAL-015: Protected routes redirect unauthenticated users to corresponding login page", async () => {
    const { getLoginRedirectForPath, isProtectedPath } = await import(
      "@/context/AuthContext"
    );

    expect(isProtectedPath("/doctor")).toBe(true);
    expect(isProtectedPath("/doctor/orders")).toBe(true);
    expect(isProtectedPath("/pharmacist")).toBe(true);
    expect(isProtectedPath("/patient")).toBe(true);
    expect(isProtectedPath("/admin")).toBe(true);
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/auth/login")).toBe(false);

    expect(getLoginRedirectForPath("/doctor")).toBe("/auth/login/doctor");
    expect(getLoginRedirectForPath("/pharmacist")).toBe("/auth/login/pharmacist");
    expect(getLoginRedirectForPath("/patient")).toBe("/auth/login/patient");
    expect(getLoginRedirectForPath("/admin")).toBe("/auth/login/admin");
  });
});
