import type { components, paths } from "./api.generated";

export type { components, paths };

export type Schemas = components["schemas"];

export type HealthResponse = Schemas["HealthResponse"];
export type RegisterRequest = Schemas["RegisterRequest"];
export type RegisterResponse = Schemas["RegisterResponse"];
export type LoginRequest = Schemas["LoginRequest"];
export type CurrentUserResponse = Schemas["CurrentUserResponse"];
export type Membership = Schemas["Membership"];
export type MembershipEnvelope = Schemas["MembershipEnvelope"];
export type MembershipList = Schemas["MembershipList"];
export type ApproveMembershipRequest = Schemas["ApproveMembershipRequest"];
export type Hospital = Schemas["Hospital"];
export type UserSummary = Schemas["UserSummary"];
export type PatientSummary = Schemas["PatientSummary"];
export type MedicineCandidate = Schemas["MedicineCandidate"];
export type PrescriptionItem = Schemas["PrescriptionItem"];
export type CaptureUpdate = Schemas["CaptureUpdate"];
export type CaptureEnvelope = Schemas["CaptureEnvelope"];
export type CreatePrescription = Schemas["CreatePrescription"];
export type CreateRevision = Schemas["CreateRevision"];
export type PrescriptionRevision = Schemas["PrescriptionRevision"];
export type PrescriptionEnvelope = Schemas["PrescriptionEnvelope"];
export type PrescriptionList = Schemas["PrescriptionList"];
export type CreateCheck = Schemas["CreateCheck"];
export type CoverageCategory = Schemas["CoverageCategory"];
export type EvidenceReference = Schemas["EvidenceReference"];
export type AlertSummary = Schemas["AlertSummary"];
export type CheckEnvelope = Schemas["CheckEnvelope"];
export type AlertList = Schemas["AlertList"];
export type AlertEnvelope = Schemas["AlertEnvelope"];
export type AlertDisposition = Schemas["AlertDisposition"];
export type DispensingAuthorizationRequest = Schemas["DispensingAuthorizationRequest"];
export type DispensingAuthorizationResponse = Schemas["DispensingAuthorizationResponse"];
export type Notification = Schemas["Notification"];
export type RuleSetMetadata = Schemas["RuleSetMetadata"];
export type ErrorResponse = Schemas["ErrorResponse"];

export type UserRole = "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";

export type CheckOutcome = 
  | "FLAGGED" 
  | "NO_MATCHING_RULE" 
  | "INCOMPLETE" 
  | "UNSUPPORTED" 
  | "FAILED";

export type AlertSeverity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export type AlertStatus = 
  | "OPEN" 
  | "ACKNOWLEDGED" 
  | "UNDER_REVIEW" 
  | "CHANGE_REQUIRED" 
  | "CLINICAL_DISPOSITION_RECORDED" 
  | "RESOLVED";
