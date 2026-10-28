# PharmaVigil — Next-Level Pinterest & Dribbble True Visual Transformation

## 1. Concrete Visual Defects Identified From Actual Screenshots
1. **Raw Database IDs Exposed in UI**:
   - Screenshots revealed raw string identifiers: `case_rx_9021_01`, `pat_rajan_9021`, `ing_warfarin; ing_aspirin`.
   - This looks like an unstyled developer debug console rather than a luxury SaaS product.
   - **Fix**: Replace all raw identifiers with rich clinical patient profiles: **Rajan Sharma** (MRN: P-9021) • Male, 58 yrs • Cardiology Clinic, and distinct styled medicine pills: **Warfarin Sodium 5mg (Coumadin)** and **Aspirin 100mg (Disprin)**.

2. **Harsh, Blocky Typewriter Typography (`font-mono` on KPIs)**:
   - "1 Blocked", "1 Case", "0 Dispensed", "Fails Closed" rendered in an awkward blocky typewriter font.
   - **Fix**: Import `Plus Jakarta Sans` and `Outfit` from Google Fonts. Use sleek modern display numerals (`text-3xl font-extrabold tracking-tight`).

3. **Flat Hero Card Without Clinical Visuals**:
   - The dark hero banner in the screenshot lacked visual depth and flair.
   - **Fix**: Add a **Visual Drug Interaction Node Diagram**:
     `[ Warfarin 5mg ] <--- Critical DDI Hazard ---> [ Aspirin 100mg ]`
     with glowing warning badges and tactile action buttons with ambient radiance.

4. **Sidebar & Top Header Elevation**:
   - Upgrade the sidebar with sleek active item indicators, subtle glowing dots, and modern clinic tags.

---

## 2. Step-by-Step Execution
1. [ ] Update `src/app/globals.css` with Google Fonts `Plus Jakarta Sans` and `Outfit`, plus modern shadow-lux utilities.
2. [ ] Update `tailwind.config.ts` to set `Plus Jakarta Sans` as primary font.
3. [ ] Overhaul `src/app/pharmacist/page.tsx`:
   - Replace raw IDs (`case_rx_9021_01`, `pat_rajan_9021`, `ing_warfarin`) with patient cards and medication pills.
   - Add the visual Drug-Drug Interaction Node Graphic in the Hero.
   - Replace mono KPIs with sleek display numbers and radial progress dials.
4. [ ] Overhaul `src/app/doctor/page.tsx`:
   - Replace raw IDs with full patient context.
   - Visual contraindication node map with direct MD disposition button.
   - Sleek display numbers and clinical resolution dial.
5. [ ] Overhaul `src/app/patient/page.tsx`:
   - Human-first editorial care hub with vibrant medication routine cards.
   - Beautiful INR therapeutic gauge and dosage timeline.
6. [ ] Overhaul `src/app/admin/page.tsx`:
   - Sleek executive staff ledger with role-colored pills and applicant review cards.
7. [ ] Run full test suite (`npm test`) and typecheck (`npm run typecheck`).
8. [ ] Capture fresh Playwright screenshots, inspect them directly, and report.
