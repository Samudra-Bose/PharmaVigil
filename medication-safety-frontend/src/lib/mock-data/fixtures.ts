import type {
  Hospital,
  PatientSummary,
  MedicineCandidate,
  PrescriptionRevision,
  PrescriptionItem,
  CheckEnvelope,
  AlertSummary,
} from "@/types";

export const FIXTURE_HOSPITAL: Hospital = {
  id: "hosp_metro_general",
  name: "Metro General Hospital",
  slug: "metro-general",
  status: "ACTIVE",
};

export interface FixtureUser {
  id: string;
  email: string;
  displayName: string;
  role: "PATIENT" | "DOCTOR" | "PHARMACIST" | "HOSPITAL_ADMIN";
  accountStatus: "ACTIVE" | "PENDING";
  membershipStatus: "ACTIVE" | "PENDING";
  syntheticHospitalPatientId?: string;
}

export const FIXTURE_USERS: Record<string, FixtureUser> = {
  "pharma@metro-general.invalid": {
    id: "usr_pharma_01",
    email: "pharma@metro-general.invalid",
    displayName: "Priya Sharma, RPh",
    role: "PHARMACIST",
    accountStatus: "ACTIVE",
    membershipStatus: "ACTIVE",
  },
  "doctor@metro-general.invalid": {
    id: "usr_doctor_01",
    email: "doctor@metro-general.invalid",
    displayName: "Dr. Arvind Patel, MD",
    role: "DOCTOR",
    accountStatus: "ACTIVE",
    membershipStatus: "ACTIVE",
  },
  "patient@metro-general.invalid": {
    id: "usr_patient_01",
    email: "patient@metro-general.invalid",
    displayName: "Rajan Sharma",
    role: "PATIENT",
    accountStatus: "ACTIVE",
    membershipStatus: "ACTIVE",
    syntheticHospitalPatientId: "P-9021",
  },
  "admin@metro-general.invalid": {
    id: "usr_admin_01",
    email: "admin@metro-general.invalid",
    displayName: "Sunita Verma (Administrator)",
    role: "HOSPITAL_ADMIN",
    accountStatus: "ACTIVE",
    membershipStatus: "ACTIVE",
  },
  "pending@metro-general.invalid": {
    id: "usr_pending_01",
    email: "pending@metro-general.invalid",
    displayName: "Dr. Neha Rao (Applicant)",
    role: "DOCTOR",
    accountStatus: "PENDING",
    membershipStatus: "PENDING",
  },
};

export interface ClinicalAllergyContext {
  id: string;
  allergenName: string;
  severity: "CRITICAL" | "MODERATE" | "LOW";
  reaction: string;
  verificationStatus: "VERIFIED_CLINICIAN" | "PATIENT_REPORTED";
}

export interface PatientRecord extends PatientSummary {
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  contactPhone?: string;
  knownAllergies?: ClinicalAllergyContext[];
  activeMedications?: Array<{
    id: string;
    ingredientName: string;
    brandName?: string;
    dosage: string;
    frequency: string;
    startedAt: string;
  }>;
}

export const FIXTURE_PATIENT: PatientRecord = {
  id: "pat_rajan_9021",
  syntheticHospitalPatientId: "P-9021",
  displayName: "Rajan Sharma",
  linkStatus: "LINKED",
  version: 1,
  dateOfBirth: "1968-04-12",
  gender: "MALE",
  contactPhone: "+91 98765 43210",
  knownAllergies: [
    {
      id: "alg_001",
      allergenName: "Penicillin",
      severity: "CRITICAL",
      reaction: "Anaphylaxis",
      verificationStatus: "VERIFIED_CLINICIAN",
    },
    {
      id: "alg_002",
      allergenName: "Sulfa Drugs",
      severity: "MODERATE",
      reaction: "Mild Urticaria",
      verificationStatus: "PATIENT_REPORTED",
    },
  ],
  activeMedications: [
    {
      id: "med_act_001",
      ingredientName: "Metformin HCl",
      brandName: "Glycomet",
      dosage: "500 mg",
      frequency: "Twice daily with meals",
      startedAt: "2024-01-15",
    },
  ],
};

export const FIXTURE_PATIENTS: PatientRecord[] = [
  FIXTURE_PATIENT,
  {
    id: "pat_sunita_9022",
    syntheticHospitalPatientId: "P-9022",
    displayName: "Sunita Verma",
    linkStatus: "LINKED",
    version: 1,
    dateOfBirth: "1981-08-23",
    gender: "FEMALE",
    contactPhone: "+91 98112 34567",
    knownAllergies: [],
    activeMedications: [],
  },
  {
    id: "pat_amit_9023",
    syntheticHospitalPatientId: "P-9023",
    displayName: "Amit Kumar",
    linkStatus: "LINKED",
    version: 1,
    dateOfBirth: "1964-11-05",
    gender: "MALE",
    contactPhone: "+91 97123 45678",
    knownAllergies: [
      {
        id: "alg_003",
        allergenName: "Aspirin",
        severity: "CRITICAL",
        reaction: "Bronchospasm",
        verificationStatus: "VERIFIED_CLINICIAN",
      },
    ],
    activeMedications: [],
  },
];

export interface AppointmentRecord {
  id: string;
  hospitalId: string;
  patientId: string;
  patientDisplayName: string;
  clinicianUserId: string;
  clinicianDisplayName: string;
  department: string;
  slotStart: string;
  slotEnd: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  reason?: string;
  notes?: string;
}

export const INITIAL_FIXTURE_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "apt_001",
    hospitalId: "hosp_metro_general",
    patientId: "pat_rajan_9021",
    patientDisplayName: "Rajan Sharma (P-9021)",
    clinicianUserId: "usr_doctor_01",
    clinicianDisplayName: "Dr. Arvind Patel, MD",
    department: "Cardiology",
    slotStart: "2026-10-30T10:00:00Z",
    slotEnd: "2026-10-30T10:30:00Z",
    status: "SCHEDULED",
    reason: "Anticoagulation & Antithrombotic Therapy Follow-up (Warfarin Monitoring)",
    notes: "Review recent INR lab values and adjust warfarin dosage if indicated.",
  },
  {
    id: "apt_002",
    hospitalId: "hosp_metro_general",
    patientId: "pat_rajan_9021",
    patientDisplayName: "Rajan Sharma (P-9021)",
    clinicianUserId: "usr_pharma_01",
    clinicianDisplayName: "Priya Sharma, RPh",
    department: "Clinical Pharmacy",
    slotStart: "2026-10-31T14:00:00Z",
    slotEnd: "2026-10-31T14:20:00Z",
    status: "SCHEDULED",
    reason: "Outpatient Medication Counseling & Regimen Review",
    notes: "Patient education on avoiding OTC NSAIDs while on anticoagulant therapy.",
  },
  {
    id: "apt_003",
    hospitalId: "hosp_metro_general",
    patientId: "pat_rajan_9021",
    patientDisplayName: "Rajan Sharma (P-9021)",
    clinicianUserId: "usr_doctor_01",
    clinicianDisplayName: "Dr. Arvind Patel, MD",
    department: "Cardiology",
    slotStart: "2026-09-15T11:00:00Z",
    slotEnd: "2026-09-15T11:30:00Z",
    status: "COMPLETED",
    reason: "Initial Post-Discharge Cardiac Consultation",
    notes: "Prescribed baseline cardiovascular regimen.",
  },
];

export const FIXTURE_CATALOGUE: MedicineCandidate[] = [
  {
    id: "cat_warfarin_5",
    displayName: "Warfarin Sodium (Coumadin) 5mg",
    canonicalIngredientIds: ["ing_warfarin"],
    productType: "SINGLE_INGREDIENT",
    strengths: [{ value: 5, unit: "mg" }],
    dosageForms: ["Tablet"],
    matchStatus: "CANDIDATE",
  },
  {
    id: "cat_aspirin_100",
    displayName: "Aspirin (Disprin) 100mg",
    canonicalIngredientIds: ["ing_aspirin"],
    productType: "SINGLE_INGREDIENT",
    strengths: [{ value: 100, unit: "mg" }],
    dosageForms: ["Tablet"],
    matchStatus: "CANDIDATE",
  },
  {
    id: "cat_paracetamol_500",
    displayName: "Paracetamol (Crocin) 500mg",
    canonicalIngredientIds: ["ing_paracetamol"],
    productType: "SINGLE_INGREDIENT",
    strengths: [{ value: 500, unit: "mg" }],
    dosageForms: ["Tablet"],
    matchStatus: "CANDIDATE",
  },
  {
    id: "cat_metformin_500",
    displayName: "Metformin HCl (Glycomet) 500mg",
    canonicalIngredientIds: ["ing_metformin"],
    productType: "SINGLE_INGREDIENT",
    strengths: [{ value: 500, unit: "mg" }],
    dosageForms: ["Tablet"],
    matchStatus: "CANDIDATE",
  },
  {
    id: "cat_amoxicillin_500",
    displayName: "Amoxicillin Trihydrate (Novamox) 500mg",
    canonicalIngredientIds: ["ing_amoxicillin"],
    productType: "SINGLE_INGREDIENT",
    strengths: [{ value: 500, unit: "mg" }],
    dosageForms: ["Capsule"],
    matchStatus: "CANDIDATE",
  },
];

export const INITIAL_PRESCRIPTION_ITEMS: PrescriptionItem[] = [
  {
    rawExtractedText: "Tab. Warfarin 5mg - 1 Tab OD x 30 days",
    catalogueItemId: "cat_warfarin_5",
    canonicalIngredientIds: ["ing_warfarin"],
    brandText: "Coumadin",
    strengthValue: 5,
    strengthUnit: "mg",
    dosageForm: "Tablet",
    doseValue: 1,
    doseUnit: "Tablet",
    route: "Oral",
    frequency: "Once Daily",
    durationValue: 30,
    durationUnit: "days",
    matchConfidence: 0.96,
    matchStatus: "CONFIRMED",
  },
  {
    rawExtractedText: "Tab. Aspirin 100mg - 1 Tab OD x 15 days",
    catalogueItemId: "cat_aspirin_100",
    canonicalIngredientIds: ["ing_aspirin"],
    brandText: "Disprin",
    strengthValue: 100,
    strengthUnit: "mg",
    dosageForm: "Tablet",
    doseValue: 1,
    doseUnit: "Tablet",
    route: "Oral",
    frequency: "Once Daily",
    durationValue: 15,
    durationUnit: "days",
    matchConfidence: 0.94,
    matchStatus: "CONFIRMED",
  },
];

export interface FixtureCase {
  id: string;
  patientId: string;
  status: "DRAFT_CAPTURE" | "EXTRACTED" | "MEDICINES_CONFIRMED" | "CHECK_FLAGGED" | "DOCTOR_REVIEW" | "REVISED" | "CHECK_PASSED" | "DISPENSING_AUTHORIZED";
  createdAt: string;
  updatedAt: string;
  currentRevisionNumber: number;
  extractedRawText: string;
  items: PrescriptionItem[];
  checkResult?: CheckEnvelope;
  alerts?: AlertSummary[];
  revisions: PrescriptionRevision[];
  dispensingAuthorization?: {
    authorizedAt: string;
    authorizedBy: string;
    expectedVersion: number;
  };
}

export const INITIAL_FIXTURE_CASE: FixtureCase = {
  id: "case_rx_9021_01",
  patientId: "pat_rajan_9021",
  status: "CHECK_FLAGGED",
  createdAt: "2026-10-27T10:15:00Z",
  updatedAt: "2026-10-27T10:30:00Z",
  currentRevisionNumber: 1,
  extractedRawText: "Rx: Rajan Sharma (P-9021)\nTab. Warfarin 5mg - 1 Tab OD x 30 days\nTab. Aspirin 100mg - 1 Tab OD x 15 days\nDr. Arvind Patel, MD",
  items: [...INITIAL_PRESCRIPTION_ITEMS],
  alerts: [
    {
      id: "alert_ddi_001",
      ruleId: "ILLUSTRATIVE-DDI-001",
      ruleVersion: 1,
      severity: "MODERATE",
      status: "OPEN",
      rationale: "Concomitant use of Warfarin (anticoagulant) and Aspirin (antiplatelet agent) significantly increases the risk of severe gastrointestinal and systemic bleeding.",
      limitations: [
        "Illustrative rule set; not clinically validated",
        "Synthetic demonstration dataset only",
        "Does not account for unseeded medications or patient-specific INR history",
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
    },
  ],
  checkResult: {
    data: {
      id: "chk_eval_001",
      outcome: "FLAGGED",
      ruleSetVersion: "v1.0.0-illustrative",
      subjectId: "case_rx_9021_01",
      subjectVersion: 1,
      createdAt: "2026-10-27T10:30:00Z",
      limitations: [
        "Illustrative rule set; not clinically validated",
        "Synthetic dataset only",
      ],
      alerts: [
        {
          id: "alert_ddi_001",
          ruleId: "ILLUSTRATIVE-DDI-001",
          ruleVersion: 1,
          severity: "MODERATE",
          status: "OPEN",
          rationale: "Concomitant use of Warfarin (anticoagulant) and Aspirin (antiplatelet agent) significantly increases the risk of severe gastrointestinal and systemic bleeding.",
          limitations: [
            "Illustrative rule set; not clinically validated",
            "Synthetic demonstration dataset only",
          ],
        },
      ],
      coverageByCategory: {
        drugDrug: {
          status: "EVALUATED_WITH_MATCHES",
          limitation: "Evaluated against 1 seeded illustrative DDI rule.",
          evaluatedInputsCount: 2,
        },
        allergy: {
          status: "NO_MATCHING_SEEDED_RULE",
          limitation: "No match detected against patient's Penicillin allergy profile.",
          evaluatedInputsCount: 2,
        },
        foodDrink: {
          status: "NOT_EVALUATED",
          limitation: "Food/drink rules outside current demo scope.",
        },
      },
    },
  },
  revisions: [
    {
      id: "rev_01",
      revisionNumber: 1,
      createdAt: "2026-10-27T10:15:00Z",
      items: [...INITIAL_PRESCRIPTION_ITEMS],
    },
  ],
};
