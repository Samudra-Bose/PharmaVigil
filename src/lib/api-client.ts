import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { mockEngine } from "./mock-client";
import type {
  CurrentUserResponse,
  MedicineCandidate,
  PrescriptionItem,
  CheckEnvelope,
  Hospital,
  Notification,
  RuleSetMetadata,
  InpatientMedicationOrder,
  InpatientMedicationOrderItem,
  MedicationOrderVersion,
  AuditEvent,
  ClinicalRuleSet,
  PatientAllergy,
  PatientMedicationHistoryItem,
  MedicationOrderStatus,
} from "@/types";
import type {
  FixtureCase,
  PatientRecord,
  AppointmentRecord,
} from "./mock-data/fixtures";

const USE_MOCKS = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "false";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787/api/v1";

export interface HospitalMemberRecord {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED";
  createdAt: string;
}

export interface RunCheckParams {
  subjectType?: "PRESCRIPTION_REVISION" | "MEDICATION_ORDER_VERSION";
  subjectId: string;
  subjectVersion?: number;
}

export interface CreateCaptureInput {
  patientId: string;
  captureMode?: "BROWSER_OCR" | "MANUAL_ENTRY" | "SEEDED_IMAGE";
  ocrLanguage?: "eng";
  extractedText?: string;
  rawExtractedText?: string;
  extractedFields?: unknown;
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorUserId?: string;
  clinicianUserId?: string;
  patientDisplayName?: string;
  clinicianDisplayName?: string;
  department?: string;
  startAt?: string;
  slotStart?: string;
  endAt?: string;
  slotEnd?: string;
  reason?: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  subjectId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  recipientUserId?: string;
}

export class ApiClientError extends Error {
  code: string;
  requestId?: string;
  details?: Array<{ field?: string; message: string; code?: string }>;
  statusCode?: number;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    requestId?: string,
    details?: Array<{ field?: string; message: string; code?: string }>,
    statusCode?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export function normalizeAxiosError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  const axiosErr = error as AxiosError<{
    error?: {
      code?: string;
      message?: string;
      requestId?: string;
      details?: Array<{ field?: string; message: string; code?: string }>;
    };
  }>;

  const res = axiosErr?.response;
  const requestId =
    (typeof res?.headers?.get === "function"
      ? (res.headers.get("x-request-id") as string)
      : undefined) ||
    (res?.headers?.["x-request-id"] as string) ||
    res?.data?.error?.requestId;

  if (res?.data?.error) {
    const errData = res.data.error;
    return new ApiClientError(
      errData.message || axiosErr.message || "Request failed",
      errData.code || `HTTP_${res.status}`,
      requestId,
      errData.details,
      res.status,
    );
  }

  if (res) {
    const status = res.status;
    const defaultCodes: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHENTICATED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "VALIDATION_ERROR",
      429: "RATE_LIMITED",
      503: "SERVICE_UNAVAILABLE",
    };
    const code = defaultCodes[status] || `HTTP_${status}`;
    return new ApiClientError(
      res.statusText ||
        axiosErr.message ||
        `Request failed with status ${status}`,
      code,
      requestId,
      undefined,
      status,
    );
  }

  return new ApiClientError(
    axiosErr?.message || "Network connection failed.",
    "NETWORK_FAILURE",
  );
}

export const SESSION_TOKEN_KEY = "pharmavigil_session_token";
export const SESSION_USER_KEY = "pharmavigil_user";
export const SESSION_MEMBERSHIP_KEY = "pharmavigil_membership";

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // Ignore storage quota
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_MEMBERSHIP_KEY);
  } catch {
    // Ignore
  }
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Session Token (Dual Persistence: Bearer & x-session-token headers)
    const storedToken = getStoredSessionToken();
    if (storedToken) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Authorization", `Bearer ${storedToken}`);
        config.headers.set("x-session-token", storedToken);
      } else if (config.headers) {
        config.headers["Authorization"] = `Bearer ${storedToken}`;
        config.headers["x-session-token"] = storedToken;
      }
    }

    // 2. Correlation tracking
    const hasRequestId =
      typeof config.headers?.get === "function"
        ? config.headers.get("x-request-id")
        : config.headers?.["x-request-id"];

    if (!hasRequestId) {
      const uuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      if (typeof config.headers?.set === "function") {
        config.headers.set("x-request-id", uuid);
      } else if (config.headers) {
        config.headers["x-request-id"] = uuid;
      }
    }

    // 3. Dynamic Idempotency-Key for mutations (POST, PUT, PATCH, DELETE)
    const method = config.method?.toUpperCase();
    if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const hasIdempotencyKey =
        typeof config.headers?.get === "function"
          ? config.headers.get("Idempotency-Key")
          : config.headers?.["Idempotency-Key"] ||
            config.headers?.["idempotency-key"];

      if (!hasIdempotencyKey) {
        const timestamp = Date.now();
        const rand = Math.random().toString(36).substring(2, 12);
        const dynamicKey = `idemp_${timestamp}_${rand}`;
        if (typeof config.headers?.set === "function") {
          config.headers.set("Idempotency-Key", dynamicKey);
        } else if (config.headers) {
          config.headers["Idempotency-Key"] = dynamicKey;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(normalizeAxiosError(error)),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Automatically unwrap { data: T } envelope to T
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearStoredSession();
    }
    return Promise.reject(normalizeAxiosError(error));
  },
);

export class ApiClient {
  private isMockMode: boolean = USE_MOCKS;
  public axios: AxiosInstance = axiosInstance;

  constructor(customAxios?: AxiosInstance) {
    if (customAxios) {
      this.axios = customAxios;
    }
  }

  getMockMode(): boolean {
    return this.isMockMode;
  }

  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  // ==========================================
  // Auth API
  // ==========================================
  async login(email: string, password?: string): Promise<CurrentUserResponse> {
    if (this.isMockMode) {
      return mockEngine.login(email);
    }
    const res = await this.post<
      CurrentUserResponse & { token?: string; sessionToken?: string }
    >("/auth/login", { email, password });

    const token = res.token || res.sessionToken;
    if (token) {
      setStoredSessionToken(token);
    }
    if (typeof window !== "undefined" && res.user) {
      try {
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
        const mem =
          res.memberships?.[0] || (res as any).membership;
        if (mem) {
          localStorage.setItem(SESSION_MEMBERSHIP_KEY, JSON.stringify(mem));
        }
      } catch {
        // Ignore
      }
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      if (this.isMockMode) {
        await mockEngine.logout();
      } else {
        await this.post("/auth/logout", {});
      }
    } finally {
      clearStoredSession();
    }
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    if (this.isMockMode) {
      return mockEngine.getCurrentUser();
    }
    const res = await this.get<CurrentUserResponse>("/auth/me");
    if (typeof window !== "undefined" && res.user) {
      try {
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.user));
        const mem =
          res.memberships?.[0] || (res as any).membership;
        if (mem) {
          localStorage.setItem(SESSION_MEMBERSHIP_KEY, JSON.stringify(mem));
        }
      } catch {
        // Ignore
      }
    }
    return res;
  }

  switchDemoRole(
    role: "PHARMACIST" | "DOCTOR" | "PATIENT" | "HOSPITAL_ADMIN",
  ): void {
    mockEngine.switchPersona(role);
  }

  async registerApplicant(applicant: {
    displayName: string;
    email: string;
    password?: string;
    requestedRole: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
    hospitalSlug?: string;
    syntheticHospitalPatientId?: string;
  }): Promise<{
    id?: string;
    userId?: string;
    status?: "PENDING";
    message?: string;
  }> {
    if (this.isMockMode) {
      return mockEngine.registerApplicant(applicant);
    }
    const payload = {
      hospitalSlug: applicant.hospitalSlug || "demo-hospital",
      ...applicant,
    };
    return this.post<{
      id?: string;
      userId?: string;
      status?: "PENDING";
      message?: string;
    }>("/auth/register", payload);
  }

  // ==========================================
  // Patient API
  // ==========================================
  async searchPatients(
    hospitalPatientIdOrQuery: string,
  ): Promise<PatientRecord[]> {
    if (this.isMockMode) {
      return mockEngine.searchPatients(hospitalPatientIdOrQuery);
    }
    return this.get<PatientRecord[]>(
      `/patients/search?hospitalPatientId=${encodeURIComponent(hospitalPatientIdOrQuery)}`,
    );
  }

  async getPatient(id: string): Promise<PatientRecord> {
    if (this.isMockMode) {
      return mockEngine.getPatient(id);
    }
    return this.get<PatientRecord>(`/patients/${id}`);
  }

  async getAllergies(patientId: string): Promise<PatientAllergy[]> {
    if (this.isMockMode) {
      return mockEngine.getAllergies(patientId);
    }
    const res = await this.get<{ data: PatientAllergy[] }>(
      `/patients/${patientId}/allergies`,
    );
    return res.data || [];
  }

  async addAllergy(
    patientId: string,
    allergy: Partial<PatientAllergy>,
  ): Promise<PatientAllergy> {
    if (this.isMockMode) {
      return mockEngine.addAllergy(patientId, allergy);
    }
    return this.post<PatientAllergy>(
      `/patients/${patientId}/allergies`,
      allergy,
    );
  }

  async getMedicationHistory(
    patientId: string,
  ): Promise<PatientMedicationHistoryItem[]> {
    if (this.isMockMode) {
      return mockEngine.getMedicationHistory(patientId);
    }
    const res = await this.get<{ data: PatientMedicationHistoryItem[] }>(
      `/patients/${patientId}/medication-history`,
    );
    return res.data || [];
  }

  async addMedicationHistory(
    patientId: string,
    medHistory: Partial<PatientMedicationHistoryItem>,
  ): Promise<PatientMedicationHistoryItem> {
    if (this.isMockMode) {
      return mockEngine.addMedicationHistory(patientId, medHistory);
    }
    return this.post<PatientMedicationHistoryItem>(
      `/patients/${patientId}/medication-history`,
      medHistory,
    );
  }

  // ==========================================
  // Medicine Catalogue API
  // ==========================================
  async searchCatalogue(
    query: string,
    limit: number = 20,
  ): Promise<MedicineCandidate[]> {
    if (this.isMockMode) {
      return mockEngine.searchCatalogue(query);
    }
    return this.get<MedicineCandidate[]>(
      `/medicine-catalogue/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    );
  }

  // ==========================================
  // Prescriptions & Captures API
  // ==========================================
  async getCases(): Promise<FixtureCase[]> {
    if (this.isMockMode) {
      return mockEngine.getCases();
    }
    return this.get<FixtureCase[]>("/prescriptions");
  }

  async getCase(id: string): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.getCase(id);
    }
    return this.get<FixtureCase>(`/prescription-captures/${id}`);
  }

  async createCapture(
    patientIdOrData: string | CreateCaptureInput,
    rawText?: string,
    mode: "BROWSER_OCR" | "MANUAL_ENTRY" | "SEEDED_IMAGE" = "BROWSER_OCR",
  ): Promise<FixtureCase> {
    if (this.isMockMode) {
      const patientId =
        typeof patientIdOrData === "string"
          ? patientIdOrData
          : patientIdOrData.patientId;
      const text =
        typeof patientIdOrData === "string"
          ? rawText || ""
          : patientIdOrData.extractedText ||
            patientIdOrData.rawExtractedText ||
            "";
      return mockEngine.createCapture(patientId, text);
    }

    const payload =
      typeof patientIdOrData === "string"
        ? {
            patientId: patientIdOrData,
            captureMode: mode,
            ocrLanguage: "eng",
            extractedText: rawText || "",
          }
        : {
            patientId: patientIdOrData.patientId,
            captureMode: patientIdOrData.captureMode || "BROWSER_OCR",
            ocrLanguage: patientIdOrData.ocrLanguage || "eng",
            extractedText:
              patientIdOrData.extractedText ||
              patientIdOrData.rawExtractedText ||
              "",
          };

    return this.post<FixtureCase>("/prescription-captures", payload);
  }

  async confirmMedicines(
    caseId: string,
    itemsOrInput:
      | PrescriptionItem[]
      | { confirmedItems?: PrescriptionItem[]; items?: PrescriptionItem[] },
    expectedVersion: number = 1,
  ): Promise<FixtureCase> {
    const items = Array.isArray(itemsOrInput)
      ? itemsOrInput
      : itemsOrInput.confirmedItems || itemsOrInput.items || [];

    if (this.isMockMode) {
      return mockEngine.confirmMedicines(caseId, items);
    }

    return this.post<FixtureCase>(
      `/prescription-captures/${caseId}/confirm`,
      { patientConfirmed: true, items },
      { "If-Match": String(expectedVersion) },
    );
  }

  async updateExtraction(
    caseId: string,
    updates: { extractedText?: string; items?: any[] },
    expectedVersion: number = 1,
  ): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.getCase(caseId);
    }
    return this.patch<FixtureCase>(
      `/prescription-captures/${caseId}`,
      updates,
      { "If-Match": String(expectedVersion) },
    );
  }

  async updateCapture(
    caseId: string,
    updates: { extractedText?: string; items?: any[] },
    expectedVersion: number = 1,
  ): Promise<FixtureCase> {
    return this.updateExtraction(caseId, updates, expectedVersion);
  }

  async updateExtractedText(
    caseId: string,
    lines: Array<{ id: number; text: string; confidence: number }>,
    expectedVersion: number = 1,
  ): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.updateExtractedText(caseId, lines);
    }
    return this.patch<FixtureCase>(
      `/prescription-captures/${caseId}`,
      { extractedText: lines.map((l) => l.text).join("\n") },
      { "If-Match": String(expectedVersion) },
    );
  }

  // ==========================================
  // Checks & Revisions API
  // ==========================================
  async runCheck(
    target: string | RunCheckParams,
    subjectVersion: number = 1,
  ): Promise<CheckEnvelope> {
    const subjectId = typeof target === "string" ? target : target.subjectId;
    if (this.isMockMode) {
      return mockEngine.runCheck(subjectId);
    }

    const body =
      typeof target === "string"
        ? {
            subjectType: "PRESCRIPTION_REVISION",
            subjectId: target,
            subjectVersion,
          }
        : {
            subjectType: target.subjectType || "PRESCRIPTION_REVISION",
            subjectId: target.subjectId,
            subjectVersion: target.subjectVersion ?? subjectVersion,
          };

    return this.post<CheckEnvelope>("/checks", body);
  }

  async createRevision(
    caseId: string,
    items: PrescriptionItem[],
    changeReason: string,
    expectedVersion: number = 1,
  ): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.createRevision(caseId, items, changeReason);
    }
    return this.post<FixtureCase>(
      `/prescriptions/${caseId}/revisions`,
      { items, changeReason, expectedVersion },
      { "If-Match": String(expectedVersion) },
    );
  }

  async recordDoctorDisposition(
    alertId: string,
    dispositionType:
      | "CHANGE_REQUIRED"
      | "CLINICALLY_REVIEWED"
      | "CLINICAL_DISPOSITION_RECORDED"
      | "OTHER_DOCUMENTED",
    rationale: string,
    expectedVersion: number = 1,
  ): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.recordDisposition(
        alertId,
        dispositionType as any,
        rationale,
      );
    }

    // Normalize CLINICAL_DISPOSITION_RECORDED to CLINICALLY_REVIEWED for OpenAPI contract conformance
    const normalizedType =
      dispositionType === "CLINICAL_DISPOSITION_RECORDED"
        ? "CLINICALLY_REVIEWED"
        : dispositionType;

    await this.post(
      `/alerts/${alertId}/disposition`,
      { dispositionType: normalizedType, rationale },
      { "If-Match": String(expectedVersion) },
    );
  }

  async authorizeDispensing(
    caseId: string,
    expectedVersion: number,
    revisionId?: string,
    checkRunId?: string,
  ): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.authorizeDispensing(caseId, expectedVersion);
    }
    await this.post("/dispensing-authorizations", {
      prescriptionId: caseId,
      prescriptionRevisionId: revisionId || caseId,
      checkRunId: checkRunId || `chk_${caseId}`,
      expectedVersion,
      acknowledgement: "WORKFLOW_REQUIREMENTS_REVIEWED",
    });
  }

  // ==========================================
  // Appointments API
  // ==========================================
  async listAppointments(filter?: {
    patientId?: string;
    clinicianId?: string;
    from?: string;
    to?: string;
  }): Promise<AppointmentRecord[]> {
    if (this.isMockMode) {
      return mockEngine.listAppointments(filter);
    }
    const params = new URLSearchParams();
    if (filter?.patientId) params.append("patientId", filter.patientId);
    if (filter?.clinicianId) params.append("doctorUserId", filter.clinicianId);
    if (filter?.from) params.append("from", filter.from);
    if (filter?.to) params.append("to", filter.to);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return this.get<AppointmentRecord[]>(`/appointments${qs}`);
  }

  async createAppointment(
    data: CreateAppointmentInput,
  ): Promise<AppointmentRecord> {
    if (this.isMockMode) {
      return mockEngine.createAppointment(data as any);
    }
    const payload = {
      patientId: data.patientId,
      doctorUserId: data.doctorUserId || data.clinicianUserId || "",
      startAt: data.startAt || data.slotStart || new Date().toISOString(),
      endAt:
        data.endAt ||
        data.slotEnd ||
        new Date(Date.now() + 30 * 60000).toISOString(),
      reason: data.reason || "General Consultation",
    };
    return this.post<AppointmentRecord>("/appointments", payload);
  }

  async cancelAppointment(
    appointmentId: string,
    expectedVersion: number = 1,
    reason?: string,
  ): Promise<AppointmentRecord> {
    if (this.isMockMode) {
      return mockEngine.cancelAppointment(appointmentId);
    }
    return this.post<AppointmentRecord>(
      `/appointments/${appointmentId}/cancel`,
      { expectedVersion, reason },
      { "If-Match": String(expectedVersion) },
    );
  }

  // ==========================================
  // Admin & Memberships API
  // ==========================================
  async getMemberships(status?: string): Promise<HospitalMemberRecord[]> {
    if (this.isMockMode) {
      return mockEngine.getMemberships();
    }
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.get<HospitalMemberRecord[]>(`/memberships${qs}`);
  }

  async approveMembership(
    membershipId: string,
    options: {
      assignedRole: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
      expectedVersion?: number;
      reason?: string;
    },
  ): Promise<HospitalMemberRecord> {
    if (this.isMockMode) {
      await mockEngine.updateMembershipStatus(
        membershipId,
        "ACTIVE",
        options.assignedRole,
      );
      const members = await mockEngine.getMemberships();
      return members.find((m) => m.id === membershipId)!;
    }
    return this.post<HospitalMemberRecord>(
      `/memberships/${membershipId}/approve`,
      {
        assignedRole: options.assignedRole,
        expectedVersion: options.expectedVersion ?? 0,
        reason: options.reason,
      },
    );
  }

  async rejectMembership(
    membershipId: string,
    options: { expectedVersion?: number; reason?: string } = {},
  ): Promise<{ message: string }> {
    if (this.isMockMode) {
      await mockEngine.updateMembershipStatus(membershipId, "REVOKED");
      return { message: "Membership rejected" };
    }
    return this.post<{ message: string }>(
      `/memberships/${membershipId}/reject`,
      {
        expectedVersion: options.expectedVersion ?? 0,
        reason: options.reason,
      },
    );
  }

  async suspendMembership(
    membershipId: string,
    options: { reason?: string; expectedVersion?: number } = {},
  ): Promise<{ message: string }> {
    if (this.isMockMode) {
      await mockEngine.updateMembershipStatus(membershipId, "SUSPENDED");
      return { message: "Membership suspended" };
    }
    return this.post<{ message: string }>(
      `/memberships/${membershipId}/suspend`,
      {
        reason: options.reason || "Suspended by admin",
        expectedVersion: options.expectedVersion ?? 0,
      },
    );
  }

  async updateMembershipStatus(
    id: string,
    status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED",
    role?: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN",
    expectedVersion: number = 0,
  ) {
    if (this.isMockMode) {
      return mockEngine.updateMembershipStatus(id, status, role);
    }
    if (status === "ACTIVE") {
      return this.approveMembership(id, {
        assignedRole: role || "PATIENT",
        expectedVersion,
      });
    } else if (status === "SUSPENDED") {
      return this.suspendMembership(id, {
        reason: "Suspended by admin",
        expectedVersion,
      });
    } else if (status === "REVOKED") {
      return this.rejectMembership(id, {
        reason: "Revoked by admin",
        expectedVersion,
      });
    }
    throw new ApiClientError(
      `Cannot update membership directly to status ${status}`,
      "INVALID_ACTION",
    );
  }

  // ==========================================
  // Demo Workspace API
  // ==========================================
  async resetDemoWorkspace(
    workspaceId: string = "ws_metro_default",
    confirmation: "RESET_SYNTHETIC_DEMO" = "RESET_SYNTHETIC_DEMO",
  ): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.resetDemoWorkspace();
    }
    await this.post("/demo/reset", { confirmation, workspaceId });
  }

  async seedDemoWorkspace(
    workspaceId: string = "ws_metro_default",
    confirmation: "SEED_SYNTHETIC_DEMO" = "SEED_SYNTHETIC_DEMO",
  ): Promise<void> {
    if (this.isMockMode) {
      return;
    }
    await this.post("/demo/seed", { confirmation, workspaceId });
  }

  // ==========================================
  // Notifications API
  // ==========================================
  async getNotifications(
    unreadOnly: boolean = false,
    cursor?: string,
    limit: number = 20,
  ): Promise<NotificationItem[]> {
    if (this.isMockMode) {
      return mockEngine.getNotifications(unreadOnly);
    }
    const params = new URLSearchParams();
    if (unreadOnly) params.append("unreadOnly", "true");
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", String(limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await this.get<
      { data: NotificationItem[] } | NotificationItem[]
    >(`/notifications${qs}`);
    if (Array.isArray(res)) return res;
    return res.data || [];
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.markNotificationRead(notificationId);
    }
    await this.post(`/notifications/${notificationId}/read`);
  }

  // ==========================================
  // Hospital Tenancy API
  // ==========================================
  async getCurrentHospital(): Promise<Hospital> {
    if (this.isMockMode) {
      return mockEngine.getCurrentHospital();
    }
    return this.get<Hospital>("/hospitals/current");
  }

  // ==========================================
  // Inpatient Medication Orders API
  // ==========================================
  async listMedicationOrders(filter?: {
    patientId?: string;
    status?: string;
    limit?: number;
  }): Promise<InpatientMedicationOrder[]> {
    if (this.isMockMode) {
      return mockEngine.listMedicationOrders(filter);
    }
    const params = new URLSearchParams();
    if (filter?.patientId) params.append("patientId", filter.patientId);
    if (filter?.status && filter.status !== "ALL")
      params.append("status", filter.status);
    if (filter?.limit) params.append("limit", String(filter.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await this.get<any>(`/medication-orders${qs}`);
    return Array.isArray(res) ? res : res?.data || [];
  }

  async getMedicationOrders(filter?: {
    patientId?: string;
    status?: string;
    limit?: number;
  }): Promise<InpatientMedicationOrder[]> {
    return this.listMedicationOrders(filter);
  }

  async getMedicationOrder(id: string): Promise<{
    order: InpatientMedicationOrder;
    versions?: MedicationOrderVersion[];
  }> {
    if (this.isMockMode) {
      return mockEngine.getMedicationOrder(id);
    }
    const res = await this.get<any>(`/medication-orders/${id}`);
    return res?.data ?? res;
  }

  async createMedicationOrder(data: {
    patientId: string;
    items: any[];
    notes?: string;
    ward?: string;
    bed?: string;
    scheduleFrequency?: string;
    route?: string;
  }): Promise<any> {
    if (this.isMockMode) {
      return mockEngine.createMedicationOrder(data as any);
    }
    const res = await this.post<any>("/medication-orders", data);
    return res?.data ?? res;
  }

  async updateMedicationOrderStatus(
    id: string,
    status: MedicationOrderStatus,
  ): Promise<InpatientMedicationOrder> {
    if (this.isMockMode) {
      return mockEngine.updateMedicationOrderStatus(id, status);
    }
    const res = await this.post<any>(`/medication-orders/${id}/status`, {
      status,
    });
    return res?.data ?? res;
  }

  // ==========================================
  // Audit Trail API
  // ==========================================
  async listAuditEvents(filter?: {
    resourceType?: string;
    actorUserId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<AuditEvent[]> {
    if (this.isMockMode) {
      return mockEngine.listAuditEvents(filter);
    }
    const params = new URLSearchParams();
    if (filter?.resourceType && filter.resourceType !== "ALL")
      params.append("resourceType", filter.resourceType);
    if (filter?.actorUserId) params.append("actorUserId", filter.actorUserId);
    if (filter?.limit) params.append("limit", String(filter.limit));
    if (filter?.cursor) params.append("cursor", filter.cursor);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await this.get<any>(`/audit-events${qs}`);
    return Array.isArray(res) ? res : res?.data || [];
  }

  async getAuditEvents(filter?: {
    resourceType?: string;
    actorUserId?: string;
    limit?: number;
    cursor?: string;
  }): Promise<AuditEvent[]> {
    return this.listAuditEvents(filter);
  }

  // ==========================================
  // Clinical Rule Sets API
  // ==========================================
  async getCurrentRuleSet(): Promise<ClinicalRuleSet> {
    if (this.isMockMode) {
      return mockEngine.getCurrentRuleSet();
    }
    const res = await this.get<any>("/rule-sets/current");
    return res?.data ?? res;
  }

  async getRuleSetsCurrent(): Promise<ClinicalRuleSet> {
    return this.getCurrentRuleSet();
  }

  async listRuleSets(filter?: {
    status?: string;
    limit?: number;
  }): Promise<ClinicalRuleSet[]> {
    if (this.isMockMode) {
      return mockEngine.listRuleSets(filter);
    }
    const params = new URLSearchParams();
    if (filter?.status && filter.status !== "ALL")
      params.append("status", filter.status);
    if (filter?.limit) params.append("limit", String(filter.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await this.get<any>(`/rule-sets${qs}`);
    return Array.isArray(res) ? res : res?.data || [];
  }

  // ==========================================
  // Core HTTP Primitives
  // ==========================================
  private async get<T>(
    path: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await this.axios.get<T>(path, { headers });
    return res.data;
  }

  private async post<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await this.axios.post<T>(path, body, { headers });
    return res.data;
  }

  private async patch<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await this.axios.patch<T>(path, body, { headers });
    return res.data;
  }

  private async put<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await this.axios.put<T>(path, body, { headers });
    return res.data;
  }

  private async delete<T>(
    path: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    const res = await this.axios.delete<T>(path, { headers });
    return res.data;
  }
}

export const api = new ApiClient();
