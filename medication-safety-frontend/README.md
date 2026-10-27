# Medication Safety Platform — Frontend Repository Documentation Pack

This folder is the documentation starter pack for the **`medication-safety-frontend`** repository. It is intended for the frontend developer and their AI coding agent.

## Start here
1. `01-shared/product-vision-and-scope.md`
2. `01-shared/decision-register-and-assumptions.md`
3. `01-shared/clinical-safety-and-hazard-analysis.md`
4. `02-frontend/FRONTEND_PRD.md`
5. `02-frontend/route-inventory.md`
6. `03-backend/BACKEND_PRD.md` and `03-backend/endpoint-inventory.md` — read as interface context.
7. `04-contracts/integration-contract.md` and `04-contracts/openapi.yaml`
8. `05-quality/test-strategy.md` and `06-operations/one-day-implementation-plan.md`

## Repository ownership
- Frontend implementation belongs in this repository, not in this documentation pack.
- `02-frontend/` is the frontend-specific PRD, route inventory, and AI-agent workflow.
- `03-backend/` is included so frontend developers have full backend behavior, data-model, and clinical-rule context; it is not permission to change backend implementation independently.
- `04-contracts/openapi.yaml` is a **pinned reference copy**. The backend repository owns the canonical contract. Propose changes to the backend developer and update the frontend copy/generated client only against an agreed contract version.
- `01-shared/`, `sources/`, `05-quality/`, and `06-operations/` are common context. Keep them aligned with the backend repository.

## Non-negotiable safety
Synthetic data only. The rules are illustrative and not clinically validated unless a qualified clinician has independently reviewed and approved them. No matching seeded rule is not proof of safety. The frontend must not compute clinical decisions or authorize dispensing client-side.

## Implementation tiers
`DAY_ONE_REQUIRED`, `MOCKED_FOR_DEMO`, and `SPECIFIED_DEFERRED` must be assigned accurately. Do not represent mocked or deferred behavior as implemented.

This is a documentation pack, not application source code. See `REPO-HANDOFF.md` for cross-repository ownership and integration instructions.
