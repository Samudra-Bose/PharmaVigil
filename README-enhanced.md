# PharmaVigil — Frontend Portal

> **VentureForge | Outpatient Medication Safety Platform**  
> A role-based clinical decision-support frontend designed to support prescription review, medication reconciliation, drug-interaction checks, and controlled dispensing workflows.

PharmaVigil brings pharmacists, doctors, patients, and hospital administrators into one structured platform. Its workflows emphasize verified patient identity, human-reviewed prescription OCR, transparent clinical alerts, traceable prescription revisions, and fail-closed dispensing authorization.

> **Clinical safety notice:** This frontend is a decision-support interface, not a substitute for professional clinical judgment. Demo rules and synthetic records must not be represented as validated medical advice.

---

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Clinical Portals](#clinical-portals)
- [Clinical Safety Principles](#clinical-safety-principles)
- [Accessibility and Responsive Design](#accessibility-and-responsive-design)
- [Testing and Quality Checks](#testing-and-quality-checks)
- [Development Guidelines](#development-guidelines)
- [Limitations and Integration Notes](#limitations-and-integration-notes)

---

## Overview

PharmaVigil is a responsive, information-dense clinical workspace organized around four role-specific portals:

| Portal | Primary purpose |
| --- | --- |
| **Pharmacist** | Verify patient identity, review prescription OCR, reconcile medicines, inspect alerts, and manage dispensing workflow |
| **Doctor** | Triage flagged cases, document clinical rationale, and create traceable prescription revisions |
| **Patient** | View authorized medication information and manage consultation appointments |
| **Hospital Administrator** | Review staff registration requests, manage access, and reset isolated demo data |

The frontend is built to support clear decision-making and traceable workflows. It distinguishes verified information from unverified input and avoids presenting the absence of a matching rule as proof that a prescription is safe.

## Core Capabilities

- **Role-based workspaces** for pharmacists, doctors, patients, and hospital administrators.
- **Patient identity verification** requiring two identifiers before a prescription is linked to a patient.
- **Human-reviewed prescription OCR** with explicit review and confirmation of every extracted medication line.
- **Medicine catalogue reconciliation** to help reviewers compare extracted prescription details with catalogue entries.
- **Clinical alert review** for supported drug-drug interactions, allergies, and contraindications.
- **Controlled dispensing authorization** that remains blocked when required checks or safety resolutions are incomplete.
- **Physician rationale and revision tracking** with previous prescription versions preserved.
- **Patient appointments and medication views** that exclude restricted internal clinical information.
- **Administrative staff lifecycle management** for clinician registration, approval, and suspension.
- **Typed API integration** based on the project's pinned OpenAPI contract.
- **Automated frontend tests** for key workflows, access boundaries, and safety gates.

---

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| UI | React 18 |
| Language | TypeScript 5.x, strict mode, ES2022 target |
| Styling | Tailwind CSS 3.4 |
| Component primitives | shadcn/ui and Radix UI |
| Additional components | daisyUI 4, scoped with the `du-` prefix |
| Icons | Lucide |
| Motion and visual effects | Existing Magic UI, Aceternity, and Mantine integrations where appropriate |
| Testing | Vitest, React Testing Library, and jsdom |
| API contracts | OpenAPI 3.1-compatible generated TypeScript types, subject to the checked-in contract version |
| Tooling | TypeScript compiler, PostCSS, Autoprefixer, and `openapi-typescript` |

> Keep the existing dependency set where practical. Before introducing a new package or replacing an existing UI primitive, check whether the repository already provides the required capability.

---

## Project Structure

```text
PharmaVigil-frontend/
├── docs/
│   ├── 01-shared/                    # Vision, assumptions, hazard analysis, glossary
│   ├── 02-frontend/                  # Frontend PRD, workflows, route inventory
│   ├── 03-backend/                   # Backend PRD, data model, rules, endpoints
│   ├── 04-contracts/                 # OpenAPI specification and integration contract
│   ├── 05-quality/                   # Test strategy and release checklist
│   ├── 06-operations/                # Deployment and operational guidance
│   ├── sources/                      # Research source register
│   ├── package-manifest.json
│   ├── project-manifest.json
│   ├── README.md
│   ├── REPO-HANDOFF.md
│   ├── feature-completeness-matrix.md
│   └── walkthrough.md
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── admin/                    # Hospital administration
│   │   ├── auth/                     # Login, registration, approval, logout
│   │   ├── doctor/                   # Clinical triage and revisions
│   │   ├── patient/                  # Medication views and appointments
│   │   ├── pharmacist/               # Verification, OCR, reconciliation, checks
│   │   ├── unauthorized/             # Unauthorized-access page
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                       # Shared UI primitives
│   │   ├── clinical/                 # Clinical alerts, steppers, rule notices
│   │   ├── layout/                   # App shell, navigation, demo banner
│   │   └── aceternity/               # Existing visual patterns
│   ├── context/                      # Authentication and demo contexts
│   ├── lib/
│   │   ├── api.ts                    # Typed API client and error handling
│   │   ├── mock-engine.ts             # Deterministic demo rules and fixtures
│   │   └── utils.ts                  # Shared utilities
│   └── types/
│       ├── api.generated.ts           # Generated API contract types
│       └── index.ts                  # Domain types
├── tests/                            # Vitest test suites
├── scratch/                          # Development notes and captures
├── .env.example
├── .gitignore
├── next.config.mjs
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

*The tree above documents the expected project layout. Verify actual files and route names against the checked-out repository before making implementation changes.*

---

## Getting Started

### Prerequisites

- Node.js version compatible with the repository's Next.js 14 dependencies.
- npm.
- Access to the configured backend API, or an explicitly enabled demo environment.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Set the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

The application may use the Next.js proxy configuration to route requests through `/api/v1`. Check `next.config.mjs` and `src/lib/api.ts` to confirm the active configuration.

**Important:** Never place private API keys, credentials, or server-only secrets in `NEXT_PUBLIC_*` variables. Values with this prefix are exposed to the browser.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production application |
| `npm start` | Start the compiled production server |
| `npm run typecheck` | Run TypeScript validation with `tsc --noEmit` |
| `npm test` | Run the automated test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run Next.js ESLint validation |
| `npm run generate:types` | Regenerate API types from the configured OpenAPI specification |

Run scripts from the repository root. Confirm their definitions in `package.json` if the project has changed.

---

## Clinical Portals

### 1. Pharmacist Portal — `/pharmacist`

The pharmacist workspace guides users through prescription review and dispensing checks.

#### Patient verification

- Search supported synthetic hospital records.
- Confirm two patient identifiers before linking a prescription.
- Prevent progression when required identity checks are incomplete or inconsistent.

#### Prescription capture and OCR review

- Display extracted prescription content as **unverified**.
- Require individual review and confirmation of each extracted medication line.
- Allow supported corrections before reconciliation.
- Preserve the distinction between source content and reviewer-confirmed information.

#### Medicine reconciliation and clinical checks

- Compare prescription entries with supported medicine catalogue records.
- Review available drug-drug interaction, allergy, and contraindication results.
- Clearly communicate the severity and status of each alert.
- Identify missing, ambiguous, or unavailable information rather than assuming it is safe.

#### Dispensing authorization

- Keep authorization blocked while mandatory checks remain incomplete or blocking alerts remain unresolved.
- Require the appropriate authorized disposition.
- Explain why an action is unavailable.
- Revalidate authorization conditions at the time of the operation.

### 2. Doctor Portal — `/doctor`

The doctor workspace supports clinical triage and documented prescription decisions.

- Prioritized queue of held cases and clinical alerts.
- Case details with relevant verified medication information.
- Clinical disposition and prescription change workflows.
- Mandatory rationale of at least 15 characters for applicable decisions.
- Clear validation messages and rationale-length feedback.
- New immutable prescription revisions rather than silent overwrites.
- Traceable history of previous revisions and decisions.

### 3. Patient Portal — `/patient`

The patient portal presents authorized information in plain language.

- Verified active medications and prescribed schedules.
- Appointment booking and appointment history.
- Relevant medication history.
- Clear consultation and clinician details.
- Responsive forms, accessible controls, and helpful empty states.

Internal triage notes, restricted audit records, raw OCR scans, and privileged administrative data must not be exposed to patients.

### 4. Hospital Administrator Portal — `/admin`

The administrator workspace supports staff and demo-environment administration.

- Review pending clinician registrations.
- Verify credentials and medical-license information through supported workflows.
- Approve or suspend staff access.
- View role and account status.
- Record privileged administrative actions.
- Reset isolated demo data only after explicit confirmation.

The existing demo-reset workflow requires the confirmation phrase:

```text
RESET-DEMO-METRO
```

The reset must remain isolated from other tenants and production records.

### 5. Authentication and Authorization

The authentication routes support login, registration, pending approval, logout, and unauthorized-access handling.

- Apply role-aware navigation and route guards.
- Handle expired sessions and failed API requests clearly.
- Prevent unauthorized users from accessing privileged screens.
- Enforce permissions on the backend for every protected operation.

> Client-side route protection is a user-experience measure, not a replacement for server-side authorization.

---

## Clinical Safety Principles

These requirements are mandatory and must be preserved during UI and implementation changes.

### 1. No false reassurance

An absent matching rule (`NO_MATCHING_RULE`) must **never** be displayed as “Safe,” “Cleared,” or an equivalent clinical assurance. Use neutral language that explains the limitations of the available rule coverage.

### 2. Human verification of OCR

OCR output is untrusted input. Every extracted medication line must be reviewed and confirmed before the workflow progresses.

### 3. Accessible severity indicators

Critical, Moderate, and Advisory states must use both a visible text descriptor and a distinct icon. Maintain sufficient contrast and never communicate severity through color alone.

### 4. Mandatory physician rationale

Applicable clinical overrides and prescription revisions require documented justification from the attending physician. Validate the minimum length and preserve the submitted rationale in the appropriate audit trail.

### 5. Fail-closed dispensing

Dispensing authorization must remain unavailable when required checks are incomplete or blocking alerts are unresolved. Enforce this rule on the backend as well as in the interface.

### 6. Immutable prescription history

Prescription changes must create new revisions while preserving prior versions and their audit history.

### 7. Privacy and role boundaries

Patient, clinician, pharmacist, and administrator data must be scoped to authorized roles and tenants. Do not rely solely on hiding UI elements to protect sensitive information.

### 8. Honest uncertainty

Missing data, unavailable services, stale results, and incomplete rule coverage must be communicated explicitly. Never invent clinical evidence or imply that illustrative demo rules constitute validated medical guidance.

---

## Accessibility and Responsive Design

Aim for **WCAG 2.2 AA** and verify the implementation with automated and manual checks.

- Use semantic HTML, meaningful headings, and accessible labels.
- Ensure all interactive controls work with a keyboard.
- Provide visible focus indicators.
- Associate validation messages with their form fields.
- Announce meaningful status updates to assistive technologies.
- Maintain sufficient contrast for text, icons, borders, and focus states.
- Support reduced-motion preferences.
- Provide usable layouts on mobile, tablet, desktop, and high-zoom viewports.
- Make dense tables navigable on narrow screens without hiding critical safety information.
- Ensure modal dialogs manage focus and support keyboard dismissal when appropriate.

---

## Testing and Quality Checks

The project includes or is intended to include automated tests for the core clinical and access-control workflows.

| Test area | Expected verification |
| --- | --- |
| Patient verification | Prescription progression is blocked until both required identifiers are confirmed |
| OCR review | Unreviewed medication lines prevent progression |
| Clinical safety gates | Unresolved blocking alerts prevent dispensing authorization |
| Physician rationale | Invalid or too-short rationale is rejected |
| Prescription revisions | New versions preserve previous revision history |
| Role guards | Unauthorized users cannot access protected portal workflows |
| Registration and administration | Staff approval and suspension follow the supported lifecycle |
| Appointments | Booking and appointment views validate the relevant workflow |
| Demo reset | Explicit confirmation and tenant isolation are enforced |
| Error handling | Failed requests produce clear, recoverable UI states |

Run the quality checks before submitting changes:

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

Record which checks passed and report any existing or unresolved failures accurately. A successful frontend test suite does not, by itself, establish clinical validity or production readiness.

---

## Development Guidelines

- Inspect the current repository and documentation before changing routes, API contracts, or shared components.
- Prefer reusable components and consistent design tokens.
- Preserve strict TypeScript typing; avoid `any` unless justified.
- Use the existing typed API client and documented endpoint contracts.
- Keep demo fixtures and deterministic mock rules clearly separated from production integrations.
- Provide loading, empty, success, error, and retry states for asynchronous workflows.
- Prevent duplicate submissions for important operations.
- Confirm destructive actions and explain blocked actions.
- Avoid decorative controls that do not perform their advertised behavior.
- Do not invent undocumented endpoints, clinical rules, or backend capabilities.
- Keep changes focused and test safety-critical workflows after modifying shared components.

---

## Limitations and Integration Notes

- Backend availability, authentication enforcement, and API behavior depend on the configured service and its implementation.
- The presence of a frontend safety gate does not guarantee equivalent backend enforcement; verify both layers.
- Demo records and illustrative rules are not substitutes for validated clinical databases or professional review.
- Production use requires appropriate clinical validation, privacy and security review, operational monitoring, and jurisdiction-specific compliance assessment.
- Confirm the actual repository structure, OpenAPI version, routes, and scripts against the current codebase before relying on this README as an implementation contract.

---

## Project Goal

PharmaVigil aims to make outpatient medication-safety workflows clearer, more traceable, and easier to review by combining role-specific workspaces with explicit verification steps and conservative authorization controls.

**Build for clinical clarity, safety, accessibility, and auditability—not just visual polish.**
