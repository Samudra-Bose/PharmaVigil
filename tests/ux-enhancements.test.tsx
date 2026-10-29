import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { api } from "@/lib/api-client";
import { AuthProvider } from "@/context/AuthContext";
import { CommandPalette, openCommandPalette } from "@/components/layout/CommandPalette";
import { ShortcutsModal, openShortcutsModal } from "@/components/layout/ShortcutsModal";
import { HotkeysHandler } from "@/components/layout/HotkeysHandler";
import PatientHomePage from "@/app/patient/page";
import DoctorDashboard from "@/app/doctor/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/patient",
  useSearchParams: () => new URLSearchParams(),
}));

const renderWithAuth = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe("Super Smooth UX Enhancements Suite", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await api.resetDemoWorkspace();
  });

  it("TEST-UX-001: Command Palette opens via trigger event and displays spotlight search", async () => {
    renderWithAuth(
      <div>
        <CommandPalette />
      </div>
    );

    // Initially hidden
    expect(screen.queryByPlaceholderText(/Type a command, patient MRN/i)).toBeNull();

    // Trigger open
    act(() => {
      openCommandPalette();
    });

    // Should now be open and visible
    const input = screen.getByPlaceholderText(/Type a command, patient MRN/i);
    expect(input).toBeDefined();
    expect(screen.getByText(/PharmaVigil Spotlight/i)).toBeDefined();
  });

  it("TEST-UX-002: Command Palette live filters items by query and navigates on Enter", async () => {
    renderWithAuth(
      <div>
        <CommandPalette />
      </div>
    );

    act(() => {
      openCommandPalette();
    });

    const input = screen.getByPlaceholderText(/Type a command, patient MRN/i) as HTMLInputElement;

    // Filter by Warfarin
    fireEvent.change(input, { target: { value: "Warfarin" } });

    // Should show Warfarin relevant items
    expect(screen.getByText(/Warfarin \+ Aspirin Bleed Hazard/i)).toBeDefined();
    expect(screen.getByText(/Rajan Sharma \(MRN: P-9021\)/i)).toBeDefined();

    // Press Enter to navigate to the first matched result (Rajan Sharma's active case check)
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/pharmacist/cases/case_rx_9021_01/results");
  });

  it("TEST-UX-003: Keyboard Shortcuts modal opens via openShortcutsModal() and displays hotkey cheat sheet", async () => {
    renderWithAuth(
      <div>
        <ShortcutsModal />
      </div>
    );

    act(() => {
      openShortcutsModal();
    });

    expect(screen.getByText("Keyboard Shortcuts Cheat Sheet")).toBeDefined();
    expect(screen.getByText(/Open Command Palette \/ Spotlight search/i)).toBeDefined();
    expect(screen.getByText(/Switch to Pharmacist Clinical Workspace/i)).toBeDefined();
  });

  it("TEST-UX-004: Patient Dashboard Dose Tracker toggles doses and recalculates progress", async () => {
    renderWithAuth(<PatientHomePage />);

    await waitFor(() => {
      expect(screen.getByText("Daily Administration & Dose Tracker")).toBeDefined();
    });

    // Initial state: morning & midday taken (2 of 3 = 67%)
    expect(screen.getByText(/2 of 3 Taken \(67%\)/i)).toBeDefined();

    // Find the log dose button for evening dose
    const logButtons = screen.getAllByRole("button", { name: /Log Dose/i });
    expect(logButtons.length).toBeGreaterThan(0);

    // Click to log the evening dose
    fireEvent.click(logButtons[0]);

    // Now all 3 of 3 taken = 100%
    await waitFor(() => {
      expect(screen.getByText(/3 of 3 Taken \(100%\)/i)).toBeDefined();
    });
  });

  it("TEST-UX-005: Doctor Triage Dashboard filters tasks by drug or patient MRN", async () => {
    renderWithAuth(<DoctorDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Prioritized Safety Triage Queue")).toBeDefined();
    });

    const filterInput = screen.getByPlaceholderText(/Filter tasks, MRN, alert/i);
    expect(filterInput).toBeDefined();

    // Filter by P-9021
    fireEvent.change(filterInput, { target: { value: "P-9021" } });

    // Ensure matching patient task remains visible
    expect(screen.getByText("Rajan Sharma")).toBeDefined();

    // Filter by non-existent query
    fireEvent.change(filterInput, { target: { value: "NONEXISTENT_XYZ" } });
    expect(screen.getByText(/No matching triage tasks found/i)).toBeDefined();
  });

  it("TEST-UX-006: HotkeysHandler intercepts Alt+1 to switch workspace to Pharmacist", async () => {
    renderWithAuth(
      <div>
        <HotkeysHandler />
      </div>
    );

    act(() => {
      fireEvent.keyDown(window, {
        key: "1",
        code: "Digit1",
        altKey: true,
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/pharmacist");
  });
});
