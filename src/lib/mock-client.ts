import {
  FIXTURE_HOSPITAL,
  FIXTURE_USERS,
  FIXTURE_PATIENT,
  FIXTURE_PATIENTS,
  FIXTURE_CATALOGUE,
  INITIAL_FIXTURE_CASE,
  INITIAL_PRESCRIPTION_ITEMS,
  INITIAL_FIXTURE_APPOINTMENTS,
  INITIAL_FIXTURE_NOTIFICATIONS,
  INITIAL_MEDICATION_ORDERS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_RULE_SETS,
  INITIAL_PATIENT_ALLERGIES,
  INITIAL_PATIENT_MED_HISTORY,
  type FixtureCase,
  type FixtureUser,
  type PatientRecord,
  type AppointmentRecord,
  type FixtureNotification,
} from "./mock-data/fixtures";
import type {
  CurrentUserResponse,
  MedicineCandidate,
  PrescriptionItem,
  PrescriptionRevision,
  CheckEnvelope,
  AlertSummary,
  Hospital,
  InpatientMedicationOrder,
  InpatientMedicationOrderItem,
  MedicationOrderVersion,
  AuditEvent,
  ClinicalRuleSet,
  ClinicalRule,
  PatientAllergy,
  PatientMedicationHistoryItem,
  MedicationOrderStatus,
  UserRole,
} from "@/types";

const STORAGE_KEY = "pharmavigil_demo_state";

interface PersistedState {
  activeCases: Array<[string, FixtureCase]>;
  memberships: Array<{
    id: string;
    userId: string;
    displayName: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED";
    createdAt: string;
  }>;
  appointments: AppointmentRecord[];
  notifications: FixtureNotification[];
  medicationOrders?: InpatientMedicationOrder[];
  auditEvents?: AuditEvent[];
  allergies?: PatientAllergy[];
  medicationHistory?: PatientMedicationHistoryItem[];
}

class MockEngine {
  private currentUser: FixtureUser | null = null;
  private hospital: Hospital = { ...FIXTURE_HOSPITAL };
  private patient: PatientRecord = { ...FIXTURE_PATIENT };
  private patients: PatientRecord[] = [...FIXTURE_PATIENTS];
  private activeCases: Map<string, FixtureCase>;
  private memberships: Array<{
    id: string;
    userId: string;
    displayName: string;
    email: string;
    role: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED";
    createdAt: string;
  }>;
  private appointments: AppointmentRecord[];
  private notifications: FixtureNotification[];
  private medicationOrders: InpatientMedicationOrder[];
  private auditEvents: AuditEvent[];
  private ruleSets: ClinicalRuleSet[];
  private allergies: PatientAllergy[];
  private medicationHistory: PatientMedicationHistoryItem[];

  constructor() {
    const loaded = this.loadFromStorage();
    if (loaded) {
      this.activeCases = new Map(loaded.activeCases);
      this.memberships = loaded.memberships;
      this.appointments = loaded.appointments;
      this.notifications =
        loaded.notifications ||
        JSON.parse(JSON.stringify(INITIAL_FIXTURE_NOTIFICATIONS));
      this.medicationOrders =
        loaded.medicationOrders ||
        JSON.parse(JSON.stringify(INITIAL_MEDICATION_ORDERS));
      this.auditEvents =
        loaded.auditEvents || JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));
      this.ruleSets = JSON.parse(JSON.stringify(INITIAL_RULE_SETS));
      this.allergies =
        loaded.allergies ||
        JSON.parse(JSON.stringify(INITIAL_PATIENT_ALLERGIES));
      this.medicationHistory =
        loaded.medicationHistory ||
        JSON.parse(JSON.stringify(INITIAL_PATIENT_MED_HISTORY));
    } else {
      this.activeCases = new Map([
        [
          INITIAL_FIXTURE_CASE.id,
          JSON.parse(JSON.stringify(INITIAL_FIXTURE_CASE)),
        ],
      ]);
      this.notifications = JSON.parse(
        JSON.stringify(INITIAL_FIXTURE_NOTIFICATIONS),
      );
      this.medicationOrders = JSON.parse(
        JSON.stringify(INITIAL_MEDICATION_ORDERS),
      );
      this.auditEvents = JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));
      this.ruleSets = JSON.parse(JSON.stringify(INITIAL_RULE_SETS));
      this.allergies = JSON.parse(JSON.stringify(INITIAL_PATIENT_ALLERGIES));
      this.medicationHistory = JSON.parse(
        JSON.stringify(INITIAL_PATIENT_MED_HISTORY),
      );
      this.memberships = [
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
      this.appointments = [...INITIAL_FIXTURE_APPOINTMENTS];
    }
  }

  private loadFromStorage(): PersistedState | null {
    if (typeof window === "undefined") return null;
    try {
      const serialized = sessionStorage.getItem(STORAGE_KEY);
      if (serialized) {
        return JSON.parse(serialized) as PersistedState;
      }
    } catch {
      // storage unavailable
    }
    return null;
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      const state: PersistedState = {
        activeCases: Array.from(this.activeCases.entries()),
        memberships: this.memberships,
        appointments: this.appointments,
        notifications: this.notifications,
        medicationOrders: this.medicationOrders,
        auditEvents: this.auditEvents,
        allergies: this.allergies,
        medicationHistory: this.medicationHistory,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota or disabled
    }
  }

  // Auth Operations
  async login(email: string, password?: string): Promise<CurrentUserResponse> {
    const raw = email.trim().toLowerCase();
    const aliasMap: Record<string, string> = {
      doctor: "doctor@metro-general.invalid",
      "doctor@pharmavigil.health": "doctor@metro-general.invalid",
      "dr. arvind patel": "doctor@metro-general.invalid",
      pharmacist: "pharma@metro-general.invalid",
      pharma: "pharma@metro-general.invalid",
      "pharmacist@pharmavigil.health": "pharma@metro-general.invalid",
      "priya sharma": "pharma@metro-general.invalid",
      patient: "patient@metro-general.invalid",
      "patient@pharmavigil.health": "patient@metro-general.invalid",
      "rajan sharma": "patient@metro-general.invalid",
      "p-9021": "patient@metro-general.invalid",
      admin: "admin@metro-general.invalid",
      "admin@pharmavigil.health": "admin@metro-general.invalid",
      "sunita verma": "admin@metro-general.invalid",
    };
    const targetEmail = aliasMap[raw] || raw;
    const user = FIXTURE_USERS[targetEmail];
    if (!user) {
      // Check if user is a dynamically registered pending applicant
      const dynMem = this.memberships.find(
        (m) => m.email.toLowerCase() === email.toLowerCase(),
      );
      if (dynMem) {
        this.currentUser = {
          id: dynMem.userId,
          email: dynMem.email,
          displayName: dynMem.displayName,
          role: dynMem.role,
          accountStatus: dynMem.status === "ACTIVE" ? "ACTIVE" : "PENDING",
          membershipStatus: dynMem.status === "ACTIVE" ? "ACTIVE" : "PENDING",
        };
        return this.getCurrentUser();
      }

      const err = new Error("Invalid email or password");
      (err as unknown as { code: string; requestId: string }).code =
        "UNAUTHENTICATED";
      (err as unknown as { code: string; requestId: string }).requestId =
        "req_mock_auth_fail";
      throw err;
    }

    // Password validation guardrail
    if (password !== undefined) {
      const validPasswords = [
        "DemoPassword123!",
        "Password123!",
        "DoctorSecure2026!",
        "PharmaSecure2026!",
        "PatientSecure2026!",
        "AdminSecure2026!",
      ];
      if (!validPasswords.includes(password)) {
        const err = new Error("Invalid email or password");
        (err as unknown as { code: string; requestId: string }).code =
          "UNAUTHENTICATED";
        (err as unknown as { code: string; requestId: string }).requestId =
          "req_mock_bad_password";
        throw err;
      }
    }

    this.currentUser = user;
    return this.getCurrentUser();
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  restoreSession(userId: string, role?: UserRole): void {
    const found = Object.values(FIXTURE_USERS).find((u) => u.id === userId);
    if (found) {
      this.currentUser = found;
      return;
    }
    if (role) {
      this.switchPersona(role);
    }
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    if (!this.currentUser) {
      const err = new Error("No active session found.");
      (err as unknown as { code: string; requestId: string }).code =
        "UNAUTHENTICATED";
      (err as unknown as { code: string; requestId: string }).requestId =
        "req_mock_no_session";
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
  switchPersona(
    role: "PHARMACIST" | "DOCTOR" | "PATIENT" | "HOSPITAL_ADMIN",
  ): void {
    const emailMap: Record<string, string> = {
      PHARMACIST: "pharma@metro-general.invalid",
      DOCTOR: "doctor@metro-general.invalid",
      PATIENT: "patient@metro-general.invalid",
      HOSPITAL_ADMIN: "admin@metro-general.invalid",
    };
    this.currentUser = FIXTURE_USERS[emailMap[role]];
  }

  async registerApplicant(applicant: {
    displayName: string;
    email: string;
    password?: string;
    requestedRole: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
  }): Promise<{ id: string; status: "PENDING" }> {
    const newId = `usr_${Date.now()}`;
    const newMem = {
      id: `mem_${newId}`,
      userId: newId,
      displayName: applicant.displayName,
      email: applicant.email.toLowerCase(),
      role: applicant.requestedRole,
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
    };
    this.memberships.unshift(newMem);
    this.saveToStorage();
    return { id: newMem.id, status: "PENDING" };
  }

  // Patient Operations
  async searchPatients(query: string): Promise<PatientRecord[]> {
    if (!query) return this.patients;
    const q = query.toLowerCase().trim();
    return this.patients.filter(
      (p) =>
        p.syntheticHospitalPatientId.toLowerCase().includes(q) ||
        (p.displayName && p.displayName.toLowerCase().includes(q)) ||
        (p.contactPhone && p.contactPhone.toLowerCase().includes(q)),
    );
  }

  async getPatient(id: string): Promise<PatientRecord> {
    const p = this.patients.find(
      (pat) => pat.id === id || pat.syntheticHospitalPatientId === id,
    );
    if (p) return p;
    const err = new Error(`Patient ${id} not found.`);
    (err as unknown as { code: string; requestId: string }).code = "NOT_FOUND";
    (err as unknown as { code: string; requestId: string }).requestId =
      "req_mock_pat_404";
    throw err;
  }

  // Catalogue Operations
  async searchCatalogue(query: string): Promise<MedicineCandidate[]> {
    if (!query) return FIXTURE_CATALOGUE;
    const q = query.toLowerCase();
    return FIXTURE_CATALOGUE.filter(
      (m) =>
        (m.displayName && m.displayName.toLowerCase().includes(q)) ||
        m.canonicalIngredientIds.some((ing) => ing.toLowerCase().includes(q)),
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
      (err as unknown as { code: string; requestId: string }).code =
        "NOT_FOUND";
      (err as unknown as { code: string; requestId: string }).requestId =
        "req_mock_case_404";
      throw err;
    }
    return JSON.parse(JSON.stringify(c));
  }

  async createCapture(
    patientId: string,
    rawText: string,
  ): Promise<FixtureCase> {
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
    this.saveToStorage();
    return newCase;
  }

  async updateExtractedText(
    caseId: string,
    lines: Array<{ id: number; text: string; confidence: number }>,
  ): Promise<FixtureCase> {
    const c = await this.getCase(caseId);
    c.extractedRawText = lines.map((l) => l.text).join("\n");
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
    this.saveToStorage();
    return c;
  }

  async confirmMedicines(
    caseId: string,
    items: PrescriptionItem[],
  ): Promise<FixtureCase> {
    const c = await this.getCase(caseId);
    c.items = items;
    c.status = "MEDICINES_CONFIRMED";
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
    this.saveToStorage();
    return c;
  }

  async runCheck(caseId: string): Promise<CheckEnvelope> {
    const c = await this.getCase(caseId);
    // Determine outcome based on items
    const hasWarfarin = c.items.some(
      (i) =>
        i.canonicalIngredientIds.some((ing) =>
          ing.toLowerCase().includes("warfarin"),
        ) ||
        (i.rawExtractedText &&
          i.rawExtractedText.toLowerCase().includes("warfarin")),
    );
    const hasAspirin = c.items.some(
      (i) =>
        i.canonicalIngredientIds.some((ing) =>
          ing.toLowerCase().includes("aspirin"),
        ) ||
        (i.rawExtractedText &&
          i.rawExtractedText.toLowerCase().includes("aspirin")),
    );

    let outcome: CheckEnvelope["data"]["outcome"] = "NO_MATCHING_RULE";
    const alerts: AlertSummary[] = [];

    if (hasWarfarin && hasAspirin) {
      outcome = "FLAGGED";
      alerts.push({
        id: `alert_${Date.now()}`,
        ruleId: "ILLUSTRATIVE-DDI-001",
        ruleVersion: 1,
        severity: "CRITICAL",
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
            title:
              "National Formulary of India (NFI) — Antithrombotic Interactions",
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
            status:
              outcome === "FLAGGED"
                ? "EVALUATED_WITH_MATCHES"
                : "NO_MATCHING_SEEDED_RULE",
            limitation:
              outcome === "FLAGGED"
                ? "1 illustrative drug-drug interaction rule matched."
                : "No matching seeded rule found for active medicines.",
            evaluatedInputsCount: c.items.length,
          },
          allergy: {
            status: "NO_MATCHING_SEEDED_RULE",
            limitation:
              "No matching allergen detected against confirmed patient allergy profile.",
            evaluatedInputsCount: c.items.length,
          },
          foodDrink: {
            status: "NOT_EVALUATED",
            limitation:
              "Food/drink interaction evaluation not supported in current illustrative ruleset.",
          },
        },
      },
    };

    c.checkResult = checkResult;
    c.alerts = alerts;
    c.updatedAt = new Date().toISOString();
    this.activeCases.set(caseId, c);
    this.saveToStorage();
    return checkResult;
  }

  // Doctor Tasks & Disposition
  async recordDisposition(
    alertId: string,
    dispositionType:
      "CHANGE_REQUIRED" | "CLINICALLY_REVIEWED" | "OTHER_DOCUMENTED",
    rationale: string,
  ): Promise<void> {
    const cases = Array.from(this.activeCases.values());
    for (const c of cases) {
      const alert = c.alerts?.find((a: AlertSummary) => a.id === alertId);
      if (alert) {
        alert.status =
          dispositionType === "CHANGE_REQUIRED"
            ? "CHANGE_REQUIRED"
            : "CLINICAL_DISPOSITION_RECORDED";
        alert.rationale = rationale;
        if (dispositionType === "CHANGE_REQUIRED") {
          c.status = "DOCTOR_REVIEW";
        } else {
          c.status = "CHECK_PASSED";
        }
        c.updatedAt = new Date().toISOString();
        this.activeCases.set(c.id, c);
        this.saveToStorage();
        return;
      }
    }
  }

  // Prescription Revision Creation
  async createRevision(
    caseId: string,
    prescribedItems: PrescriptionItem[],
    changeReason: string,
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
    this.saveToStorage();
    return c;
  }

  // Dispensing Authorization Gate
  async authorizeDispensing(
    caseId: string,
    expectedVersion: number,
  ): Promise<void> {
    const c = await this.getCase(caseId);
    // Gate validation
    if (c.currentRevisionNumber !== expectedVersion) {
      const err = new Error(
        "Stale revision version detected. Reload and review latest version.",
      );
      (err as unknown as { code: string; requestId: string }).code = "CONFLICT";
      (err as unknown as { code: string; requestId: string }).requestId =
        "req_mock_disp_409";
      throw err;
    }
    if (
      c.alerts &&
      c.alerts.some(
        (a) => a.status === "OPEN" || a.status === "CHANGE_REQUIRED",
      )
    ) {
      const err = new Error(
        "Cannot authorize dispensing with unresolved clinical alerts.",
      );
      (err as unknown as { code: string; requestId: string }).code =
        "INVALID_STATE_TRANSITION";
      (err as unknown as { code: string; requestId: string }).requestId =
        "req_mock_disp_alerts_open";
      throw err;
    }
    if (!c.checkResult || c.checkResult.data.outcome !== "NO_MATCHING_RULE") {
      const err = new Error(
        "Cannot authorize dispensing: Check outcome must be verified clear.",
      );
      (err as unknown as { code: string; requestId: string }).code =
        "INVALID_STATE_TRANSITION";
      (err as unknown as { code: string; requestId: string }).requestId =
        "req_mock_disp_check_invalid";
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
    this.saveToStorage();
  }

  // Admin Operations
  async getMemberships() {
    return this.memberships;
  }

  async updateMembershipStatus(
    id: string,
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED",
    role?: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN",
  ) {
    const mem = this.memberships.find((m) => m.id === id);
    if (mem) {
      mem.status = status;
      if (role) mem.role = role;
      this.saveToStorage();
    }
  }

  // Appointment Operations
  async listAppointments(filter?: {
    patientId?: string;
    clinicianId?: string;
  }): Promise<AppointmentRecord[]> {
    let result = [...this.appointments];
    if (filter?.patientId) {
      const pid = filter.patientId;
      result = result.filter(
        (a) => a.patientId === pid || a.patientDisplayName.includes(pid),
      );
    }
    if (filter?.clinicianId) {
      result = result.filter((a) => a.clinicianUserId === filter.clinicianId);
    }
    return result;
  }

  async createAppointment(data: {
    patientId: string;
    patientDisplayName: string;
    clinicianUserId: string;
    clinicianDisplayName: string;
    department: string;
    slotStart: string;
    slotEnd: string;
    reason: string;
  }): Promise<AppointmentRecord> {
    const newApt: AppointmentRecord = {
      id: `apt_${Date.now()}`,
      hospitalId: this.hospital.id,
      patientId: data.patientId,
      patientDisplayName: data.patientDisplayName,
      clinicianUserId: data.clinicianUserId,
      clinicianDisplayName: data.clinicianDisplayName,
      department: data.department,
      slotStart: data.slotStart,
      slotEnd: data.slotEnd,
      status: "SCHEDULED",
      reason: data.reason,
    };
    this.appointments.unshift(newApt);
    this.saveToStorage();
    return newApt;
  }

  async cancelAppointment(appointmentId: string): Promise<AppointmentRecord> {
    const target = this.appointments.find((a) => a.id === appointmentId);
    if (!target) {
      const err = new Error(`Appointment ${appointmentId} not found.`);
      (err as unknown as { code: string; requestId: string }).code =
        "NOT_FOUND";
      throw err;
    }
    target.status = "CANCELLED";
    this.saveToStorage();
    return target;
  }

  // Notification Operations
  async getNotifications(unreadOnly = false): Promise<FixtureNotification[]> {
    const currentUserId = this.currentUser?.id;
    const currentRole = this.currentUser?.role;

    let list = this.notifications.filter((n) => {
      if (currentUserId && n.recipientUserId === currentUserId) return true;
      if (currentRole && n.role === currentRole) return true;
      return false;
    });

    if (list.length === 0) {
      list = [...this.notifications];
    }

    if (unreadOnly) {
      list = list.filter((n) => !n.read);
    }

    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async markNotificationRead(id: string): Promise<void> {
    const target = this.notifications.find((n) => n.id === id);
    if (!target) {
      const err = new Error(`Notification ${id} not found.`);
      (err as unknown as { code: string; requestId: string }).code =
        "NOT_FOUND";
      throw err;
    }
    target.read = true;
    this.saveToStorage();
  }

  async resetDemoWorkspace(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    this.activeCases.clear();
    this.activeCases.set(
      INITIAL_FIXTURE_CASE.id,
      JSON.parse(JSON.stringify(INITIAL_FIXTURE_CASE)),
    );
    this.patient = { ...FIXTURE_PATIENT };
    this.patients = [...FIXTURE_PATIENTS];
    this.appointments = [...INITIAL_FIXTURE_APPOINTMENTS];
    this.notifications = JSON.parse(
      JSON.stringify(INITIAL_FIXTURE_NOTIFICATIONS),
    );
    this.medicationOrders = JSON.parse(
      JSON.stringify(INITIAL_MEDICATION_ORDERS),
    );
    this.auditEvents = JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));
    this.ruleSets = JSON.parse(JSON.stringify(INITIAL_RULE_SETS));
    this.allergies = JSON.parse(JSON.stringify(INITIAL_PATIENT_ALLERGIES));
    this.medicationHistory = JSON.parse(
      JSON.stringify(INITIAL_PATIENT_MED_HISTORY),
    );
    this.memberships = [
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
    this.switchPersona("PHARMACIST");
  }

  // Hospital Tenancy
  async getCurrentHospital(): Promise<Hospital> {
    return { ...this.hospital };
  }

  // Inpatient Medication Orders
  async listMedicationOrders(filter?: {
    patientId?: string;
    status?: string;
    limit?: number;
  }): Promise<InpatientMedicationOrder[]> {
    let list = [...this.medicationOrders];
    if (filter?.patientId) {
      const q = filter.patientId.toLowerCase();
      list = list.filter(
        (o) =>
          o.patientId.toLowerCase().includes(q) ||
          o.patientName?.toLowerCase().includes(q),
      );
    }
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((o) => o.status === filter.status);
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  async getMedicationOrder(id: string): Promise<{
    order: InpatientMedicationOrder;
    versions?: MedicationOrderVersion[];
  }> {
    const order = this.medicationOrders.find(
      (o) => o.id === id || o.orderId === id,
    );
    if (!order) {
      const err = new Error(`Medication order ${id} not found.`);
      (err as unknown as { code: string; requestId: string }).code =
        "NOT_FOUND";
      throw err;
    }
    return {
      order,
      versions: order.versions || [],
    };
  }

  async createMedicationOrder(data: {
    patientId: string;
    items: InpatientMedicationOrderItem[];
    notes?: string;
    ward?: string;
    bed?: string;
    scheduleFrequency?: string;
    route?: string;
  }): Promise<InpatientMedicationOrder> {
    if (!data.patientId) {
      throw new Error("patientId is required");
    }
    if (!data.items || data.items.length === 0) {
      throw new Error("At least 1 medication order item is required");
    }

    const patient = this.patients.find(
      (p) =>
        p.syntheticHospitalPatientId === data.patientId ||
        p.id === data.patientId,
    );
    const patientName =
      patient?.displayName ||
      (data.patientId === "P-9021" ? "Rajan Sharma" : "Inpatient Patient");
    const orderId = `ord_inpatient_${Date.now()}`;
    const now = new Date().toISOString();

    const newOrder: InpatientMedicationOrder = {
      id: orderId,
      orderId,
      patientId: data.patientId,
      patientName,
      orderingDoctorId: this.currentUser?.id || "usr_doctor_01",
      orderingDoctorName:
        this.currentUser?.displayName || "Dr. Arvind Patel, MD",
      currentVersionNumber: 1,
      status: "ACTIVE",
      ward: data.ward || "Cardiology Ward 4B",
      bed: data.bed || "Bed 12",
      scheduleFrequency:
        data.scheduleFrequency || data.items[0]?.frequency || "Q8H",
      route: data.route || data.items[0]?.route || "INTRAVENOUS",
      startDate: now,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
      items: data.items,
      versions: [
        {
          id: `ver_${orderId}_1`,
          orderId,
          versionNumber: 1,
          items: data.items,
          changeReason: "Initial inpatient order prescribed",
          createdBy: this.currentUser?.displayName || "Dr. Arvind Patel, MD",
          createdAt: now,
        },
      ],
    };

    this.medicationOrders.unshift(newOrder);

    this.auditEvents.unshift({
      id: `aud_evt_${Date.now()}`,
      timestamp: now,
      actorUserId: this.currentUser?.id || "usr_doctor_01",
      actorDisplayName: this.currentUser?.displayName || "Dr. Arvind Patel, MD",
      actorRole: this.currentUser?.role || "DOCTOR",
      action: "CREATE_MEDICATION_ORDER",
      resourceType: "MedicationOrder",
      resourceId: orderId,
      requestId: `req_${Date.now().toString(36)}`,
      ipAddress: "10.0.12.44",
      metadata: {
        patientId: data.patientId,
        itemCount: data.items.length,
        ward: data.ward,
        scheduleFrequency: data.scheduleFrequency,
      },
    });

    this.saveToStorage();
    return newOrder;
  }

  async updateMedicationOrderStatus(
    id: string,
    status: MedicationOrderStatus,
  ): Promise<InpatientMedicationOrder> {
    const target = this.medicationOrders.find(
      (o) => o.id === id || o.orderId === id,
    );
    if (!target) {
      const err = new Error(`Medication order ${id} not found.`);
      (err as unknown as { code: string; requestId: string }).code =
        "NOT_FOUND";
      throw err;
    }
    target.status = status;
    target.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return target;
  }

  // Audit Events
  async listAuditEvents(filter?: {
    resourceType?: string;
    actorUserId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<AuditEvent[]> {
    let list = [...this.auditEvents];
    if (filter?.resourceType && filter.resourceType !== "ALL") {
      list = list.filter(
        (e) =>
          e.resourceType.toLowerCase() === filter.resourceType!.toLowerCase(),
      );
    }
    if (filter?.actorUserId) {
      const q = filter.actorUserId.toLowerCase();
      list = list.filter(
        (e) =>
          e.actorUserId.toLowerCase().includes(q) ||
          e.actorDisplayName?.toLowerCase().includes(q),
      );
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  // Clinical Rule Sets
  async getCurrentRuleSet(): Promise<ClinicalRuleSet> {
    const published =
      this.ruleSets.find((r) => r.status === "PUBLISHED") || this.ruleSets[0];
    return JSON.parse(JSON.stringify(published));
  }

  async listRuleSets(filter?: {
    status?: string;
    limit?: number;
  }): Promise<ClinicalRuleSet[]> {
    let list = [...this.ruleSets];
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  // Patient Self-Reporting
  async getAllergies(patientId: string): Promise<PatientAllergy[]> {
    return this.allergies.filter((a) => a.patientId === patientId);
  }

  async addAllergy(
    patientId: string,
    data: Partial<PatientAllergy>,
  ): Promise<PatientAllergy> {
    if (!data.substanceText || !data.substanceText.trim()) {
      throw new Error("Substance text is required");
    }
    const now = new Date().toISOString();
    const newAllergy: PatientAllergy = {
      id: `alg_${Date.now()}`,
      patientId,
      substanceText: data.substanceText.trim(),
      recordType: data.recordType || "ALLERGY",
      reactionDescription: data.reactionDescription || "",
      severity: data.severity || "MILD",
      sourceType: "PATIENT_REPORTED",
      verificationStatus: "REPORTED",
      recordedAt: now,
      createdAt: now,
    };
    this.allergies.unshift(newAllergy);
    this.saveToStorage();
    return newAllergy;
  }

  async getMedicationHistory(
    patientId: string,
  ): Promise<PatientMedicationHistoryItem[]> {
    return this.medicationHistory.filter((m) => m.patientId === patientId);
  }

  async addMedicationHistory(
    patientId: string,
    data: Partial<PatientMedicationHistoryItem>,
  ): Promise<PatientMedicationHistoryItem> {
    if (!data.medicineName || !data.medicineName.trim()) {
      throw new Error("Medicine name is required");
    }
    const now = new Date().toISOString();
    const newMed: PatientMedicationHistoryItem = {
      id: `medhist_${Date.now()}`,
      patientId,
      medicineName: data.medicineName.trim(),
      dose: data.dose || "1",
      unit: data.unit || "dose",
      route: data.route || "ORAL",
      frequency: data.frequency || "ONCE_DAILY",
      status: data.status || "ACTIVE",
      startDate: data.startDate || now,
      sourceType: "PATIENT_REPORTED",
      verificationStatus: "REPORTED",
      createdAt: now,
    };
    this.medicationHistory.unshift(newMed);
    this.saveToStorage();
    return newMed;
  }
}

export const mockEngine = new MockEngine();
