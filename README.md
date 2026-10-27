# PharmaVigil — Frontend Portal

Responsive, high-density clinical decision support web application for the **PharmaVigil** (VentureForge) Outpatient Medication Safety Platform.

PharmaVigil provides role-specific clinical workspaces across **Pharmacist**, **Doctor**, **Patient**, and **Hospital Administrator** portals, integrating interactive prescription OCR extraction review, medicine catalogue reconciliation, real-time deterministic drug interaction check results, physician revision tracking, and gated dispensing authorizations.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, React 18 Server & Client Components)
- **Language:** TypeScript 5.x (Strict mode, ES2022 target)
- **Styling & Design System:**
  - [Tailwind CSS 3.4](https://tailwindcss.com/) with clinical semantic color tokens
  - [shadcn/ui](https://ui.shadcn.com/) & [Radix UI Primitives](https://www.radix-ui.com/) (Dialog, Tabs, Separator, Slot, Tooltip)
  - [daisyUI 4](https://daisyui.com/) (Scoped with `du-` prefix to prevent class collisions)
  - [Lucide Icons](https://lucide.dev/)
  - Micro-animations: Magic UI border beams, Aceternity grid patterns, Mantine keyboard shortcuts
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jsdom](https://github.com/jsdom/jsdom)
- **API Integration:** Generated TypeScript contracts typed against the pinned OpenAPI 3.1 specification
- **Developer Tooling:** `tsc`, `postcss`, `autoprefixer`, `openapi-typescript`

---

## 📂 Project Directory Structure

```text
PharmaVigil-frontend/
├── docs/                                  # Full PRD and documentation pack
│   ├── 01-shared/                         # Vision, assumptions, clinical hazard analysis, glossary
│   ├── 02-frontend/                       # Frontend PRD, agent workflow, route inventory
│   ├── 03-backend/                        # Backend PRD, data model, rules data spec, endpoint inventory
│   ├── 04-contracts/                      # Pinned OpenAPI 3.0 specification & integration contract
│   ├── 05-quality/                        # Test strategy & traceability release checklist
│   ├── 06-operations/                     # Deployment guide, operations, one-day implementation plan
│   ├── sources/                           # Research source register
│   ├── package-manifest.json              # Package manifest
│   ├── project-manifest.json              # Project manifest
│   ├── README.md                          # Documentation pack index
│   ├── REPO-HANDOFF.md                    # Cross-repository contract & handoff rules
│   ├── feature-completeness-matrix.md     # 34-route completeness audit & compliance matrix
│   └── walkthrough.md                     # Comprehensive clinical UX & verification walkthrough
├── src/
│   ├── app/                               # Next.js App Router hierarchy (34 routes across 4 portals)
│   │   ├── admin/                         # Admin portal: memberships, user registry, demo reset
│   │   ├── auth/                          # Authentication: login, register, pending approval, logout
│   │   ├── doctor/                        # Doctor portal: triage queue, disposition modal, revisions
│   │   ├── patient/                       # Patient portal: active meds, appointments, history
│   │   ├── pharmacist/                    # Pharmacist portal: triage, 2-ID match, capture, OCR, checks
│   │   ├── unauthorized/                  # 403 Forbidden role boundary guard
│   │   ├── not-found.tsx                  # 404 Route Not Found
│   │   ├── error.tsx                      # Recoverable error boundary with Request ID support
│   │   ├── layout.tsx                     # Root shell layout, typography & theme providers
│   │   └── page.tsx                       # Root landing / portal dispatcher
│   ├── components/                        # UI component library
│   │   ├── ui/                            # shadcn/ui & Radix UI primitives (Card, Table, Dialog, etc.)
│   │   ├── clinical/                      # Domain clinical widgets (AlertCard, Stepper, RuleNotice, etc.)
│   │   ├── layout/                        # Global shell, navigation sidebar, demo banner
│   │   └── aceternity/                    # Ambient background visual patterns
│   ├── context/                           # React context providers (AuthContext, DemoContext)
│   ├── lib/                               # Application utilities & client services
│   │   ├── api.ts                         # Unified typed API client with error handling
│   │   ├── mock-engine.ts                 # Deterministic synthetic rules, catalogue, & fixture store
│   │   └── utils.ts                       # Classnames merger (clsx + tailwind-merge)
│   └── types/                             # Type declarations & pinned API contracts
│       ├── api.generated.ts               # Generated OpenAPI schema types
│       └── index.ts                       # Domain entity types (Patient, Case, Rule, Alert, User)
├── tests/                                 # Automated Vitest test suites
│   ├── appointments.test.tsx              # Patient booking & doctor consultation schedules
│   ├── pharmacist-workflow.test.tsx       # Pharmacist 2-ID confirmation, OCR review, results
│   ├── registration-and-admin.test.tsx    # Applicant registration & admin approval lifecycle
│   ├── revisions.test.tsx                 # Physician immutable prescription revision progression
│   ├── role-guards.test.tsx               # RBAC protection across unauthorized portals
│   ├── safety-gates.test.tsx              # Fails-closed dispensing & mandatory doctor rationale
│   └── setup.ts                           # jsdom matchers & test environment bootstrap
├── scratch/                               # Scratch scripts, plannings & responsive capture logs
├── .env.example                           # Client environment variable template
├── .gitignore                             # Git ignore rules
├── next.config.mjs                        # Next.js build & reverse proxy configuration
├── next-env.d.ts                          # Next.js TypeScript declarations
├── package.json                           # Scripts and dependencies
├── package-lock.json                      # Pinned dependency tree
├── postcss.config.mjs                     # PostCSS plugins
├── tailwind.config.ts                     # Tailwind CSS clinical color tokens & theme extensions
├── tsconfig.json                          # Strict TypeScript compiler options
└── vitest.config.ts                       # Vitest test runner configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
Configure your backend API base URL in `.env.local` (default: `http://localhost:3001` or `/api/v1` via Next.js proxy rewrite):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 3. Available Scripts
- `npm run dev`: Launch local development server on `http://localhost:3000`
- `npm run build`: Compile production Next.js App Router bundle
- `npm start`: Start compiled production server
- `npm run typecheck`: Run TypeScript compiler validation (`tsc --noEmit`)
- `npm test`: Run automated test suites with Vitest
- `npm run test:watch`: Run tests in interactive watch mode
- `npm run lint`: Run Next.js ESLint validation
- `npm run generate:types`: Regenerate API client types from `docs/04-contracts/openapi.yaml`

---

## 🏥 Clinical Portals & Core Workflows

### 1. Pharmacist Portal (`/pharmacist`)
- **Patient Verification Hard Gate:** Search synthetic hospital records (`P-9021`, `P-9022`, `P-9023`) and enforce mandatory 2-identifier confirmation before linking a prescription.
- **Untrusted OCR Boundary:** Raw optical extraction text is visually demarcated with warning callouts; each extracted item must be individually confirmed by a licensed pharmacist before progression.
- **Clinical Rule Evaluation:** Real-time check against illustrative safety rules (Drug-Drug Interactions, Allergies, Contraindications).
- **Fails-Closed Dispensing Authorization:** Dispensing approval button remains mechanically disabled until all clinical alerts are resolved or physician-authorized.

### 2. Doctor Portal (`/doctor`)
- **Urgent Triage Deck:** Prioritized queue of held outpatient cases and clinical alerts.
- **Mandatory Clinical Justification:** Attending physicians cannot record dispositions or change requests without documenting at least 15 characters of typed clinical rationale.
- **Immutable Prescription Revisions:** Revising a flagged medication creates a new immutable version (`Revision 2`) while strictly preserving prior audit history.

### 3. Patient Portal (`/patient`)
- **Health Portal Summary:** Plain-language view of verified active medications, dosing schedules, and attending clinicians.
- **Data Isolation:** Internal hospital triage notes, audit logs, and raw optical scans are strictly excluded from patient visibility.
- **Consultation Booking:** Schedule and view appointments with hospital clinicians.

### 4. Hospital Administrator Portal (`/admin`)
- **Staff Credential Lifecycle:** Review pending clinician registration requests, verify medical licenses, and approve/suspend hospital privileges.
- **Demo Workspace Reset:** Isolated tenant reset requiring explicit confirmation (`RESET-DEMO-METRO`) to restore clean demo state without affecting other workspaces.

---

## 🔒 Non-Negotiable Clinical Safety Principles

1. **Zero False Reassurance:** Absence of a triggered alert (`NO_MATCHING_RULE`) is **never** displayed as "Safe" or with a green clearance badge. The system presents a neutral slate indicator with explicit limitations and coverage matrices.
2. **Untrusted OCR Extraction:** Optical character recognition output is treated as unverified input. Progression is blocked until each extracted medication line has been reviewed and confirmed.
3. **Dual-Cue Severity Indicators:** Severity levels (Critical, Moderate, Advisory) always combine distinct icons and clear text descriptors with accessible contrast ($\ge 4.5:1$).
4. **Mandatory Physician Rationale:** Every clinical override or prescription revision requires documented justification from the attending doctor.
5. **Fails-Closed Dispensing:** Pharmacist dispensing sign-off remains disabled as long as unresolved alerts exist.
