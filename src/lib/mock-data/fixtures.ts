import type {
  Hospital,
  PatientSummary,
  MedicineCandidate,
  PrescriptionRevision,
  PrescriptionItem,
  CheckEnvelope,
  AlertSummary,
  InpatientMedicationOrder,
  MedicationOrderVersion,
  AuditEvent,
  ClinicalRule,
  ClinicalRuleSet,
  PatientAllergy,
  PatientMedicationHistoryItem,
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
  "pharmacist@demo-hospital.local": {
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
  "doctor@demo-hospital.local": {
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
  "patient@demo-hospital.local": {
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
  "admin@demo-hospital.local": {
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
  "pending.doctor@demo-hospital.local": {
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
    reason:
      "Anticoagulation & Antithrombotic Therapy Follow-up (Warfarin Monitoring)",
    notes:
      "Review recent INR lab values and adjust warfarin dosage if indicated.",
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
    notes:
      "Patient education on avoiding OTC NSAIDs while on anticoagulant therapy.",
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
  status:
    | "DRAFT_CAPTURE"
    | "EXTRACTED"
    | "MEDICINES_CONFIRMED"
    | "CHECK_FLAGGED"
    | "DOCTOR_REVIEW"
    | "REVISED"
    | "CHECK_PASSED"
    | "DISPENSING_AUTHORIZED";
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
  extractedRawText:
    "Rx: Rajan Sharma (P-9021)\nTab. Warfarin 5mg - 1 Tab OD x 30 days\nTab. Aspirin 100mg - 1 Tab OD x 15 days\nDr. Arvind Patel, MD",
  items: [...INITIAL_PRESCRIPTION_ITEMS],
  alerts: [
    {
      id: "alert_ddi_001",
      ruleId: "ILLUSTRATIVE-DDI-001",
      ruleVersion: 1,
      severity: "MODERATE",
      status: "OPEN",
      rationale:
        "Concomitant use of Warfarin (anticoagulant) and Aspirin (antiplatelet agent) significantly increases the risk of severe gastrointestinal and systemic bleeding.",
      limitations: [
        "Illustrative rule set; not clinically validated",
        "Synthetic demonstration dataset only",
        "Does not account for unseeded medications or patient-specific INR history",
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
          rationale:
            "Concomitant use of Warfarin (anticoagulant) and Aspirin (antiplatelet agent) significantly increases the risk of severe gastrointestinal and systemic bleeding.",
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
          limitation:
            "No match detected against patient's Penicillin allergy profile.",
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

export const INITIAL_MEDICATION_ORDERS: InpatientMedicationOrder[] = [
  {
    id: "ord_inpatient_9021_01",
    orderId: "ord_inpatient_9021_01",
    patientId: "P-9021",
    patientName: "Rajan Sharma",
    orderingDoctorId: "usr_doctor_01",
    orderingDoctorName: "Dr. Arvind Patel, MD",
    currentVersionNumber: 1,
    status: "ACTIVE",
    ward: "Cardiology Ward 4B",
    bed: "Bed 12",
    scheduleFrequency: "Q12H",
    route: "INTRAVENOUS",
    startDate: "2026-10-27T08:00:00Z",
    endDate: "2026-11-03T08:00:00Z",
    notes:
      "Post-PCI acute antibiotic coverage. Monitor trough concentrations before 4th dose.",
    createdAt: "2026-10-27T08:30:00Z",
    updatedAt: "2026-10-27T08:30:00Z",
    items: [
      {
        id: "item_ord_01",
        catalogueItemId: "med_ceftriaxone_1g",
        canonicalIngredientIds: ["Ceftriaxone"],
        brandName: "Monocef 1g Injection",
        dose: "1",
        unit: "g",
        route: "INTRAVENOUS",
        frequency: "Q24H",
        duration: "7 days",
        instructions: "Infuse in 100mL 0.9% Normal Saline over 30 minutes",
      },
      {
        id: "item_ord_02",
        catalogueItemId: "med_enoxaparin_40mg",
        canonicalIngredientIds: ["Enoxaparin"],
        brandName: "Clexane 40mg PFS",
        dose: "40",
        unit: "mg",
        route: "SUBCUTANEOUS",
        frequency: "Q24H",
        duration: "5 days",
        instructions:
          "Deep subcutaneous injection in anterolateral abdominal wall",
      },
    ],
    versions: [
      {
        id: "ver_ord_01_1",
        orderId: "ord_inpatient_9021_01",
        versionNumber: 1,
        items: [
          {
            id: "item_ord_01",
            catalogueItemId: "med_ceftriaxone_1g",
            canonicalIngredientIds: ["Ceftriaxone"],
            brandName: "Monocef 1g Injection",
            dose: "1",
            unit: "g",
            route: "INTRAVENOUS",
            frequency: "Q24H",
            duration: "7 days",
            instructions: "Infuse in 100mL 0.9% Normal Saline over 30 minutes",
          },
        ],
        changeReason: "Initial inpatient prescription upon ICU transfer",
        createdBy: "Dr. Arvind Patel, MD",
        createdAt: "2026-10-27T08:30:00Z",
      },
    ],
  },
  {
    id: "ord_inpatient_9022_02",
    orderId: "ord_inpatient_9022_02",
    patientId: "P-9022",
    patientName: "Priya Nair",
    orderingDoctorId: "usr_doctor_01",
    orderingDoctorName: "Dr. Arvind Patel, MD",
    currentVersionNumber: 1,
    status: "ACTIVE",
    ward: "ICU Bed 03",
    bed: "Bed 03",
    scheduleFrequency: "Q8H",
    route: "INTRAVENOUS",
    startDate: "2026-10-27T12:00:00Z",
    endDate: "2026-11-01T12:00:00Z",
    notes: "Severe sepsis management. Renal dosing adjustments calculated.",
    createdAt: "2026-10-27T12:00:00Z",
    updatedAt: "2026-10-27T12:00:00Z",
    items: [
      {
        id: "item_ord_03",
        catalogueItemId: "med_pip_taz_4_5g",
        canonicalIngredientIds: ["Piperacillin", "Tazobactam"],
        brandName: "Tazomac 4.5g Injection",
        dose: "4.5",
        unit: "g",
        route: "INTRAVENOUS",
        frequency: "Q8H",
        duration: "5 days",
        instructions: "Extended infusion over 3 hours to optimize PK/PD target",
      },
    ],
  },
  {
    id: "ord_inpatient_9023_03",
    orderId: "ord_inpatient_9023_03",
    patientId: "P-9023",
    patientName: "Amitabh Sen",
    orderingDoctorId: "usr_doctor_01",
    orderingDoctorName: "Dr. Arvind Patel, MD",
    currentVersionNumber: 1,
    status: "HELD",
    ward: "Oncology Ward 2A",
    bed: "Bed 08",
    scheduleFrequency: "STAT",
    route: "INTRAVENOUS",
    startDate: "2026-10-27T14:30:00Z",
    endDate: "2026-10-27T15:30:00Z",
    notes: "Held pending hepatic function panel verification.",
    createdAt: "2026-10-27T14:30:00Z",
    updatedAt: "2026-10-27T15:00:00Z",
    items: [
      {
        id: "item_ord_04",
        catalogueItemId: "med_ondansetron_8mg",
        canonicalIngredientIds: ["Ondansetron"],
        brandName: "Emeset 8mg IV",
        dose: "8",
        unit: "mg",
        route: "INTRAVENOUS",
        frequency: "STAT",
        duration: "Single dose",
        instructions:
          "Slow IV push over 3-5 minutes prior to chemotherapy cycle",
      },
    ],
  },
  {
    id: "ord_inpatient_9021_04",
    orderId: "ord_inpatient_9021_04",
    patientId: "P-9021",
    patientName: "Rajan Sharma",
    orderingDoctorId: "usr_doctor_01",
    orderingDoctorName: "Dr. Arvind Patel, MD",
    currentVersionNumber: 1,
    status: "DISCONTINUED",
    ward: "Cardiology Ward 4B",
    bed: "Bed 12",
    scheduleFrequency: "BID",
    route: "ORAL",
    startDate: "2026-10-25T08:00:00Z",
    endDate: "2026-10-26T20:00:00Z",
    notes: "Discontinued due to clinical resolution of pyrexia.",
    createdAt: "2026-10-25T08:00:00Z",
    updatedAt: "2026-10-26T20:00:00Z",
    items: [
      {
        id: "item_ord_05",
        catalogueItemId: "med_paracetamol_500",
        canonicalIngredientIds: ["Paracetamol"],
        brandName: "Crocin 500",
        dose: "500",
        unit: "mg",
        route: "ORAL",
        frequency: "BID",
        duration: "2 days",
        instructions: "Take with water after meals",
      },
    ],
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "aud_evt_101",
    timestamp: "2026-10-27T10:45:12Z",
    actorUserId: "usr_doctor_01",
    actorDisplayName: "Dr. Arvind Patel, MD",
    actorRole: "DOCTOR",
    action: "RECORD_DISPOSITION",
    resourceType: "AlertDisposition",
    resourceId: "disp_ddi_001",
    requestId: "req_audit_01_a83",
    ipAddress: "10.0.12.44",
    metadata: {
      alertId: "alert_ddi_001",
      dispositionType: "CLINICALLY_REVIEWED",
      rationale:
        "Patient closely monitored with INR daily. Warfarin dose adjusted to 3mg; aspirin indicated post-stent.",
      caseId: "case_rx_9021_01",
    },
  },
  {
    id: "aud_evt_102",
    timestamp: "2026-10-27T10:50:33Z",
    actorUserId: "usr_pharma_01",
    actorDisplayName: "Priya Sharma, RPh",
    actorRole: "PHARMACIST",
    action: "AUTHORIZE_DISPENSING",
    resourceType: "DispensingAuthorization",
    resourceId: "auth_disp_9021_01",
    requestId: "req_audit_02_b91",
    ipAddress: "10.0.14.88",
    metadata: {
      caseId: "case_rx_9021_01",
      expectedVersion: 1,
      acknowledgement: "WORKFLOW_REQUIREMENTS_REVIEWED",
      patientId: "P-9021",
    },
  },
  {
    id: "aud_evt_103",
    timestamp: "2026-10-27T11:15:00Z",
    actorUserId: "usr_doctor_01",
    actorDisplayName: "Dr. Arvind Patel, MD",
    actorRole: "DOCTOR",
    action: "CREATE_MEDICATION_ORDER",
    resourceType: "MedicationOrder",
    resourceId: "ord_inpatient_9021_01",
    requestId: "req_audit_03_c42",
    ipAddress: "10.0.12.44",
    metadata: {
      patientId: "P-9021",
      itemCount: 2,
      ward: "Cardiology Ward 4B",
      schedule: "Q12H",
    },
  },
  {
    id: "aud_evt_104",
    timestamp: "2026-10-27T09:30:10Z",
    actorUserId: "usr_pharma_01",
    actorDisplayName: "Priya Sharma, RPh",
    actorRole: "PHARMACIST",
    action: "RUN_SAFETY_CHECK",
    resourceType: "CheckRun",
    resourceId: "chk_eval_001",
    requestId: "req_audit_04_d77",
    ipAddress: "10.0.14.88",
    metadata: {
      caseId: "case_rx_9021_01",
      outcome: "FLAGGED",
      alertCount: 1,
      ruleSetVersion: "v1.0.0-illustrative",
    },
  },
  {
    id: "aud_evt_105",
    timestamp: "2026-10-27T08:00:22Z",
    actorUserId: "usr_admin_01",
    actorDisplayName: "Vikram Malhotra (Admin)",
    actorRole: "HOSPITAL_ADMIN",
    action: "APPROVE_MEMBERSHIP",
    resourceType: "Membership",
    resourceId: "mem_02",
    requestId: "req_audit_05_e19",
    ipAddress: "10.0.2.10",
    metadata: {
      targetUserId: "usr_doctor_01",
      targetRole: "DOCTOR",
      hospitalId: "hosp_metro_general",
    },
  },
  {
    id: "aud_evt_106",
    timestamp: "2026-10-26T18:00:00Z",
    actorUserId: "usr_admin_01",
    actorDisplayName: "Vikram Malhotra (Admin)",
    actorRole: "HOSPITAL_ADMIN",
    action: "RESET_DEMO_WORKSPACE",
    resourceType: "DemoWorkspace",
    resourceId: "hosp_metro_general",
    requestId: "req_audit_06_f03",
    ipAddress: "10.0.2.10",
    metadata: {
      confirmPhrase: "RESET-DEMO-METRO",
      scope: "HOSPITAL_TENANT",
    },
  },
];

export const INITIAL_RULE_SETS: ClinicalRuleSet[] = [
  {
    ruleSetId: "RULES-IN-IPC-2026",
    version: "v1.0.0-illustrative",
    description:
      "Illustrative Clinical Decision Support Ruleset for Outpatient & Inpatient Pharmacotherapy",
    status: "PUBLISHED",
    ruleCount: 6,
    isClinicallyValidated: false,
    publishedAt: "2026-10-20T10:00:00Z",
    publishedBy: "Indian Pharmacopoeia Commission (Demonstration)",
    limitations: [
      "Illustrative demonstration ruleset; not clinically validated for diagnostic or unverified treatment decisions.",
      "Food/drink interaction evaluation is not supported in the current release.",
      "Paediatric dosing ranges and weight-adjusted renal clearance calculations are outside demo scope.",
      "Absence of an alert does not certify clinical safety; independent clinician verification remains mandatory.",
    ],
    rules: [
      {
        ruleId: "RULE-DDI-WARFARIN-ASPIRIN",
        name: "Warfarin + Aspirin Concomitant Bleeding Risk",
        category: "DDI",
        severity: "CRITICAL",
        triggerCondition:
          "Co-prescription of Vitamin K Antagonist and Antiplatelet Agent",
        targetIngredients: ["Warfarin", "Aspirin"],
        description:
          "Concomitant administration of Warfarin and Aspirin synergistically impairs hemostasis, exponentially elevating major gastrointestinal and intracerebral hemorrhage hazards.",
        mechanisticRationale:
          "Warfarin inhibits clotting factors II, VII, IX, and X synthesis while Aspirin irreversibly inhibits platelet COX-1.",
        recommendation:
          "Evaluate INR target rigorously. Prescribe proton-pump inhibitor gastroprotection and consider antiplatelet discontinuation if post-stent endothelialization complete.",
        guidelineReference:
          "National Formulary of India (NFI) 2026, Section 10.2",
      },
      {
        ruleId: "RULE-DDI-CIPRO-THEOPHYLLINE",
        name: "Ciprofloxacin + Theophylline Toxicity Risk",
        category: "DDI",
        severity: "HIGH",
        triggerCondition:
          "Co-prescription of Fluoroquinolone and Methylxanthine",
        targetIngredients: ["Ciprofloxacin", "Theophylline"],
        description:
          "Ciprofloxacin markedly inhibits CYP1A2 metabolism of Theophylline, driving serum concentrations into narrow-therapeutic toxic ranges and triggering fatal arrhythmias or seizures.",
        mechanisticRationale:
          "Strong competitive inhibition of cytochrome P450 1A2 hepatic clearance.",
        recommendation:
          "Reduce theophylline dose by 50% with intensive serum drug level monitoring, or switch to alternative non-interacting antibiotic.",
        guidelineReference:
          "British National Formulary (BNF 85), Drug Interactions",
      },
      {
        ruleId: "RULE-DOSE-PARACETAMOL",
        name: "Paracetamol Daily Ceiling Dose Check",
        category: "DOSE_RANGE",
        severity: "HIGH",
        triggerCondition:
          "Total 24-hour paracetamol equivalent dosage exceeds 4000mg",
        targetIngredients: ["Paracetamol"],
        description:
          "Cumulative acetaminophen doses exceeding 4g per 24 hours precipitate hepatic glutathione depletion and acute centrilobular liver necrosis.",
        mechanisticRationale:
          "Excess toxic metabolite NAPQI binds covalently to hepatic macromolecules causing hepatocellular failure.",
        recommendation:
          "Reduce aggregate dose to maximum 3000mg/day (2000mg/day in elderly or malnourished patients). Check for duplicate combination products.",
        guidelineReference:
          "Indian Pharmacopoeia Monograph, Paracetamol Oral Preparations",
      },
      {
        ruleId: "RULE-DOSE-METFORMIN-RENAL",
        name: "Metformin Renal Threshold Screening",
        category: "DOSE_RANGE",
        severity: "MODERATE",
        triggerCondition:
          "Metformin prescribed when eGFR < 45 mL/min/1.73m² or dose > 1000mg in CKD Stage 3",
        targetIngredients: ["Metformin"],
        description:
          "Impaired renal elimination causes metformin accumulation and promotes rare but lethal lactic acidosis.",
        mechanisticRationale:
          "Inhibition of mitochondrial respiratory complex I increases blood lactate levels.",
        recommendation:
          "Reduce dose to 500mg-1000mg daily if eGFR 30-44 mL/min; contraindicate if eGFR < 30 mL/min.",
        guidelineReference:
          "KDIGO 2024 Clinical Practice Guideline for Diabetes Management in CKD",
      },
      {
        ruleId: "RULE-ALLERGY-PENICILLIN",
        name: "Beta-Lactam Antibiotic Cross-Reactivity",
        category: "ALLERGY_CROSS_REACTIVITY",
        severity: "CRITICAL",
        triggerCondition:
          "Prescription of Cephalosporins / Penicillins with documented Penicillin Anaphylaxis",
        targetIngredients: [
          "Amoxicillin",
          "Ampicillin",
          "Ceftriaxone",
          "Cefuroxime",
        ],
        description:
          "Cross-reactivity between beta-lactam core rings and shared R1 side chains carries immediate IgE-mediated anaphylaxis danger.",
        mechanisticRationale:
          "Shared immunogenic beta-lactam epitope or side-chain similarity triggering mast cell degranulation.",
        recommendation:
          "Do not administer beta-lactam antibiotics. Select non-beta-lactam alternative (e.g., Vancomycin, Macrolide, or Fluoroquinolone).",
        guidelineReference: "EAACI Guidelines on Antibiotic Hypersensitivity",
      },
      {
        ruleId: "RULE-DUP-ACE-ARB",
        name: "Dual Renin-Angiotensin System Blockade",
        category: "DUPLICATE_THERAPY",
        severity: "MODERATE",
        triggerCondition:
          "Concomitant prescribing of ACE inhibitor and Angiotensin Receptor Blocker",
        targetIngredients: ["Ramipril", "Telmisartan", "Enalapril", "Losartan"],
        description:
          "Dual RAS blockade yields no incremental cardiovascular benefit while substantially aggravating risks of hyperkalemia, syncope, and acute kidney injury.",
        mechanisticRationale:
          "Redundant pathway inhibition at upstream and receptor levels without additive organ protection.",
        recommendation:
          "Discontinue either the ACE inhibitor or the ARB; maintain monotherapy RAS blockade.",
        guidelineReference:
          "ESC/ESH Guidelines for the Management of Arterial Hypertension",
      },
    ],
  },
];

export const INITIAL_PATIENT_ALLERGIES: PatientAllergy[] = [
  {
    id: "alg_01",
    patientId: "P-9021",
    substanceText: "Penicillin",
    recordType: "ALLERGY",
    reactionDescription:
      "Generalized urticaria, bronchospasm, and facial angioedema within 20 minutes of oral administration in 2021.",
    severity: "SEVERE",
    sourceType: "PATIENT_REPORTED",
    verificationStatus: "REPORTED",
    recordedAt: "2026-10-15T09:00:00Z",
    createdAt: "2026-10-15T09:00:00Z",
  },
  {
    id: "alg_02",
    patientId: "P-9021",
    substanceText: "Sulfamethoxazole / Trimethoprim",
    recordType: "ADVERSE_REACTION",
    reactionDescription:
      "Mild maculopapular rash and epigastric nausea without respiratory involvement.",
    severity: "MILD",
    sourceType: "PATIENT_REPORTED",
    verificationStatus: "REPORTED",
    recordedAt: "2026-10-18T14:30:00Z",
    createdAt: "2026-10-18T14:30:00Z",
  },
];

export const INITIAL_PATIENT_MED_HISTORY: PatientMedicationHistoryItem[] = [
  {
    id: "medhist_01",
    patientId: "P-9021",
    medicineName: "Metformin Hydrochloride",
    dose: "500",
    unit: "mg",
    route: "ORAL",
    frequency: "BID (Twice daily)",
    status: "ACTIVE",
    startDate: "2024-03-01T00:00:00Z",
    sourceType: "PATIENT_REPORTED",
    verificationStatus: "REPORTED",
    createdAt: "2026-10-15T09:15:00Z",
  },
  {
    id: "medhist_02",
    patientId: "P-9021",
    medicineName: "Atorvastatin Calcium",
    dose: "20",
    unit: "mg",
    route: "ORAL",
    frequency: "Q24H (Nightly)",
    status: "ACTIVE",
    startDate: "2025-01-10T00:00:00Z",
    sourceType: "PATIENT_REPORTED",
    verificationStatus: "REPORTED",
    createdAt: "2026-10-15T09:20:00Z",
  },
  {
    id: "medhist_03",
    patientId: "P-9021",
    medicineName: "Omega-3 Fish Oil Softgels",
    dose: "1000",
    unit: "mg",
    route: "ORAL",
    frequency: "Once daily with meals",
    status: "ACTIVE",
    startDate: "2025-06-15T00:00:00Z",
    sourceType: "PATIENT_REPORTED",
    verificationStatus: "REPORTED",
    createdAt: "2026-10-20T11:00:00Z",
  },
];

export interface FixtureNotification {
  id: string;
  recipientUserId: string;
  role?: "PHARMACIST" | "DOCTOR" | "PATIENT" | "HOSPITAL_ADMIN";
  type: string;
  subjectId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const INITIAL_FIXTURE_NOTIFICATIONS: FixtureNotification[] = [
  {
    id: "notif_001",
    recipientUserId: "usr_pharma_01",
    role: "PHARMACIST",
    type: "PRESCRIPTION_ALERT_FLAGGED",
    subjectId: "case_rx_9021_01",
    title: "Prescription Alert Flagged",
    message: "Case case_rx_9021_01 has high-risk Warfarin + Aspirin DDI.",
    read: false,
    createdAt: "2026-10-27T10:15:00Z",
  },
  {
    id: "notif_002",
    recipientUserId: "usr_pharma_01",
    role: "PHARMACIST",
    type: "ALERT_DISPOSITION_RECORDED",
    subjectId: "case_rx_9021_01",
    title: "Physician Disposition Logged",
    message:
      "Dr. Arvind Patel recorded CHANGE_REQUIRED on Case case_rx_9021_01.",
    read: true,
    createdAt: "2026-10-27T09:30:00Z",
  },
  {
    id: "notif_003",
    recipientUserId: "usr_doctor_01",
    role: "DOCTOR",
    type: "PRESCRIPTION_ALERT_FLAGGED",
    subjectId: "alert_warfarin_aspirin_01",
    title: "Clinical Safety Triage Required",
    message:
      "Outpatient case case_rx_9021_01 requires physician clinical review.",
    read: false,
    createdAt: "2026-10-27T10:16:00Z",
  },
  {
    id: "notif_004",
    recipientUserId: "usr_doctor_01",
    role: "DOCTOR",
    type: "APPOINTMENT_BOOKED",
    subjectId: "apt_001",
    title: "New Consultation Booked",
    message:
      "Patient Rajan Sharma scheduled consultation for Cardiology review.",
    read: false,
    createdAt: "2026-10-27T08:45:00Z",
  },
  {
    id: "notif_005",
    recipientUserId: "usr_patient_01",
    role: "PATIENT",
    type: "APPOINTMENT_BOOKED",
    subjectId: "apt_001",
    title: "Appointment Confirmed",
    message: "Consultation booked with Dr. Arvind Patel at Cardiology Clinic.",
    read: false,
    createdAt: "2026-10-27T08:45:00Z",
  },
  {
    id: "notif_006",
    recipientUserId: "usr_admin_01",
    role: "HOSPITAL_ADMIN",
    type: "MEMBERSHIP_REQUEST",
    subjectId: "mem_03",
    title: "New Credential Request",
    message: "Dr. Neha Rao submitted staff membership application.",
    read: false,
    createdAt: "2026-10-27T08:00:00Z",
  },
];
