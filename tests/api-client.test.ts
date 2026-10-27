import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import {
  axiosInstance,
  api,
  ApiClientError,
  normalizeAxiosError,
} from "@/lib/api-client";
import type { PrescriptionItem } from "@/types";

describe("Axios API Client & Contract Reconciliation Suite", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    api.setMockMode(false); // Test live Axios networking logic
  });

  afterEach(() => {
    mock.restore();
    api.setMockMode(true); // Restore mock mode default for other test suites
  });

  describe("1. Core Axios Configuration", () => {
    it("configures the expected baseURL", () => {
      expect(axiosInstance.defaults.baseURL).toMatch(/http:\/\/localhost:8787\/api\/v1/);
    });

    it("enables withCredentials for __Host-vf_session cookie transmission", () => {
      expect(axiosInstance.defaults.withCredentials).toBe(true);
    });
  });

  describe("2. Request Interceptors", () => {
    it("injects x-request-id correlation header if omitted", async () => {
      mock.onGet("/test-endpoint").reply((config) => {
        expect(config.headers?.["x-request-id"]).toBeDefined();
        expect(typeof config.headers?.["x-request-id"]).toBe("string");
        return [200, { data: { success: true } }];
      });

      const res = await axiosInstance.get("/test-endpoint");
      expect(res.data).toEqual({ success: true });
    });

    it("injects dynamic Idempotency-Key on mutation methods (POST)", async () => {
      mock.onPost("/test-post").reply((config) => {
        const idempKey = config.headers?.["Idempotency-Key"];
        expect(idempKey).toBeDefined();
        expect(typeof idempKey).toBe("string");
        expect(idempKey.length).toBeGreaterThanOrEqual(16);
        expect(idempKey.startsWith("idemp_")).toBe(true);
        return [200, { data: { created: true } }];
      });

      const res = await axiosInstance.post("/test-post", { test: 123 });
      expect(res.data).toEqual({ created: true });
    });

    it("preserves explicitly provided Idempotency-Key without overwriting", async () => {
      const customKey = "custom_idempotency_key_123456789";
      mock.onPost("/test-custom-idemp").reply((config) => {
        expect(config.headers?.["Idempotency-Key"]).toBe(customKey);
        return [200, { data: { ok: true } }];
      });

      await axiosInstance.post(
        "/test-custom-idemp",
        { test: 1 },
        { headers: { "Idempotency-Key": customKey } }
      );
    });

    it("does not inject Idempotency-Key on GET requests", async () => {
      mock.onGet("/test-get").reply((config) => {
        expect(config.headers?.["Idempotency-Key"]).toBeUndefined();
        return [200, { data: { list: [] } }];
      });

      await axiosInstance.get("/test-get");
    });
  });

  describe("3. Response Interceptor & Envelope Unwrapping", () => {
    it("unwraps { data: T } envelope to T automatically", async () => {
      mock.onGet("/envelope-test").reply(200, {
        data: { id: "item_123", name: "Amoxicillin" },
      });

      const res = await axiosInstance.get("/envelope-test");
      expect(res.data).toEqual({ id: "item_123", name: "Amoxicillin" });
    });

    it("passes through raw payload if no data envelope exists", async () => {
      mock.onPost("/no-envelope").reply(202, {
        message: "Operation accepted",
      });

      const res = await axiosInstance.post("/no-envelope", {});
      expect(res.data).toEqual({ message: "Operation accepted" });
    });
  });

  describe("4. Error Interceptor & ApiClientError Normalization", () => {
    it("parses backend ErrorEnvelope into structured ApiClientError", async () => {
      mock.onPost("/error-test").reply(422, {
        error: {
          code: "VALIDATION_ERROR",
          message: "Field validation failed",
          requestId: "req_err_999",
          details: [{ field: "items", code: "too_small", message: "Min 1 item required" }],
        },
      });

      await expect(axiosInstance.post("/error-test", {})).rejects.toSatisfy(
        (err: unknown) => {
          expect(err).toBeInstanceOf(ApiClientError);
          const clientErr = err as ApiClientError;
          expect(clientErr.code).toBe("VALIDATION_ERROR");
          expect(clientErr.message).toBe("Field validation failed");
          expect(clientErr.requestId).toBe("req_err_999");
          expect(clientErr.details).toHaveLength(1);
          expect(clientErr.statusCode).toBe(422);
          return true;
        }
      );
    });

    it("maps HTTP status codes without envelope to standard error codes", async () => {
      mock.onGet("/unauth").reply(401);
      await expect(axiosInstance.get("/unauth")).rejects.toSatisfy((err: unknown) => {
        const clientErr = err as ApiClientError;
        expect(clientErr.code).toBe("UNAUTHENTICATED");
        expect(clientErr.statusCode).toBe(401);
        return true;
      });

      mock.onGet("/forbidden").reply(403);
      await expect(axiosInstance.get("/forbidden")).rejects.toSatisfy((err: unknown) => {
        const clientErr = err as ApiClientError;
        expect(clientErr.code).toBe("FORBIDDEN");
        expect(clientErr.statusCode).toBe(403);
        return true;
      });

      mock.onGet("/conflict").reply(409);
      await expect(axiosInstance.get("/conflict")).rejects.toSatisfy((err: unknown) => {
        const clientErr = err as ApiClientError;
        expect(clientErr.code).toBe("CONFLICT");
        expect(clientErr.statusCode).toBe(409);
        return true;
      });
    });

    it("handles network failure gracefully", () => {
      const normalized = normalizeAxiosError(new Error("Network Error"));
      expect(normalized).toBeInstanceOf(ApiClientError);
      expect(normalized.code).toBe("NETWORK_FAILURE");
    });
  });

  describe("5. Reconciled Contract Endpoints", () => {
    it("POST /checks passes { subjectType: 'PRESCRIPTION_REVISION', subjectId, subjectVersion }", async () => {
      mock.onPost("/checks").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          subjectType: "PRESCRIPTION_REVISION",
          subjectId: "case_rx_123",
          subjectVersion: 2,
        });
        return [201, { data: { id: "chk_001", outcome: "NO_MATCHING_RULE" } }];
      });

      const res = await api.runCheck("case_rx_123", 2);
      expect((res as any).id).toBe("chk_001");
    });

    it("POST /prescriptions/:id/revisions passes { items, changeReason, expectedVersion } and If-Match", async () => {
      const items: PrescriptionItem[] = [
        {
          rawExtractedText: "Paracetamol 500mg",
          canonicalIngredientIds: ["Paracetamol"],
          matchStatus: "CONFIRMED",
        },
      ];

      mock.onPost("/prescriptions/case_rx_123/revisions").reply((config) => {
        expect(config.headers?.["If-Match"]).toBe("2");
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          items,
          changeReason: "Adjusted dose",
          expectedVersion: 2,
        });
        return [201, { data: { id: "case_rx_123", currentRevisionNumber: 3 } }];
      });

      const res = await api.createRevision("case_rx_123", items, "Adjusted dose", 2);
      expect(res.id).toBe("case_rx_123");
    });

    it("POST /alerts/:id/disposition passes { dispositionType, rationale } and If-Match", async () => {
      mock.onPost("/alerts/alert_01/disposition").reply((config) => {
        expect(config.headers?.["If-Match"]).toBe("1");
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          dispositionType: "CHANGE_REQUIRED",
          rationale: "Requires medicine adjustment",
        });
        return [201, { data: { id: "alert_01", status: "CHANGE_REQUIRED" } }];
      });

      await api.recordDoctorDisposition(
        "alert_01",
        "CHANGE_REQUIRED",
        "Requires medicine adjustment",
        1
      );
    });

    it("POST /prescription-captures/:id/confirm passes { patientConfirmed: true, items } and If-Match", async () => {
      const items: PrescriptionItem[] = [
        {
          rawExtractedText: "Warfarin 5mg",
          canonicalIngredientIds: ["Warfarin"],
          matchStatus: "CONFIRMED",
        },
      ];

      mock.onPost("/prescription-captures/cap_123/confirm").reply((config) => {
        expect(config.headers?.["If-Match"]).toBe("1");
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          patientConfirmed: true,
          items,
        });
        return [200, { data: { id: "cap_123", status: "CONFIRMED" } }];
      });

      const res = await api.confirmMedicines("cap_123", items, 1);
      expect(res.id).toBe("cap_123");
    });

    it("GET /patients/search passes ?hospitalPatientId=...", async () => {
      mock.onGet("/patients/search?hospitalPatientId=P-9021").reply(200, {
        data: [{ id: "pat_1", syntheticHospitalPatientId: "P-9021" }],
      });

      const res = await api.searchPatients("P-9021");
      expect(res).toHaveLength(1);
      expect(res[0].syntheticHospitalPatientId).toBe("P-9021");
    });

    it("GET /medicine-catalogue/search passes ?query=...&limit=...", async () => {
      mock.onGet("/medicine-catalogue/search?query=Warfarin&limit=10").reply(200, {
        data: [{ id: "med_warfarin", displayName: "Warfarin 5mg" }],
      });

      const res = await api.searchCatalogue("Warfarin", 10);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("med_warfarin");
    });

    it("POST /prescription-captures passes { patientId, captureMode, ocrLanguage, extractedText }", async () => {
      mock.onPost("/prescription-captures").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          patientId: "P-9021",
          captureMode: "BROWSER_OCR",
          ocrLanguage: "eng",
          extractedText: "Rx sample text",
        });
        return [201, { data: { id: "cap_new_1", patientId: "P-9021" } }];
      });

      const res = await api.createCapture("P-9021", "Rx sample text", "BROWSER_OCR");
      expect(res.id).toBe("cap_new_1");
    });

    it("POST /appointments maps fields to { patientId, doctorUserId, startAt, endAt, reason }", async () => {
      mock.onPost("/appointments").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.patientId).toBe("P-9021");
        expect(body.doctorUserId).toBe("usr_doc_01");
        expect(body.startAt).toBe("2026-10-28T10:00:00Z");
        expect(body.endAt).toBe("2026-10-28T10:30:00Z");
        expect(body.reason).toBe("Checkup");
        return [201, { data: { id: "apt_123", status: "SCHEDULED" } }];
      });

      const res = await api.createAppointment({
        patientId: "P-9021",
        doctorUserId: "usr_doc_01",
        startAt: "2026-10-28T10:00:00Z",
        endAt: "2026-10-28T10:30:00Z",
        reason: "Checkup",
      });
      expect(res.id).toBe("apt_123");
    });

    it("POST /demo/reset passes { confirmation: 'RESET_SYNTHETIC_DEMO', workspaceId }", async () => {
      mock.onPost("/demo/reset").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          confirmation: "RESET_SYNTHETIC_DEMO",
          workspaceId: "ws_metro_default",
        });
        return [202, { message: "Demo workspace reset successfully." }];
      });

      await api.resetDemoWorkspace("ws_metro_default");
    });

    it("POST /demo/seed passes { confirmation: 'SEED_SYNTHETIC_DEMO', workspaceId }", async () => {
      mock.onPost("/demo/seed").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body).toEqual({
          confirmation: "SEED_SYNTHETIC_DEMO",
          workspaceId: "ws_metro_default",
        });
        return [202, { message: "Demo workspace seeded successfully." }];
      });

      await api.seedDemoWorkspace("ws_metro_default");
    });

    it("updateMembershipStatus facade dispatches to approve, suspend, reject", async () => {
      // Approve dispatch
      mock.onPost("/memberships/mem_01/approve").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.assignedRole).toBe("DOCTOR");
        return [200, { data: { id: "mem_01", status: "ACTIVE", role: "DOCTOR" } }];
      });

      const approved = await api.updateMembershipStatus("mem_01", "ACTIVE", "DOCTOR", 1);
      expect((approved as any).status).toBe("ACTIVE");

      // Suspend dispatch
      mock.onPost("/memberships/mem_01/suspend").reply((config) => {
        return [200, { message: "Membership suspended" }];
      });

      const suspended = await api.updateMembershipStatus("mem_01", "SUSPENDED");
      expect((suspended as any).message).toBe("Membership suspended");

      // Reject dispatch
      mock.onPost("/memberships/mem_01/reject").reply((config) => {
        return [200, { message: "Membership rejected" }];
      });

      const rejected = await api.updateMembershipStatus("mem_01", "REVOKED");
      expect((rejected as any).message).toBe("Membership rejected");
    });

    it("GET /notifications & POST /notifications/:id/read operate correctly", async () => {
      mock.onGet("/notifications?unreadOnly=true&limit=20").reply(200, {
        data: [{ id: "notif_1", read: false, type: "ALERT" }],
      });
      mock.onPost("/notifications/notif_1/read").reply(204);

      const notifs = await api.getNotifications(true);
      expect(notifs).toHaveLength(1);
      expect(notifs[0].id).toBe("notif_1");

      await expect(api.markNotificationRead("notif_1")).resolves.toBeUndefined();
    });

    it("GET /hospitals/current returns hospital entity", async () => {
      mock.onGet("/hospitals/current").reply(200, {
        data: { id: "hosp_metro_01", name: "Metro General Hospital", slug: "metro-general", status: "ACTIVE" },
      });

      const hosp = await api.getCurrentHospital();
      expect(hosp.id).toBe("hosp_metro_01");
    });

    it("GET /audit-events returns audit logs", async () => {
      mock.onGet("/audit-events?resourceType=PRESCRIPTION").reply(200, {
        data: [{ id: "aud_1", action: "PRESCRIPTION_REVISION_CREATED" }],
      });

      const logs = await api.getAuditEvents({ resourceType: "PRESCRIPTION" });
      expect(logs).toHaveLength(1);
    });

    it("GET /rule-sets/current returns current ruleset metadata", async () => {
      mock.onGet("/rule-sets/current").reply(200, {
        data: { version: "v1.0.0-illustrative", isClinicallyValidated: false, limitations: [] },
      });

      const rules = await api.getRuleSetsCurrent();
      expect(rules.version).toBe("v1.0.0-illustrative");
    });

    it("POST /patients/:id/allergies adds patient allergy", async () => {
      mock.onPost("/patients/P-9021/allergies").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.substanceText).toBe("Penicillin");
        return [201, { data: { id: "alg_01", substanceText: "Penicillin" } }];
      });

      const alg = await api.addAllergy("P-9021", {
        substanceText: "Penicillin",
        recordType: "ALLERGY",
        severity: "SEVERE",
      });
      expect(alg.id).toBe("alg_01");
    });

    it("POST /patients/:id/medication-history adds medication profile entry", async () => {
      mock.onPost("/patients/P-9021/medication-history").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.medicineName).toBe("Metformin");
        return [201, { data: { id: "mh_01", medicineName: "Metformin" } }];
      });

      const mh = await api.addMedicationHistory("P-9021", {
        medicineName: "Metformin",
        dose: "500",
        unit: "mg",
      });
      expect(mh.id).toBe("mh_01");
    });

    it("GET and POST /medication-orders operates on inpatient orders", async () => {
      mock.onGet("/medication-orders?patientId=P-9021").reply(200, {
        data: [{ id: "ord_01", patientId: "P-9021" }],
      });
      mock.onPost("/medication-orders").reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.patientId).toBe("P-9021");
        return [201, { data: { id: "ord_new", patientId: "P-9021" } }];
      });

      const orders = await api.getMedicationOrders({ patientId: "P-9021" });
      expect(orders).toHaveLength(1);

      const created = await api.createMedicationOrder({
        patientId: "P-9021",
        items: [],
      });
      expect(created.id).toBe("ord_new");
    });
  });

  describe("6. Mock Fallback Mode Verification", () => {
    it("delegates to mockEngine seamlessly when isMockMode is true", async () => {
      api.setMockMode(true);
      await api.resetDemoWorkspace();

      const caseData = await api.getCase("case_rx_9021_01");
      expect(caseData.id).toBe("case_rx_9021_01");

      const check = await api.runCheck("case_rx_9021_01");
      expect(check.data.outcome).toBe("FLAGGED");

      const catalogue = await api.searchCatalogue("Warfarin");
      expect(catalogue.length).toBeGreaterThan(0);
    });
  });
});
