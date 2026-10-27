# PharmaVigil — Master Frontend Implementation Plan & UX Architecture

(Refer to the interactive implementation plan artifact in the Antigravity Brain for review and feedback:
`/home/samudra/.gemini/antigravity-cli/brain/065f48aa-5b00-4964-abd4-5dc98a9c15df/medication_safety_frontend_plan.md`)

## Refinement Summary
- **Design System**: Strict minimalist clinical design system with accessible contrast (>= 4.5:1), dual-cue status badges, tabular numeric fonts, and zero deceptive green "safe" indicators.
- **Independent Portal Architecture**:
  - **Pharmacist**: High-density work queue with 5-stage interactive pipeline (`Capture → Extract → Match → Check → Authorize`), dual-pane OCR/catalogue verification, and fail-closed blocker gates.
  - **Doctor**: Urgency-weighted triage queue (`CRITICAL` > `HIGH` > `MODERATE`), evidence drawer with provenance and limitations, mandatory-rationale disposition, and side-by-side immutable prescription revision canvas.
  - **Patient**: Plain-language schedule cards ("Morning with breakfast"), clear status badges, and strict privacy isolation from clinical alert codes and audit trails.
  - **Administrator**: Rapid membership approval deck with role assignments and high-consequence Scoped Demo Reset modal requiring explicit confirmation typing (`RESET-DEMO-METRO`).
- **Detailed Page-Level Specifications**: Fully specified layout, primary/secondary actions, table filters/sorts, keyboard/accessibility behavior, mobile adaptations, and PRD/test traceability for all 31 DAY_ONE_REQUIRED routes.
- **Interaction Quality & Concurrency**: Explicit mock indicator badge (`[DEMO MOCK MODE — SYNTHETIC DATA]`), visible backend error envelopes (`requestId`, `code`), optimistic concurrency (409 reload prompts), and idempotency keys on all critical clinical mutations.
