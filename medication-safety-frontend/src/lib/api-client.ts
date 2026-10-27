import { mockEngine } from "./mock-client";
import type {
  CurrentUserResponse,
  MedicineCandidate,
  PrescriptionItem,
  CheckEnvelope,
} from "@/types";
import type { FixtureCase, PatientRecord } from "./mock-data/fixtures";

const USE_MOCKS = process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "false";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787/api/v1";

export interface HospitalMemberRecord {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REVOKED";
  createdAt: string;
}

export class ApiClientError extends Error {
  code: string;
  requestId?: string;
  details?: Array<{ field?: string; message: string }>;

  constructor(message: string, code: string = "INTERNAL_ERROR", requestId?: string, details?: Array<{ field?: string; message: string }>) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

class ApiClient {
  private isMockMode: boolean = USE_MOCKS;

  getMockMode(): boolean {
    return this.isMockMode;
  }

  setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  // Auth API
  async login(email: string, password?: string): Promise<CurrentUserResponse> {
    if (this.isMockMode) {
      return mockEngine.login(email);
    }
    return this.post<CurrentUserResponse>("/auth/login", { email, password });
  }

  async logout(): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.logout();
    }
    await this.post("/auth/logout", {});
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    if (this.isMockMode) {
      return mockEngine.getCurrentUser();
    }
    return this.get<CurrentUserResponse>("/auth/me");
  }

  switchDemoRole(role: "PHARMACIST" | "DOCTOR" | "PATIENT" | "HOSPITAL_ADMIN"): void {
    mockEngine.switchPersona(role);
  }

  // Patient API
  async searchPatients(query: string): Promise<PatientRecord[]> {
    if (this.isMockMode) {
      return mockEngine.searchPatients(query);
    }
    return this.get<PatientRecord[]>(`/patients/search?q=${encodeURIComponent(query)}`);
  }

  async getPatient(id: string): Promise<PatientRecord> {
    if (this.isMockMode) {
      return mockEngine.getPatient(id);
    }
    return this.get<PatientRecord>(`/patients/${id}`);
  }

  // Catalogue API
  async searchCatalogue(query: string): Promise<MedicineCandidate[]> {
    if (this.isMockMode) {
      return mockEngine.searchCatalogue(query);
    }
    return this.get<MedicineCandidate[]>(`/medicine-catalogue/search?q=${encodeURIComponent(query)}`);
  }

  // Prescription Cases API
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

  async createCapture(patientId: string, rawText: string): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.createCapture(patientId, rawText);
    }
    return this.post<FixtureCase>("/prescription-captures", { patientId, rawText });
  }

  async confirmMedicines(caseId: string, items: PrescriptionItem[]): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.confirmMedicines(caseId, items);
    }
    return this.post<FixtureCase>(`/prescription-captures/${caseId}/confirm`, { items });
  }

  async runCheck(caseId: string): Promise<CheckEnvelope> {
    if (this.isMockMode) {
      return mockEngine.runCheck(caseId);
    }
    return this.post<CheckEnvelope>("/checks", { caseId });
  }

  async recordDoctorDisposition(
    alertId: string,
    dispositionType: "CHANGE_REQUIRED" | "CLINICALLY_REVIEWED" | "OTHER_DOCUMENTED",
    rationale: string
  ): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.recordDisposition(alertId, dispositionType, rationale);
    }
    await this.post(`/alerts/${alertId}/disposition`, { dispositionType, rationale });
  }

  async createRevision(
    caseId: string,
    prescribedItems: PrescriptionItem[],
    changeReason: string
  ): Promise<FixtureCase> {
    if (this.isMockMode) {
      return mockEngine.createRevision(caseId, prescribedItems, changeReason);
    }
    return this.post<FixtureCase>(`/prescriptions/${caseId}/revisions`, { items: prescribedItems, changeReason });
  }

  async authorizeDispensing(caseId: string, expectedVersion: number): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.authorizeDispensing(caseId, expectedVersion);
    }
    await this.post("/dispensing-authorizations", {
      prescriptionId: caseId,
      expectedVersion,
      acknowledgement: "WORKFLOW_REQUIREMENTS_REVIEWED",
    });
  }

  // Admin API
  async getMemberships(): Promise<HospitalMemberRecord[]> {
    if (this.isMockMode) {
      return mockEngine.getMemberships();
    }
    return this.get<HospitalMemberRecord[]>("/memberships");
  }

  async updateMembershipStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "REVOKED", role?: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN") {
    if (this.isMockMode) {
      return mockEngine.updateMembershipStatus(id, status, role);
    }
    return this.post(`/memberships/${id}/status`, { status, role });
  }

  async resetDemoWorkspace(): Promise<void> {
    if (this.isMockMode) {
      return mockEngine.resetDemoWorkspace();
    }
    await this.post("/demo/reset", { confirmPhrase: "RESET-DEMO-METRO" });
  }

  // Generic HTTP Helpers
  private async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  private async post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return this.request<T>(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    try {
      const response = await fetch(url, {
        ...init,
        credentials: "include",
      });

      if (!response.ok) {
        let errorData: { error?: { message?: string; code?: string; requestId?: string; details?: Array<{ field?: string; message: string }> } } = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore
        }

        const code = errorData.error?.code || (response.status === 401 ? "UNAUTHENTICATED" : response.status === 403 ? "FORBIDDEN" : response.status === 409 ? "CONFLICT" : `HTTP_${response.status}`);
        const message = errorData.error?.message || response.statusText || `Request failed with status ${response.status}`;
        const requestId = errorData.error?.requestId || response.headers.get("x-request-id") || undefined;
        const details = errorData.error?.details;

        throw new ApiClientError(message, code, requestId, details);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError((err as Error).message || "Network request failed.", "NETWORK_FAILURE");
    }
  }
}

export const api = new ApiClient();
