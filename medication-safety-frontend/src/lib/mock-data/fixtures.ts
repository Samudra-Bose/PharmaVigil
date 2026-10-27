import type {
  Hospital,
  PatientSummary,
  MedicineCandidate,
  PrescriptionRevision,
  CheckEnvelope,
  AlertSummary,
  Membership,
  UserSummary,
} from "@/types";

export const FIXTURE_HOSPITAL: Hospital = {
  id: "hosp_metro_general",
  name: "Metro General Hospital",
  slug: "metro-general",
  workspaceType: "DEMO_SYNTHETIC",
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

export const FIXTURE_PATIENT: PatientSummary = {
  id: "pat_rajan_9021",
  syntheticHospitalPatientId: "P-9021",
  fullName: "Rajan Sharma",
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

export const FIXTURE_CATALOGUE: MedicineCandidate[] = [
  {
    candidateId: "cand_warfarin",
    matchedCatalogueItemId: "cat_warfarin_5",
    extractedText: "Tab. Warfarin 5mg",
    normalizedName: "Warfarin Sodium",
    brandName: "Coumadin",
    canonicalIngredients: [
      { ingredientId: "ing_warfarin", ingredientName: "Warfarin Sodium" },
    ],
    strength: "5 mg",
    dosageForm: "Tablet",
    matchConfidence: "EXACT",
    matchStatus: "CONFIRMED",
  },
  {
    candidateId: "cand_aspirin",
    matchedCatalogueItemId: "cat_aspirin_100",
    extractedText: "Tab. Aspirin 100mg",
    normalizedName: "Aspirin (Acetylsalicylic Acid)",
    brandName: "Disprin",
    canonicalIngredients: [
      { ingredientId: "ing_aspirin", ingredientName: "Aspirin" },
    ],
    strength: "100 mg",
    dosageForm: "Tablet",
    matchConfidence: "EXACT",
    matchStatus: "CONFIRMED",
  },
  {
    candidateId: "cand_paracetamol",
    matchedCatalogueItemId: "cat_paracetamol_500",
    extractedText: "Tab. Paracetamol 500mg",
    normalizedName: "Paracetamol",
    brandName: "Crocin",
    canonicalIngredients: [
      { ingredientId: "ing_paracetamol", ingredientName: "Paracetamol" },
    ],
    strength: "500 mg",
    dosageForm: "Tablet",
    matchConfidence: "EXACT",
    matchStatus: "CONFIRMED",
  },
  {
    candidateId: "cand_metformin",
    matchedCatalogueItemId: "cat_metformin_500",
    extractedText: "Tab. Metformin 500mg",
    normalizedName: "Metformin HCl",
    brandName: "Glycomet",
    canonicalIngredients: [
      { ingredientId: "ing_metformin", ingredientName: "Metformin HCl" },
    ],
    strength: "500 mg",
    dosageForm: "Tablet",
    matchConfidence: "EXACT",
    matchStatus: "CONFIRMED",
  },
  {
    candidateId: "cand_amoxicillin",
    matchedCatalogueItemId: "cat_amoxicillin_500",
    extractedText: "Cap. Amoxicillin 500mg",
    normalizedName: "Amoxicillin Trihydrate",
    brandName: "Novamox",
    canonicalIngredients: [
      { ingredientId: "ing_amoxicillin", ingredientName: "Amoxicillin" },
    ],
    strength: "500 mg",
    dosageForm: "Capsule",
    matchConfidence: "EXACT",
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
  candidates: MedicineCandidate[];
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
  candidates: [FIXTURE_CATALOGUE[0], FIXTURE_CATALOGUE[1]],
  alerts: [
    {
      id: "alert_ddi_001",
      caseId: "case_rx_9021_01",
      ruleId: "ILLUSTRATIVE-DDI-001",
      ruleVersion: 1,
      category: "DRUG_DRUG",
      severity: "MODERATE",
      status: "OPEN",
      rationale: "Concomitant use of Warfarin (anticoagulant) and Aspirin (antiplatelet agent) significantly increases the risk of severe gastrointestinal and systemic bleeding.",
      interactingIngredients: ["Warfarin Sodium", "Aspirin"],
      limitations: [
        "Illustrative rule set; not clinically validated",
        "Synthetic demonstration dataset only",
        "Does not account for unseeded medications or patient-specific INR history",
      ],
      evidenceReferences: [
        {
          sourceId: "SRC-NFI-2026",
          title: "National Formulary of India (NFI) — Anticoagulant Interactions",
          publisher: "Indian Pharmacopoeia Commission (IPC)",
          url: "https://ipc.gov.in/mandates/nfi.html",
          locator: "Section 10.2: Antithrombotic Agents",
          evidenceStrength: "ESTABLISHED",
        },
      ],
      recommendedNextAction: "Doctor review required. Route to Doctor Triage Queue for clinical disposition.",
      createdAt: "2026-10-27T10:30:00Z",
    },
  ],
  checkResult: {
    checkId: "chk_eval_001",
    outcome: "FLAGGED",
    evaluatedAt: "2026-10-27T10:30:00Z",
    ruleSetVersion: "v1.0.0-illustrative",
    coverageCategories: [
      {
        category: "DRUG_DRUG",
        status: "EVALUATED_WITH_MATCHES",
        summary: "1 illustrative drug-drug interaction rule matched.",
      },
      {
        category: "DRUG_ALLERGY",
        status: "NO_MATCHING_SEEDED_RULE",
        summary: "No matching allergen detected against confirmed Penicillin/Sulfa allergy records.",
      },
      {
        category: "FOOD_DRINK",
        status: "NOT_EVALUATED",
        summary: "Food/drink interaction evaluation not supported in current illustrative ruleset.",
      },
    ],
  },
  revisions: [
    {
      revisionNumber: 1,
      createdAt: "2026-10-27T10:15:00Z",
      createdBy: "usr_doctor_01",
      prescribedItems: [
        {
          medicationName: "Warfarin Sodium",
          brandName: "Coumadin",
          strength: "5 mg",
          dosageForm: "Tablet",
          doseInstruction: "1 Tablet Once Daily",
          durationDays: 30,
        },
        {
          medicationName: "Aspirin",
          brandName: "Disprin",
          strength: "100 mg",
          dosageForm: "Tablet",
          doseInstruction: "1 Tablet Once Daily",
          durationDays: 15,
        },
      ],
      changeReason: "Initial prescription creation.",
    },
  ],
};
