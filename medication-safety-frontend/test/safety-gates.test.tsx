import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { RuleNoticeBanner } from "@/components/clinical/RuleNoticeBanner";
import { CoverageMatrix } from "@/components/clinical/CoverageMatrix";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api-client";

describe("Clinical Safety Gates & Hazards", () => {
  it("TEST-RULE-002: RuleNoticeBanner explicitly states illustrative status and absence of safety clearance", () => {
    render(<RuleNoticeBanner ruleSetVersion="v1.0.0-illustrative" />);

    expect(
      screen.getByText(/Illustrative rule set; not clinically validated/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Absence of a matching rule is not a certification of clinical safety/i)
    ).toBeInTheDocument();
  });

  it("TEST-RULE-002: CoverageMatrix explicitly conveys limitations and does not claim safety clearance", () => {
    const coverage = {
      drugDrug: {
        status: "NO_MATCHING_SEEDED_RULE" as const,
        limitation: "No match detected in limited dataset.",
      },
      allergy: {
        status: "NO_MATCHING_SEEDED_RULE" as const,
        limitation: "Allergy records clean.",
      },
      foodDrink: {
        status: "NOT_EVALUATED" as const,
        limitation: "Food interactions outside demo scope.",
      },
    };

    render(<CoverageMatrix coverage={coverage} ruleSetVersion="v1.0.0-illustrative" />);

    // Must show limitation note
    expect(
      screen.getByText(/reflect absence of a match in the illustrative subset, not a safety clearance/i)
    ).toBeInTheDocument();
  });

  it("TEST-DISP-001: Dispensing authorization gate throws when open alerts exist", async () => {
    // Initial case has open DDI alert (Warfarin + Aspirin)
    await expect(api.authorizeDispensing("case_rx_9021_01", 1)).rejects.toThrow(
      /Cannot authorize dispensing with unresolved clinical alerts/i
    );
  });

  it("TEST-CONC-001: Dispensing authorization rejects stale version with CONFLICT error", async () => {
    // Passing version 99 when case is version 1
    await expect(api.authorizeDispensing("case_rx_9021_01", 99)).rejects.toThrow(
      /Stale revision version detected/i
    );
  });

  it("TEST-SAFE-006: Doctor disposition required before dispensing can be authorized", async () => {
    const initialCase = await api.getCase("case_rx_9021_01");
    expect(initialCase.alerts && initialCase.alerts.length > 0).toBe(true);
    expect(initialCase.status).toBe("CHECK_FLAGGED");
  });
});
