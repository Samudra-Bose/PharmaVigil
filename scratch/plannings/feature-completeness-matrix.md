# PharmaVigil — Feature Completeness Matrix (Planning Document)

This matrix tracks the implementation and verification status of every route, workflow, safety gate, and interaction across the PharmaVigil platform against the canonical PRD (`02-frontend/FRONTEND_PRD.md`), Route Inventory (`02-frontend/route-inventory.md`), and OpenAPI 3.1.1 contract (`04-contracts/openapi.yaml`).

### Status Definitions:
- **VERIFIED:** Implemented, verified against explicit acceptance criteria, automated tests passing.
- **PARTIAL:** Implemented, but specific edge cases or cross-route persistence need completion.
- **UI ONLY:** Interface rendered, but underlying workflow or persistence handler is missing.
- **MISSING:** Required route or capability not yet implemented.
- **BLOCKED:** Requires unreleased external service or unavailable third-party dependency.
- **OUT OF SCOPE:** Explicitly excluded by PRD boundaries.

See `docs/feature-completeness-matrix.md` for full specification.
