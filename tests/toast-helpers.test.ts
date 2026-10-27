import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { clinicalToast } from "@/lib/toast";
import { ApiClientError } from "@/lib/api-client";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));

describe("Clinical Toast Helper Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clinicalToast.success invokes toast.success with title and description", () => {
    clinicalToast.success("Patient Confirmed", "Case Rx-9021 linked.");
    expect(toast.success).toHaveBeenCalledWith(
      "Patient Confirmed",
      expect.objectContaining({
        description: "Case Rx-9021 linked.",
        duration: 3500,
      })
    );
  });

  it("clinicalToast.warning invokes toast.warning with extended duration", () => {
    clinicalToast.warning("Unconfirmed Medicines", "Confirm all items.");
    expect(toast.warning).toHaveBeenCalledWith(
      "Unconfirmed Medicines",
      expect.objectContaining({
        description: "Confirm all items.",
        duration: 5000,
      })
    );
  });

  it("clinicalToast.info invokes toast.info", () => {
    clinicalToast.info("OCR Line Confirmed", "Line #1 verified.");
    expect(toast.info).toHaveBeenCalledWith(
      "OCR Line Confirmed",
      expect.objectContaining({
        description: "Line #1 verified.",
      })
    );
  });

  it("clinicalToast.conflict presents actionable 409 conflict toast with reload handler", () => {
    const reloadSpy = vi.fn();
    clinicalToast.conflict("Prescription updated by another user.", reloadSpy);

    expect(toast.error).toHaveBeenCalledWith(
      "Clinical Version Conflict (409)",
      expect.objectContaining({
        description: "Prescription updated by another user.",
        duration: 8000,
        action: expect.objectContaining({
          label: "Reload Case",
        }),
      })
    );

    // Call action
    const mockCall = vi.mocked(toast.error).mock.calls[0];
    const action = mockCall[1]?.action as { onClick: () => void } | undefined;
    action?.onClick();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it("clinicalToast.error delegates 409 conflict errors to conflict prompt", () => {
    const conflictErr = new ApiClientError(
      "Revision mismatch: case updated concurrently",
      "CONFLICT"
    );

    clinicalToast.error(conflictErr);

    expect(toast.error).toHaveBeenCalledWith(
      "Clinical Version Conflict (409)",
      expect.objectContaining({
        description: "Revision mismatch: case updated concurrently",
      })
    );
  });

  it("clinicalToast.error formats ApiClientError with requestId and field details", () => {
    const apiErr = new ApiClientError(
      "Validation failed",
      "VALIDATION_ERROR",
      "req_xyz789abcdef",
      [
        { field: "rationale", message: "Rationale must be at least 15 characters" },
        { field: "dispositionType", message: "Invalid disposition code" },
      ]
    );

    clinicalToast.error(apiErr, "Submission Failed");

    expect(toast.error).toHaveBeenCalledWith(
      "Submission Failed [Ref: req_xyz7]",
      expect.objectContaining({
        description: "Rationale must be at least 15 characters • Invalid disposition code",
      })
    );
  });

  it("clinicalToast.error formats standard Javascript errors", () => {
    const stdErr = new Error("Network connection dropped");
    clinicalToast.error(stdErr, "System Offline");

    expect(toast.error).toHaveBeenCalledWith(
      "System Offline",
      expect.objectContaining({
        description: "Network connection dropped",
      })
    );
  });

  it("clinicalToast.promise forwards promise configuration to toast.promise", async () => {
    const mockPromise = Promise.resolve("done");
    clinicalToast.promise(mockPromise, {
      loading: "Evaluating safety rules...",
      success: "Evaluation complete",
      error: "Evaluation failed",
    });

    expect(toast.promise).toHaveBeenCalledWith(mockPromise, {
      loading: "Evaluating safety rules...",
      success: "Evaluation complete",
      error: "Evaluation failed",
    });
  });
});
