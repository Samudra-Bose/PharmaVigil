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

// Inpatient Medication Orders
export type MedicationOrderStatus = "ACTIVE" | "HELD" | "DISCONTINUED" | "CANCELLED";

export interface InpatientMedicationOrderItem {
  id?: string;
  catalogueItemId?: string | null;
  canonicalIngredientIds: string[];
  brandName?: string;
  brandText?: string | null;
  dose: string;
  unit: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface MedicationOrderVersion {
  id: string;
  orderId: string;
  versionNumber: number;
  items: InpatientMedicationOrderItem[];
  changeReason?: string;
  createdBy: string;
  createdAt: string;
}

export interface InpatientMedicationOrder {
  id: string;
  orderId?: string;
  patientId: string;
  patientName?: string;
  orderingDoctorId: string;
  orderingDoctorName?: string;
  currentVersionNumber: number;
  status: MedicationOrderStatus;
  items: InpatientMedicationOrderItem[];
  notes?: string;
  ward?: string;
  bed?: string;
  scheduleFrequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  versions?: MedicationOrderVersion[];
}

// Patient Self-Reported Clinical Entities
export interface PatientAllergy {
  id: string;
  patientId: string;
  substanceText: string;
  recordType: "ALLERGY" | "ADVERSE_REACTION" | "INTOLERANCE";
  reactionDescription?: string;
  severity: "UNKNOWN" | "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING";
  sourceType: "CLINICIAN_RECORDED" | "PATIENT_REPORTED";
  verificationStatus: "CONFIRMED" | "REPORTED" | "UNVERIFIED";
  recordedAt?: string;
  createdAt?: string;
}

export interface PatientMedicationHistoryItem {
  id: string;
  patientId: string;
  medicineName: string;
  dose: string;
  unit: string;
  route: string;
  frequency: string;
  status: "ACTIVE" | "STOPPED" | "UNKNOWN";
  startDate?: string;
  endDate?: string;
  sourceType: "CLINICIAN_PRESCRIBED" | "PATIENT_REPORTED" | "IMPORTED_SYNTHETIC";
  verificationStatus: "VERIFIED" | "REPORTED" | "UNVERIFIED";
  createdAt?: string;
}

// Audit Trail
export interface AuditEvent {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorDisplayName?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  requestId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

// Clinical Decision Support Rulesets
export interface ClinicalRule {
  ruleId: string;
  name?: string;
  category: "DDI" | "DOSE_RANGE" | "DUPLICATE_THERAPY" | "ALLERGY_CROSS_REACTIVITY" | "CONTRAINDICATION" | string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  triggerCondition?: string;
  targetIngredients?: string[];
  description: string;
  mechanisticRationale?: string;
  recommendation: string;
  guidelineReference?: string;
}

export interface ClinicalRuleSet {
  ruleSetId: string;
  version: string;
  description: string;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "DEPRECATED" | "ILLUSTRATIVE_NOT_VALIDATED";
  ruleCount: number;
  isClinicallyValidated: boolean;
  publishedAt?: string;
  publishedBy?: string;
  limitations: string[];
  rules: ClinicalRule[];
}
