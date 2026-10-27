import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { api, type NotificationItem } from "@/lib/api-client";
import { clinicalToast } from "@/lib/toast";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/lib/toast", () => ({
  clinicalToast: {
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    conflict: vi.fn(),
  },
}));

describe("In-App Notification Center Suite", () => {
  const sampleNotifications: NotificationItem[] = [
    {
      id: "notif_001",
      type: "PRESCRIPTION_ALERT_FLAGGED",
      subjectId: "case_rx_9021_01",
      title: "Prescription Alert Flagged",
      message: "Case case_rx_9021_01 has high-risk Warfarin + Aspirin DDI.",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif_002",
      type: "ALERT_DISPOSITION_RECORDED",
      subjectId: "case_rx_9021_01",
      title: "Physician Disposition Logged",
      message: "Dr. Arvind Patel recorded CHANGE_REQUIRED on Case case_rx_9021_01.",
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "getNotifications").mockResolvedValue(sampleNotifications);
    vi.spyOn(api, "markNotificationRead").mockResolvedValue(undefined);
  });

  it("TEST-NOTIF-001: Displays bell with unread badge counter", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      // 1 unread notification in sample
      const badge = screen.getByLabelText("1 unread notifications");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("1");
    });
  });

  it("TEST-NOTIF-002: Clicking bell opens notifications feed dialog", async () => {
    render(<NotificationBell />);

    const bellBtn = screen.getByLabelText("Clinical notifications");
    fireEvent.click(bellBtn);

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Prescription Alert Flagged")).toBeInTheDocument();
      expect(screen.getByText("Physician Disposition Logged")).toBeInTheDocument();
    });
  });

  it("TEST-NOTIF-003: Filters between All and Unread tabs", async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Clinical notifications"));

    await waitFor(() => {
      expect(screen.getByText("Prescription Alert Flagged")).toBeInTheDocument();
      expect(screen.getByText("Physician Disposition Logged")).toBeInTheDocument();
    });

    // Switch to Unread tab
    fireEvent.click(screen.getByRole("button", { name: /^Unread/i }));

    await waitFor(() => {
      expect(screen.getByText("Prescription Alert Flagged")).toBeInTheDocument();
      // Read item should not be in Unread tab
      expect(screen.queryByText("Physician Disposition Logged")).not.toBeInTheDocument();
    });
  });

  it("TEST-NOTIF-004: Single-click mark as read optimistically updates state and calls api", async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Clinical notifications"));

    await waitFor(() => {
      expect(screen.getByLabelText('Mark "Prescription Alert Flagged" as read')).toBeInTheDocument();
    });

    const markReadBtn = screen.getByLabelText('Mark "Prescription Alert Flagged" as read');
    fireEvent.click(markReadBtn);

    expect(api.markNotificationRead).toHaveBeenCalledWith("notif_001");

    // Unread count decrements to 0
    await waitFor(() => {
      expect(screen.queryByLabelText("1 unread notifications")).not.toBeInTheDocument();
    });
  });

  it("TEST-NOTIF-005: Mark all as read updates all unread notifications", async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Clinical notifications"));

    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Mark all as read"));

    await waitFor(() => {
      expect(api.markNotificationRead).toHaveBeenCalledWith("notif_001");
      expect(clinicalToast.success).toHaveBeenCalledWith(
        "All caught up",
        "Marked all notifications as read."
      );
    });
  });

  it("TEST-NOTIF-006: Rollback on API failure displays error toast", async () => {
    vi.spyOn(api, "markNotificationRead").mockRejectedValueOnce(new Error("Network timeout"));

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Clinical notifications"));

    await waitFor(() => {
      expect(screen.getByLabelText('Mark "Prescription Alert Flagged" as read')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Mark "Prescription Alert Flagged" as read'));

    await waitFor(() => {
      expect(clinicalToast.error).toHaveBeenCalled();
      // Unread badge rolled back to 1
      expect(screen.getByLabelText("1 unread notifications")).toBeInTheDocument();
    });
  });

  it("TEST-NOTIF-007: Clicking notification item navigates to clinical case", async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Clinical notifications"));

    await waitFor(() => {
      expect(screen.getByText("Prescription Alert Flagged")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Prescription Alert Flagged"));

    expect(mockPush).toHaveBeenCalledWith("/pharmacist/cases/case_rx_9021_01/results");
  });

  it("TEST-NOTIF-008: Closes drawer on Escape key", async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Clinical notifications"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
