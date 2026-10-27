# PharmaVigil — Feature Completeness Matrix

This matrix tracks the implementation and verification status of every route, workflow, safety gate, and interaction across the PharmaVigil platform against the canonical PRD (`02-frontend/FRONTEND_PRD.md`), Route Inventory (`02-frontend/route-inventory.md`), and OpenAPI 3.1.1 contract (`04-contracts/openapi.yaml`).

### Status Definitions:
- **VERIFIED:** Implemented, verified against explicit acceptance criteria, automated tests passing.
- **PARTIAL:** Implemented, but specific edge cases or cross-route persistence need completion.
- **UI ONLY:** Interface rendered, but underlying workflow or persistence handler is missing.
- **MISSING:** Required route or capability not yet implemented.
- **BLOCKED:** Requires unreleased external service or unavailable third-party dependency.
- **OUT OF SCOPE:** Explicitly excluded by PRD boundaries (e.g., real clinical CDS, MAR, external SMS).

---

## 1. Authentication & Membership Lifecycle

| Feature ID | Route / Scope | Requirement & Expected Behavior | PRD Reference | Status | Verification & Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-AUTH-001** | `/auth/login` | Multi-role authentication with synthetic persona fast-switcher. | PRD §Role-specific / Route Inventory UI-AUTH-002 | **VERIFIED** | `src/app/auth/login/page.tsx`, `AuthContext.tsx`. Authenticates Pharmacist, Doctor, Patient, and Admin. |
| **FEAT-AUTH-002** | `/auth/register` | Staff/patient registration form. Clinical roles require admin approval and route to pending state. | PRD §Role-specific / Route Inventory UI-AUTH-001 | **VERIFIED** | `src/app/auth/register/page.tsx`. Persists new applicant to pending membership list. |
| **FEAT-AUTH-003** | `/auth/pending` | Informative pending screen for unapproved accounts. | Route Inventory UI-AUTH-003 | **VERIFIED** | `src/app/auth/pending/page.tsx`. Prevents access to clinical portals until admin approves. |
| **FEAT-AUTH-004** | `/auth/logout` | Session revocation, clearing protected client state and redirecting to sign-in. | PRD §Global shell / Route Inventory UI-AUTH-007 | **VERIFIED** | `src/app/auth/logout/page.tsx`, `AuthContext.tsx`. Clears memory and redirects safely. |

---

## 2. Pharmacist Portal Workflows

| Feature ID | Route / Scope | Requirement & Expected Behavior | PRD Reference | Status | Verification & Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-PHARM-001** | `/pharmacist` | Outpatient queue, filter by status (Needs Action, Ready, Authorized), KPI metrics strip. | PRD §Pharmacist / Route Inventory UI-PHARM-001 | **VERIFIED** | `src/app/pharmacist/page.tsx`. Uses clinical `Table` and `Card` primitives. |
| **FEAT-PHARM-002** | `/pharmacist/patients/search` | Fast lookup by patient synthetic hospital ID, name, or phone. Quick fixture chips. | PRD §Pharmacist / Route Inventory UI-PHARM-002 | **VERIFIED** | `src/app/pharmacist/patients/search/page.tsx`. Searches patient registry. |
| **FEAT-PHARM-003** | `/pharmacist/patients/[id]/confirm` | Explicit 2-identifier verification gate before prescription capture. | PRD §Pharmacist / REQ-PROD-003 | **VERIFIED** | `src/app/pharmacist/patients/[id]/confirm/page.tsx`. Tested by `safety-gates.test.tsx`. |
| **FEAT-PHARM-004** | `/pharmacist/capture` | Image ingestion with click-to-zoom Radix Dialog, file upload input, and manual fallback tabs. | PRD §Pharmacist / Route Inventory UI-PHARM-004 | **VERIFIED** | `src/app/pharmacist/capture/page.tsx`. Ingests scan and creates case. |
| **FEAT-PHARM-005** | `/pharmacist/cases/[id]/extract` | Untrusted OCR extraction review with editable text lines, confidence hints, and line add/remove. | REQ-SAFE-001 / Route Inventory UI-PHARM-005 | **VERIFIED** | `src/app/pharmacist/cases/[id]/extract/page.tsx`. Persists edited lines to case. |
| **FEAT-PHARM-006** | `/pharmacist/cases/[id]/medicines` | Catalogue matching. Ambiguous or unmapped items hard-block progression. | REQ-SAFE-002 / Route Inventory UI-PHARM-006 | **VERIFIED** | `src/app/pharmacist/cases/[id]/medicines/page.tsx`. Maps to canonical ingredients. |
| **FEAT-PHARM-007** | `/pharmacist/cases/[id]/check` | Deterministic safety rule engine execution against `v1.0.0-illustrative`. | REQ-PROD-003 / Route Inventory UI-PHARM-007 | **VERIFIED** | `src/app/pharmacist/cases/[id]/check/page.tsx`. Evaluates drug interactions. |
| **FEAT-PHARM-008** | `/pharmacist/cases/[id]/results` | Interactive outcome viewer: alerts, limitations, coverage matrix. Strictly neutral `NO_MATCHING_RULE`. | REQ-SAFE-005 / Route Inventory UI-PHARM-008 | **VERIFIED** | `src/app/pharmacist/cases/[id]/results/page.tsx`. Tested by `safety-gates.test.tsx`. |
| **FEAT-PHARM-009** | `/pharmacist/cases/[id]/authorize` | Fails-closed dispensing sign-off. Blocked until zero open alerts remain and recheck passes. | REQ-SAFE-006 / Route Inventory UI-PHARM-009 | **VERIFIED** | `src/app/pharmacist/cases/[id]/authorize/page.tsx`. Enforces expected revision concurrency. |
| **FEAT-PHARM-010** | `/pharmacist/history` | Audit trail of historical case revisions, check runs, and recorded authorizations. | REQ-SAFE-008 / Route Inventory UI-PHARM-010 | **VERIFIED** | `src/app/pharmacist/history/page.tsx`. Displays immutable revision progression. |

---

## 3. Doctor Portal Workflows

| Feature ID | Route / Scope | Requirement & Expected Behavior | PRD Reference | Status | Verification & Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-DOC-001** | `/doctor` | Clinical triage deck prioritized by severity (Critical > High > Moderate). Status ping cues. | PRD §Doctor / Route Inventory UI-DOCTOR-001 | **VERIFIED** | `src/app/doctor/page.tsx`. Displays pending alerts requiring action. |
| **FEAT-DOC-002** | `/doctor/tasks/[id]` | Alert deep-dive with patient context, evidence reference (NFI), and prescribed medication list. | PRD §Doctor / Route Inventory UI-DOCTOR-002 | **VERIFIED** | `src/app/doctor/tasks/[id]/page.tsx`. Links to disposition form. |
| **FEAT-DOC-003** | `/doctor/tasks/[id]/disposition` | Mandatory rationale input ($\ge 15$ chars) for `CHANGE_REQUIRED` or `CLINICALLY_REVIEWED`. | REQ-SAFE-006 / Route Inventory UI-DOCTOR-003 | **VERIFIED** | `src/app/doctor/tasks/[id]/disposition/page.tsx`. Tested by `safety-gates.test.tsx`. |
| **FEAT-DOC-004** | `/doctor/prescriptions` | Prescription ledger showing revision numbers and active statuses across hospital patients. | Route Inventory UI-DOCTOR-004 | **VERIFIED** | `src/app/doctor/prescriptions/page.tsx`. Displays case history. |
| **FEAT-DOC-005** | `/doctor/prescriptions/new` | Immutable revision editor. Substitutes interacting drugs, increments revision, preserves history. | REQ-SAFE-008 / Route Inventory UI-DOCTOR-005 | **VERIFIED** | `src/app/doctor/prescriptions/new/page.tsx`. Tested by `revisions.test.tsx`. |
| **FEAT-DOC-006** | `/doctor/appointments` | View scheduled patient consultations, dates, time slots, and attendance status. | PRD §Doctor / Route Inventory UI-DOCTOR-008 | **VERIFIED** | `src/app/doctor/appointments/page.tsx`. Backed by OpenAPI `/appointments`. |

---

## 4. Patient Portal Workflows

| Feature ID | Route / Scope | Requirement & Expected Behavior | PRD Reference | Status | Verification & Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-PAT-001** | `/patient` | Patient health dashboard with active prescription cards, pharmacy counter hours, and support. | PRD §Patient / Route Inventory UI-PAT-001 | **VERIFIED** | `src/app/patient/page.tsx`. Zero internal clinical note leaks. |
| **FEAT-PAT-002** | `/patient/prescriptions` | Active prescriptions list with plain-language status (Under Review / Ready for Pick-up). | Route Inventory UI-PAT-002 | **VERIFIED** | `src/app/patient/prescriptions/page.tsx`. Plain-language instructions. |
| **FEAT-PAT-003** | `/patient/prescriptions/[id]` | Detailed dosing routine (morning/evening pills, route, duration). Strictly isolated from staff audits. | Route Inventory UI-PAT-003 | **VERIFIED** | `src/app/patient/prescriptions/[id]/page.tsx`. Displays daily medication schedule. |
| **FEAT-PAT-004** | `/patient/appointments` | Patient view of upcoming and past hospital appointments with doctor and cancel action. | Route Inventory UI-PAT-004 | **VERIFIED** | `src/app/patient/appointments/page.tsx`. Backed by OpenAPI `/appointments`. |
| **FEAT-PAT-005** | `/patient/appointments/new` | Appointment booking form with attending doctor selection, department, and date/time. | Route Inventory UI-PAT-005 | **VERIFIED** | `src/app/patient/appointments/new/page.tsx`. Backed by OpenAPI `/appointments`. |
| **FEAT-PAT-006** | `/patient/history` | Historical completed and dispensed medications ledger. | Route Inventory UI-PAT-006 | **VERIFIED** | `src/app/patient/history/page.tsx`. Historical prescription logs. |

---

## 5. Hospital Administrator Workflows

| Feature ID | Route / Scope | Requirement & Expected Behavior | PRD Reference | Status | Verification & Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-ADM-001** | `/admin` | Administration overview with pending queue, staff counters, and scoped demo reset link. | Route Inventory UI-ADMIN-001 | **VERIFIED** | `src/app/admin/page.tsx`. Quick link to review pending staff. |
| **FEAT-ADM-002** | `/admin/memberships` | Membership requests table with role assignment, status filtering, and quick actions. | Route Inventory UI-ADMIN-002 | **VERIFIED** | `src/app/admin/memberships/page.tsx`. Manages hospital staff access. |
| **FEAT-ADM-003** | `/admin/memberships/[id]` | Detailed membership configuration: assign clinical roles (DOCTOR, PHARMACIST) or suspend. | Route Inventory UI-ADMIN-003 | **VERIFIED** | `src/app/admin/memberships/[id]/page.tsx`. Updates membership status. |
| **FEAT-ADM-004** | `/admin/users` | Clinician directory of authorized hospital staff. | Route Inventory UI-ADMIN-004 | **VERIFIED** | `src/app/admin/users/page.tsx`. Table of verified hospital personnel. |
| **FEAT-ADM-005** | `/admin/demo-reset` | High-consequence scoped reset requiring exact confirmation phrase `RESET-DEMO-METRO`. | REQ-SEC-006 / Route Inventory UI-ADMIN-008 | **VERIFIED** | `src/app/admin/demo-reset/page.tsx`. Resets synthetic demo state. |

---

## 6. Shared & Cross-Cutting Capabilities

| Feature ID | Route / Scope | Requirement & Expected Behavior | PRD Reference | Status | Verification & Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-SHR-001** | `/unauthorized` | 403 Forbidden Access Guard. Denies access to roles outside authorized scope. | PRD §Architecture / Route Inventory UI-SHARED-001 | **VERIFIED** | `src/app/unauthorized/page.tsx`. Tested by `role-guards.test.tsx`. |
| **FEAT-SHR-002** | `/_not-found` | Safe 404 handler without tenant leakage. | Route Inventory UI-SHARED-002 | **VERIFIED** | `src/app/not-found.tsx`. Clear navigation fallback. |
| **FEAT-SHR-003** | `/error` | Safe recoverable error screen with request ID. | Route Inventory UI-SHARED-003 | **VERIFIED** | `src/app/error.tsx`. Displays error code & requestId. |
| **FEAT-SHR-004** | Global Banner | Persistent notice: `[DEMO MOCK MODE — SYNTHETIC DATA]` and clinical non-validation notice. | PRD §Global shell | **VERIFIED** | `src/components/layout/GlobalBanner.tsx`. Appears on every authenticated view. |
