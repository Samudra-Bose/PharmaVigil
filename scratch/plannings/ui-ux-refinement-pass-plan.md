# PharmaVigil UI/UX Refinement Pass Plan

## Objective
Perform a dedicated, high-impact UI/UX refinement pass on PharmaVigil to elevate it to an elite, minimalist clinical product. Preserve 100% of the PRD requirements, OpenAPI contract, clinical safety rules, and existing route inventory.

## Core Architectural & Design Decisions
1. **Component Foundation (shadcn/ui + Radix UI Primitives):**
   - Add accessible, modular shadcn-style primitives: `Card`, `Table`, `Input`, `Textarea`, `Tabs`, `Tooltip`, `Separator`, `Dialog`.
   - Maintain strict accessibility (`aria-labelledby`, `aria-describedby`, focus-visible rings, keyboard escape, focus trap).
2. **Clinical Safety Constraints (Absolute & Non-Negotiable):**
   - Strictly NO green badges or "Safe / Cleared" messaging.
   - Neutral slate indicators for `NO_MATCHING_RULE` with coverage matrix.
   - Dual-cue severity indicators (icon + text, contrast $\ge 4.5:1$).
   - Explicit `[DEMO MOCK MODE — SYNTHETIC DATA]` indicator.
   - Fails-closed dispensing authorization gating.
   - Strict data boundary between internal clinical audit notes and patient-facing views.
3. **Target Portals & Workspaces:**
   - **Pharmacist:** High-density triage queue, side-by-side OCR review, catalogue reconciliation, safety rule execution, and gated sign-off.
   - **Doctor:** Prioritized triage deck, readable clinical evidence, mandatory-rationale disposition, and immutable revision creation with visual diff.
   - **Patient:** Plain-language medication instructions, dosage regimen cards, zero internal audit leak.
   - **Hospital Admin:** Membership verification table, clinician status audit, protected demo reset flow.

## Verification Protocol
1. `npm run typecheck` — 0 TypeScript errors.
2. `npm run test` — All 11 Vitest tests green.
3. `npm run build` — Clean Next.js 14 production build with all 31 DAY_ONE_REQUIRED routes prerendered.
4. Git checkpoint commits pushed via Git Steward.
