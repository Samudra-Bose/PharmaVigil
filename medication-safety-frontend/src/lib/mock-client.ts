import {
  FIXTURE_HOSPITAL,
  FIXTURE_USERS,
  FIXTURE_PATIENT,
  FIXTURE_CATALOGUE,
  INITIAL_FIXTURE_CASE,
  INITIAL_PRESCRIPTION_ITEMS,
  type FixtureCase,
  type FixtureUser,
  type PatientRecord,
} from "./mock-data/fixtures";
import type {
  CurrentUserResponse,
  MedicineCandidate,
  PrescriptionItem,
  PrescriptionRevision,
  CheckEnvelope,
  AlertSummary,
  Hospital,
} from "@/types";

class MockEngine {
  private currentUser: FixtureUser | null = FIXTURE_USERS["pharma@metro-general.invalid"];
  private hospital: Hospital = { ...FIXTURE_HOSPITAL };
  private patient: PatientRecord = { ...FIXTURE_PATIENT };
  private activeCases: Map<string, FixtureCase> = new Map([
    [INITIAL_FIXTURE_CASE.id, JSON.parse(JSON.stringify(INITIAL_FIXTURE_CASE))],
  ]);
  private memberships: Array<{
    id: string;
    userId: string;
    displayName: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED";
    createdAt: string;
  }> = [
    {
      id: "mem_01",
      userId: "usr_pharma_01",
      displayName: "Priya Sharma, RPh",
      email: "pharma@metro-general.invalid",
      role: "PHARMACIST",
      status: "ACTIVE",
      createdAt: "2026-01-10T09:00:00Z",
    },
    {
      id: "mem_02",
      userId: "usr_doctor_01",
      displayName: "Dr. Arvind Patel, MD",
      email: "doctor@metro-general.invalid",
      role: "DOCTOR",
      status: "ACTIVE",
      createdAt: "2026-01-11T10:00:00Z",
    },
    {
      id: "mem_03",
      userId: "usr_pending_01",
      displayName: "Dr. Neha Rao (Applicant)",
      email: "pending@metro-general.invalid",
      role: "DOCTOR",
      status: "PENDING",
      createdAt: "2026-10-27T08:00:00Z",
    },
  ];

  // Auth Operations
  async login(email: string): Promise<CurrentUserResponse> {
    const user = FIXTURE_USERS[email.toLowerCase()];
    if (!user) {
      const err = new Error("Invalid email or password");
      (err as unknown as { code: string; requestId: string }).code = "UNAUTHENTICATED";
      (err as unknown as { code: string; requestId: string }).requestId = "req_mock_auth_fail";
      throw err;
    }
    this.currentUser = user;
    return this.getCurrentUser();
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    if (!this.currentUser) {
      const err = new Error("No active session found.");
      (err as unknown as { code: string; requestId: string }).code = "UNAUTHENTICATED";
      (err as unknown as { code: string; requestId: string }).requestId = "req_mock_no_session";
      throw err;
    }
    return {
      user: {
        id: this.currentUser.id,
        displayName: this.currentUser.displayName,
        accountStatus: this.currentUser.accountStatus,
      },
      memberships: [
        {
          id: `mem_${this.currentUser.id}`,
          hospitalId: this.hospital.id,
          userId: this.currentUser.id,
          assignedRole: this.currentUser.role,
          requestedRole: this.currentUser.role,
          status: this.currentUser.membershipStatus,
          version: 1,
        },
      ],
    };
  }

  // Fast Persona Switcher (Demo Accelerator)
  switchPersona(role: "PHARMACIST" | "DOCTOR" | "PATIENT" | "HOSPITAL_ADMIN"): void {
    const emailMap: Record<string, string> = {
      PHARMACIST: "pharma@metro-general.invalid",
      DOCTOR: "doctor@metro-general.invalid",
      PATIENT: "patient@metro-general.invalid",
      HOSPITAL_ADMIN: "admin@metro-general.invalid",
    };
    this.currentUser = FIXTURE_USERS[emailMap[role]];
  }

  // Patient Operations
  async searchPatients(query: string): Promise<PatientRecord[]> {
    if (!query) return [];
    const q = query.toLowerCase();
    if (
      this.patient.syntheticHospitalPatientId.toLowerCase().includes(q) ||
      (this.patient.displayName && this.patient.displayName.toLowerCase().includes(q))
    ) {
      return [this.patient];
    }
    return [];
  }

  async getPatient(id: string): Promise<PatientRecord> {
    if (id === this.patient.id || id === this.patient.syntheticHospitalPatientId) {
      return this.patient;
    }
    const err = new Error(`Patient ${id} not found.`);
    (err as unknown as { code: string; requestId: string }).code = "NOT_FOUND";
    (err as unknown as { code: string; requestId: string }).requestId = "req_mock_pat_404";
    throw err;
  }

  // Catalogue Operations
  async searchCatalogue(query: string): Promise<MedicineCandidate[]> {
    if (!query) return FIXTURE_CATALOGUE;
    const q = query.toLowerCase();
    return FIXTURE_CATALOGUE.filter(
      (m) =>
        (m.displayName && m.displayName.toLowerCase().includes(q)) ||
        m.canonicalIngredientIds.some((ing) => ing.toLowerCase().includes(q))
    );
  }

  // Prescription Cases Operations
  async getCases(): Promise<FixtureCase[]> {
    return Array.from(this.activeCases.values());
  }

  async getCase(id: string): Promise<FixtureCase> {
    const c = this.activeCases.get(id);
    if (!c) {
      const err = new Error(`Case ${id} not found.`);
      (err as unknown as { code: string; requestId: string }).code = "NOT_FOUND";
      (err as unknown as { code: string; requestId: string }).requestId = "req_mock_case_404";
      throw err;
    }
    return JSON.parse(JSON.stringify(c));
  }

  async createCapture(patientId: string, rawText: string): Promise<FixtureCase> {
    const id = `case_rx_${Date.now()}`;
    const newCase: FixtureCase = {
      id,
      patientId,
      status: "DRAFT_CAPTURE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentRevisionNumber: 1,
      extractedRawText: rawText,
      items: [...INITIAL_PRESCRIPTION_ITEMS],
      revisions: [
        {
          id: `rev_01_${id}`,
          revisionNumber: 1,
          createdAt: new Date().toISOString(),
          items: [...INITIAL_PRESCRIPTION_ITEMS],
        },
      ],
    };
    this.activeCases.set(id, newCase);
    return newCase;
  }

  async confirmMedicines(caseId: string, items: PrescriptionItem[]): Promise<FixtureCase> {
    const c = await this.getCase(caseId);
    c.items = items;
    c.status = "MEDICINES_CONFIRMED";
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
    return c;
  }

  async runCheck(caseId: string): Promise<CheckEnvelope> {
    const c = await this.getCase(caseId);
    // Determine outcome based on items
    const hasWarfarin = c.items.some((i) =>
      i.canonicalIngredientIds.some((ing) => ing.toLowerCase().includes("warfarin")) ||
      (i.rawExtractedText && i.rawExtractedText.toLowerCase().includes("warfarin"))
    );
    const hasAspirin = c.items.some((i) =>
      i.canonicalIngredientIds.some((ing) => ing.toLowerCase().includes("aspirin")) ||
      (i.rawExtractedText && i.rawExtractedText.toLowerCase().includes("aspirin"))
    );

    let outcome: CheckEnvelope["data"]["outcome"] = "NO_MATCHING_RULE";
    const alerts: AlertSummary[] = [];

    if (hasWarfarin && hasAspirin) {
      outcome = "FLAGGED";
      alerts.push({
        id: `alert_${Date.now()}`,
        ruleId: "ILLUSTRATIVE-DDI-001",
        ruleVersion: 1,
        severity: "MODERATE",
        status: "OPEN",
        rationale:
          "Concomitant use of Warfarin (anticoagulant) and Aspirin (antiplatelet agent) significantly increases the risk of severe gastrointestinal and systemic bleeding.",
        limitations: [
          "Illustrative rule set; not clinically validated",
          "Synthetic demonstration dataset only",
          "Small dataset coverage",
        ],
        evidenceReferences: [
          {
            sourceId: "SRC-NFI-2026",
            title: "National Formulary of India (NFI) — Antithrombotic Interactions",
            publisher: "Indian Pharmacopoeia Commission (IPC)",
            url: "https://ipc.gov.in/mandates/nfi.html",
            locator: "Section 10.2: Antithrombotic Agents",
            licenseStatus: "VERIFIED",
            evidenceStrength: "HIGH",
          },
        ],
      });
      c.status = "CHECK_FLAGGED";
    } else {
      outcome = "NO_MATCHING_RULE";
      c.status = "CHECK_PASSED";
    }

    const checkResult: CheckEnvelope = {
      data: {
        id: `chk_${Date.now()}`,
        outcome,
        ruleSetVersion: "v1.0.0-illustrative",
        subjectId: caseId,
        subjectVersion: c.currentRevisionNumber,
        createdAt: new Date().toISOString(),
        limitations: [
          "Illustrative rule set; not clinically validated",
          "Synthetic demonstration dataset only",
        ],
        alerts,
        coverageByCategory: {
          drugDrug: {
            status: outcome === "FLAGGED" ? "EVALUATED_WITH_MATCHES" : "NO_MATCHING_SEEDED_RULE",
            limitation:
              outcome === "FLAGGED"
                ? "1 illustrative drug-drug interaction rule matched."
                : "No matching seeded rule found for active medicines.",
            evaluatedInputsCount: c.items.length,
          },
          allergy: {
            status: "NO_MATCHING_SEEDED_RULE",
            limitation: "No matching allergen detected against confirmed patient allergy profile.",
            evaluatedInputsCount: c.items.length,
          },
          foodDrink: {
            status: "NOT_EVALUATED",
            limitation: "Food/drink interaction evaluation not supported in current illustrative ruleset.",
          },
        },
      },
    };

    c.checkResult = checkResult;
    c.alerts = alerts;
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
    return checkResult;
  }

  // Doctor Tasks & Disposition
  async recordDisposition(
    alertId: string,
    dispositionType: "CHANGE_REQUIRED" | "CLINICALLY_REVIEWED" | "OTHER_DOCUMENTED",
    rationale: string
  ): Promise<void> {
    const cases = Array.from(this.activeCases.values());
    for (const c of cases) {
      const alert = c.alerts?.find((a: AlertSummary) => a.id === alertId);
      if (alert) {
        alert.status = dispositionType === "CHANGE_REQUIRED" ? "CHANGE_REQUIRED" : "CLINICAL_DISPOSITION_RECORDED";
        alert.rationale = rationale;
        if (dispositionType === "CHANGE_REQUIRED") {
          c.status = "DOCTOR_REVIEW";
        } else {
          c.status = "CHECK_PASSED";
        }
        c.updatedAt = new Date().toISOString();
        this.activeCases.set(c.id, c);
        return;
      }
    }
  }

  // Prescription Revision Creation
  async createRevision(
    caseId: string,
    prescribedItems: PrescriptionItem[],
    changeReason: string
  ): Promise<FixtureCase> {
    const c = await this.getCase(caseId);
    const newRevNum = c.currentRevisionNumber + 1;
    const newRev: PrescriptionRevision = {
      id: `rev_${newRevNum}_${caseId}`,
      revisionNumber: newRevNum,
      createdAt: new Date().toISOString(),
      items: prescribedItems,
    };
    c.revisions.push(newRev);
    c.currentRevisionNumber = newRevNum;
    c.items = prescribedItems;
    c.status = "REVISED";
    c.alerts = []; // Reset alerts for new revision check
    c.checkResult = undefined;
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
    return c;
  }

  // Dispensing Authorization Gate
  async authorizeDispensing(caseId: string, expectedVersion: number): Promise<void> {
    const c = await this.getCase(caseId);
    // Gate validation
    if (c.currentRevisionNumber !== expectedVersion) {
      const err = new Error("Stale revision version detected. Reload and review latest version.");
      (err as unknown as { code: string; requestId: string }).code = "CONFLICT";
      (err as unknown as { code: string; requestId: string }).requestId = "req_mock_disp_409";
      throw err;
    }
    if (c.alerts && c.alerts.some((a) => a.status === "OPEN" || a.status === "CHANGE_REQUIRED")) {
      const err = new Error("Cannot authorize dispensing with unresolved clinical alerts.");
      (err as unknown as { code: string; requestId: string }).code = "INVALID_STATE_TRANSITION";
      (err as unknown as { code: string; requestId: string }).requestId = "req_mock_disp_alerts_open";
      throw err;
    }
    if (!c.checkResult || c.checkResult.data.outcome !== "NO_MATCHING_RULE") {
      const err = new Error("Cannot authorize dispensing: Check outcome must be verified clear.");
      (err as unknown as { code: string; requestId: string }).code = "INVALID_STATE_TRANSITION";
      (err as unknown as { code: string; requestId: string }).requestId = "req_mock_disp_check_invalid";
      throw err;
    }

    c.status = "DISPENSING_AUTHORIZED";
    c.dispensingAuthorization = {
      authorizedAt: new Date().toISOString(),
      authorizedBy: this.currentUser?.displayName || "Priya Sharma, RPh",
      expectedVersion,
    };
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
  }

  // Admin Operations
  async getMemberships() {
    return this.memberships;
  }

  async updateMembershipStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "REVOKED", role?: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN") {
    const mem = this.memberships.find((m) => m.id === id);
    if (mem) {
      mem.status = status;
      if (role) mem.role = role;
    }
  }

  async resetDemoWorkspace(): Promise<void> {
    this.activeCases.clear();
    this.activeCases.set(INITIAL_FIXTURE_CASE.id, JSON.parse(JSON.stringify(INITIAL_FIXTURE_CASE)));
    this.patient = { ...FIXTURE_PATIENT };
    this.switchPersona("PHARMACIST");
  }
}

export const mockEngine = new MockEngine();
