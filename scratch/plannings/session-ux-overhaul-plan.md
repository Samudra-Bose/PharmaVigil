# Session UX Overhaul Plan: Taking PharmaVigil UX to the Next Level

## Objective
Elevate the user experience of PharmaVigil across all portals to make it exceptionally fluid, intuitive, responsive, and delightful ("super smooth").

## 1. Global Command Palette (`Cmd+K` / `Ctrl+K`)
- **Component**: `src/components/layout/CommandPalette.tsx`
- **Features**:
  - Modal with backdrop blur (`backdrop-blur-md bg-slate-900/40`) and spring entry transition (`scale-in-95`).
  - Search input with clear button, auto-focus, and keyboard navigation (`↑`/`↓` selection, `Enter` execution, `Esc` dismiss).
  - Categorized groups:
    - ⚡ **Quick Navigation**: Instant switch between portals (Pharmacist, Doctor, Patient, Hospital Admin, Portal Hub).
    - 🩺 **Clinical Actions**: Capture Prescription (OCR), View Pending Tasks, Run CDS Check, View Audit Ledger, Manage Clinical Rules.
    - 👤 **Patients Directory**: Direct search and jump to sample patient profiles (`Arthur Pendelton`, `Eleanor Vance`, `Marcus Brody`).
    - 🛡️ **Clinical Drug Safety Rules**: Rapid reference for interaction rules (Warfarin + NSAID, Methotrexate, QT prolongation).
  - Integration with `AppHeader`: Clicking search bar opens Command Palette; keyboard shortcut badge (`⌘K` / `Ctrl+K`) displayed inside the search button.

## 2. Keyboard Navigation & Shortcuts Cheatsheet
- **Component**: `src/components/layout/HotkeysHandler.tsx` & `src/components/layout/ShortcutsModal.tsx`
- **Features**:
  - Global listener for:
    - `Cmd+K` / `Ctrl+K`: Toggle Command Palette.
    - `?` or `Shift+/`: Open Keyboard Shortcuts Cheat Sheet.
    - `⌥1` through `⌥4`: Instant switch between clinical portals (Pharmacist, Doctor, Patient, Admin) in mock mode.
    - `Esc`: Close any open dialog, modal, or drawer.
  - Floating shortcut trigger / footer helper button to make keyboard navigation discoverable.

## 3. Micro-Interactions, Tactile Feedback & Visual Polish
- **Buttons & Interactive Elements**:
  - Add tactile active press scales (`active:scale-[0.98] transition-transform`).
  - Pulsing status dots for live connected EHR states.
  - Smooth hover elevation on clinical cards and task lists (`hover:-translate-y-0.5 hover:shadow-md transition-all`).
- **Patient Dose Tracker Delight**:
  - Interactive medication adherence toggle on Patient Dashboard with animated check states and completion progress bar.
- **Copy & Feedback Micro-interactions**:
  - Instant visual checkmark and haptic toast feedback when copying Rx codes, patient IDs, or credentials.

## 4. Polished Empty & Error States
- Delightful empty states with SVG illustrations, clear context, and single-click action buttons (e.g. "Clear filters" or "New order").

## 5. Verification & Safety Preservation
- Verify 100% test passing (`npm test`).
- Typecheck clean (`npm run typecheck`).
- Visual browser verification with Playwright.
- Commit cleanly and push to `origin/main`.
