# PharmaVigil — Next-Level Pinterest & Dribbble Bento Grid UI Plan

## 1. Aesthetic Direction & References
- **Inspiration**: Top Pinterest & Dribbble Healthcare / SaaS Dashboards (Medora, AeuxGlobal, Donezo, Apple-style Bento Grids).
- **Core Philosophy**:
  1. **Bento Grid Modularity**: Asymmetric, responsive 12-column layouts that balance rich clinical information with visual calm.
  2. **Tactile Layering & Whisper-Soft Surfaces**:
     - Background: Porcelain canvas (`bg-[#f8f9fa]`).
     - Cards: Pure white (`bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.03)]`).
     - Micro-interactions: Smooth hover elevation, delicate borders, crisp focus rings.
  3. **Role-Themed Chromatic Accents**:
     - Pharmacist: Deep Forest & Fresh Emerald (`#064e3b`, `#059669`, `#10b981`).
     - Doctor: Clinical Sapphire & Cobalt (`#1e3a8a`, `#2563eb`, `#3b82f6`).
     - Patient: Warm Editorial Violet & Iris (`#4c1d95`, `#7c3aed`, `#8b5cf6`).
     - Administrator: Executive Indigo & Slate (`#312e81`, `#4f46e5`, `#6366f1`).
  4. **Substance Over Slop**:
     - Real clinical identity: CDS Safety Interlock Switch, Dual OCR Bounding Box Confidence bar, Pharmacokinetic DDI alert badge, and Coagulation INR Gauge.
     - Zero generic filler widgets; every bento block serves a critical clinical workflow.

---

## 2. Workspaces To Elevate
1. **Pharmacist Portal (`src/app/pharmacist/page.tsx`)**:
   - Hero header with live shift telemetry and "+ Capture Prescription" primary action.
   - Bento Row 1: Active Safety Queue (8 cols) + Fail-Closed Dispensing Interlock Hub (4 cols).
   - Bento Row 2: Dual OCR Line Extraction Telemetry (4 cols) + Pharmacokinetic DDI Interaction Watch (4 cols) + Shift Verification Throughput (4 cols).
2. **Doctor Portal (`src/app/doctor/page.tsx`)**:
   - Header with attending physician badge and inpatient order shortcut.
   - Bento Row 1: Immediate Attention Contraindication Hero (8 cols) + Triage Severity Pulse & Rationale Compliance Hub (4 cols).
   - Bento Row 2: Prioritized Clinical Triage Queue (8 cols) + Recent Dispositions Audit Bento (4 cols).
3. **Patient Portal (`src/app/patient/page.tsx`)**:
   - Calming editorial header with MRN badge and quick appointment booking.
   - Bento Row 1: Active Regimen & Pharmacy Pickup Hub (8 cols) + Upcoming Cardiology Consultation Bento (4 cols).
   - Bento Row 2: Daily Dosing Schedule Timeline (7 cols) + INR Coagulation & Adherence Health Card (5 cols).
4. **Administrator Portal (`src/app/admin/page.tsx`)**:
   - Hospital governance header with tenancy namespace and scoped reset.
   - Bento Row 1: Pending Clinician Credentialing Hero (8 cols) + Multi-Tenant RBAC Security Architecture (4 cols).
   - Bento Row 2: Staff Affiliations & Credentialing Ledger (8 cols) + Quick Governance Direct Portals (4 cols).

---

## 3. Verification & Compliance
- Maintain 100% of existing functionality, links, routes, and APIs.
- Keep all clinical safety invariants (fail-closed dispensing, $\ge 15$ char physician rationales, line OCR verification).
- `npm run typecheck` $\rightarrow$ 0 errors.
- `npm test` $\rightarrow$ 109/109 tests passed.
- Capture fresh desktop and mobile Playwright screenshots for visual verification.
