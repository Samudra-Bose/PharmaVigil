# PharmaVigil — Comprehensive UX Redesign & De-Cluttering Plan

## 1. Problem Statement & Research Findings
- **User Feedback**: "website looks very clumsy type like very complex to understand at first stand so I am recommending you to without reducing any functionality change and improve, and redesign the complete UI and focus specifically on UX for this project. Plan everything like research and do all the stuffs and try to implement and follow all the main UX principles."
- **Root UX Issues Identified**:
  1. **Cognitive Overload (Hick's Law Violation)**:
     - The landing page dumps 12+ competing action buttons, multiple nested cards, conflicting color badges, and heavy jargon ("Deterministic pharmacological contraindication verification...").
     - First-time visitors cannot discern the core value proposition or where to click first.
  2. **Card-in-Card Nesting & Cluttered Visual Hierarchy**:
     - Repeated borders, multiple layered card containers, and excessive badges create visual noise ("clumsy" feel).
     - Every metric and sub-link is treated with equal visual weight, fighting for attention.
  3. **Lack of Progressive Disclosure**:
     - Sub-actions (e.g. "Search Patient", "Book Visit", "Audit Trail") are jammed into the footers of portal gateway cards instead of living naturally inside their dedicated workspaces.
  4. **Unbalanced Information Density**:
     - In some areas, text is dense and technical; in others, padding is excessive.

---

## 2. Core UX Principles Applied

1. **Hick's Law (Simplicity in Decision-Making)**:
   - Reduce the number of competing stimuli.
   - Present one primary focal point per screen.
2. **Miller's Law (Chunking & Working Memory)**:
   - Group information into 3–4 logical, easily digestible chunks (Hero $\rightarrow$ Role Portals $\rightarrow$ Safety Architecture).
3. **Fitts's Law (Actionable Touch & Click Targets)**:
   - Primary actions are prominent, distinctively colored, and easily clickable ($\ge 44\text{px}$ touch targets).
   - Secondary actions use restrained ghost/outline styles.
4. **Jakob's Law (Familiar SaaS Architecture)**:
   - Clean, standard top bar + collapsible sidebar.
   - Clear, uncluttered table queues with intuitive filtering.
5. **Progressive Disclosure**:
   - Show only what is needed at each step. Detailed sub-tasks are revealed inside the respective clinical workflows.
6. **Aesthetic-Usability Effect & Visual Balance**:
   - Generous whitespace, refined typography scale, warm surfaces (`#FAFAFA` / `#FFFFFF`), and subtle hairline dividers instead of harsh borders around every element.

---

## 3. Redesign Plan by Surface

### A. Home Gateway (`/`) — First-Impression Overhaul
- **Hero Section**:
  - Replace wall of text with an elegant, clear, patient-safety value proposition:
    - *"Outpatient Medication Safety & Clinical Decision Support"*
    - Subtitle: *"Preventing drug-drug interactions, allergy contraindications, and dosing errors before medication reaches the patient."*
  - Add a visual 3-step safety loop indicator: **Prescribe $\rightarrow$ Verify (CDS Engine) $\rightarrow$ Authorize & Dispense**.
- **Role Portal Switcher (Clean, Modern Bento / Card Grid)**:
  - Consolidate the dual "Persona Theme Switcher" + "Active Session Banner" + "4 Gateway Cards" into one harmonious **Interactive Workspace Launcher**.
  - 4 distinct, elegant portal cards (Pharmacist, Doctor, Patient, Hospital Admin) showing:
    - Active status indicator
    - Role title & key responsibility
    - One clear "Launch Workspace" button (colored to signature theme)
- **Safety Architecture Strip**:
  - Minimal, high-trust horizontal strip with clear icons and clean typography (Zero Hallucination, Fails-Closed, Line-by-Line OCR, Tenant Isolation).

### B. Shared Shell (AppHeader & Sidebar)
- Streamline header: Clean logo, breadcrumb/workspace indicator, tenant pill, notification bell, and user avatar.
- Refine sidebar: Generous padding, quiet inactive states, crisp active state with theme-colored pip, smooth mobile drawer interaction.

### C. Pharmacist Workspace (`/pharmacist`, `/pharmacist/capture`, `/cases/[id]/*`)
- Make the primary task instantly obvious: `+ Capture Prescription` in emerald.
- Streamline pulse metrics: 4 clean, breathing KPI cards without nested borders.
- Queue table: Single unified search/filter bar, clear status chips, readable patient MRNs, direct `Review` CTA.
- Capture page: Clean camera scanner trigger card with live WebRTC status; manual fallback accessible via simple tab.

### D. Doctor Triage Portal (`/doctor`, `/doctor/tasks/[id]/disposition`)
- Hero triage card: Highlights the clinical conflict in plain English (*"Warfarin + Aspirin: Major Gastrointestinal Bleeding Risk"*).
- Clean disposition decision cards with active sapphire ring and clear explanation.
- Revision editor: Clean medication list with one-click substitution accelerator.

### E. Patient Portal (`/patient`, `/patient/prescriptions`, `/patient/appointments`)
- Welcoming, editorial healthcare feel: Clean regimen summary ("Your Active Medications"), next appointment reminder, and pharmacy pickup status.
- Dosing cards with sun/moon schedule icons and clear instructions.

### F. Admin Portal (`/admin`, `/admin/users`, `/admin/rules`, `/admin/audit`)
- Clean governance overview: Staff approval queue, active clinician roster, published rulesets, and immutable audit logs.

---

## 4. Execution Steps
1. [x] Phase 1: Research & Planning Document (`scratch/plannings/session-ux-redesign-plan.md`).
2. [ ] Phase 2: Redesign `src/app/page.tsx` (Home Gateway) for exceptional first-impression clarity and simplicity.
3. [ ] Phase 3: Refine `AppHeader.tsx` and `Sidebar.tsx` to reduce visual weight and improve navigation ergonomics.
4. [ ] Phase 4: Polish Pharmacist and Doctor workspaces for clean focus and zero clutter.
5. [ ] Phase 5: Polish Patient and Admin portals for human-centered readability.
6. [ ] Phase 6: Run full verification (`npm run typecheck`, `npm test`, Playwright visual screenshots).
7. [ ] Phase 7: Commit, push to `origin main`, and report.
