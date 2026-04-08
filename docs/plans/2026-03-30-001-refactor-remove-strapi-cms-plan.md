---
title: 'refactor: Remove Strapi CMS and related infrastructure'
type: refactor
status: completed
date: 2026-03-30
origin: docs/brainstorms/2026-03-30-remove-strapi-cms-requirements.md
---

# refactor: Remove Strapi CMS and Related Infrastructure

## Overview

The Strapi CMS (`apps/cms/`) is dead infrastructure with no active consumers. It adds maintenance burden, CI/CD complexity, and cloud costs without providing value. This plan covers full removal: cloud resource teardown, code deletion, CI/CD cleanup, and secret hygiene.

## Problem Statement / Motivation

The CMS app was set up as a content management system serving Articles, Authors, Categories, and Clients via REST/GraphQL APIs. It is deployed to ECS at `cms.central.jesusfilm.org` (prod) and `cms.stage.central.jesusfilm.org` (stage). No application in the monorepo imports from or depends on the CMS, and no external consumers are active. Keeping it running wastes cloud resources and adds noise to CI/CD pipelines (see origin: `docs/brainstorms/2026-03-30-remove-strapi-cms-requirements.md`).

## Proposed Solution

Three-phase removal with strict ordering: (A) tear down cloud resources via Terraform, (B) remove all code and config references in a single PR, (C) clean up secrets and external systems post-merge.

## Technical Considerations

### Ordering Constraint (Critical)

Terraform destroy **must** happen before removing Terraform code from the repo. If code is removed first, Terraform loses its module source and cannot manage the resources — they become orphaned.

### Worker Workflow Compatibility

The reusable workflows (`ecs-frontend-deploy-prod-worker.yml`, `ecs-frontend-deploy-stage-worker.yml`) declare `DOPPLER_CMS_TOKEN` as `required: true` in their `workflow_call.secrets` block. This declaration must be removed alongside the secret references, or all callers of these workflows will break.

### Lockfile Regeneration

`pnpm-lock.yaml` must not be manually edited. Removing `apps/cms/` and the `strapi-blurhash>canvas` override from `package.json`, then running `pnpm install`, will cleanly regenerate the lockfile.

## Acceptance Criteria

### Phase A: Infrastructure Teardown (Manual)

- [ ] `terraform destroy -target=module.cms` succeeds in staging
- [ ] `terraform plan` in staging shows zero pending changes for CMS
- [ ] `terraform destroy -target=module.cms` succeeds in production
- [ ] `terraform plan` in production shows zero pending changes for CMS
- [ ] ECS tasks, ALB listener rules, and DNS records for both `cms.central.jesusfilm.org` and `cms.stage.central.jesusfilm.org` are confirmed gone

### Phase B: Code Removal (PR)

- [ ] `apps/cms/` directory deleted entirely
- [ ] Terraform environment configs cleaned (6 blocks across 4 files)
- [ ] GitHub Actions workflows cleaned (6 files)
- [ ] Root `package.json` override removed
- [ ] `.devcontainer/post-create-command.sh` CMS database lines removed
- [ ] `.gitignore` Strapi entries removed
- [ ] `.claude/rules/frontend/apps.md` CMS path removed
- [ ] `apps/watch/public/images/thumbnails/README.md` stale CMS references removed
- [ ] `pnpm install` succeeds and lockfile regenerated
- [ ] `nx affected --target=build` succeeds with no CMS references
- [ ] CI pipeline passes on the PR

### Phase C: Secret Cleanup (Post-Merge, Manual)

- [ ] `DOPPLER_CMS_TOKEN` removed from GitHub repository secrets
- [ ] Doppler CMS project archived
- [ ] AWS SSM parameters deleted: `/terraform/prd/DOPPLER_CMS_PROD_TOKEN`, `/terraform/prd/DOPPLER_CMS_STAGE_TOKEN`
- [ ] Stale Docker images cleaned from ECR (optional, low priority)

## Implementation Plan

### Phase A: Terraform Destroy (Manual, Pre-PR)

Run in staging first to validate, then production.

```bash
# Staging
cd infrastructure/environments/stage
terraform destroy -target=module.cms
terraform plan  # Confirm zero CMS-related changes

# Production
cd infrastructure/environments/prod
terraform destroy -target=module.cms
terraform plan  # Confirm zero CMS-related changes
```

**Fallback:** If destroy fails partially, resolve the blocking resource manually, then retry. If code removal has already happened, use `terraform state rm module.cms` to decouple state.

### Phase B: Code Removal (PR)

#### B1. Delete `apps/cms/` directory

Remove the entire directory including source code, Dockerfile, infrastructure/, config/, and generated types.

#### B2. Remove Terraform environment references

| File                                                        | Action                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| `infrastructure/environments/prod/main.tf` (lines 120-133)  | Delete `module "cms"` block                                 |
| `infrastructure/environments/prod/data.tf` (lines 65-67)    | Delete `data "aws_ssm_parameter" "doppler_cms_prod_token"`  |
| `infrastructure/environments/stage/main.tf` (lines 157-170) | Delete `module "cms"` block                                 |
| `infrastructure/environments/stage/data.tf` (lines 60-62)   | Delete `data "aws_ssm_parameter" "doppler_cms_stage_token"` |

#### B3. Clean up GitHub Actions workflows

| File                                                     | Action                                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ecs-frontend-deploy-prod.yml`         | Remove `DOPPLER_CMS_TOKEN` lines (L52, L81, L110) + delete entire `cms:` job (L91-119)                        |
| `.github/workflows/ecs-frontend-deploy-stage.yml`        | Remove `DOPPLER_CMS_TOKEN` lines (L52, L119, L148) + delete entire `cms:` job (L129-157)                      |
| `.github/workflows/main.yml`                             | Remove `DOPPLER_CMS_TOKEN` line (L56)                                                                         |
| `.github/workflows/ecs-frontend-deploy-prod-worker.yml`  | Remove `DOPPLER_CMS_TOKEN` from `workflow_call.secrets` declaration (L35) AND from secrets passthrough (L104) |
| `.github/workflows/ecs-frontend-deploy-stage-worker.yml` | Remove `DOPPLER_CMS_TOKEN` from `workflow_call.secrets` declaration (L35) AND from secrets passthrough (L104) |
| `.github/workflows/ai-build-spike.yml`                   | Remove "cms" from rejected-domains list (L102, optional)                                                      |

#### B4. Clean up root config and dev tooling

| File                                                         | Action                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `package.json` (L426)                                        | Remove `"strapi-blurhash>canvas": "^3.2.1"` from `pnpm.overrides`   |
| `.devcontainer/post-create-command.sh` (L47-49)              | Delete CMS database creation block                                  |
| `.gitignore` (L103-105)                                      | Delete Strapi CMS entries (note: these used stale `apis/cms/` path) |
| `.claude/rules/frontend/apps.md` (L4)                        | Remove `- 'apps/cms/src/**/*.{ts,tsx}'` path                        |
| `apps/watch/public/images/thumbnails/README.md` (L106, L192) | Remove stale CMS references                                         |

#### B5. Regenerate lockfile and validate

```bash
pnpm install          # Regenerates pnpm-lock.yaml without CMS deps
nx graph --verify     # Confirm clean project graph
nx affected --target=build --base=main  # Confirm no broken references
```

### Phase C: Secret Cleanup (Post-Merge, Manual)

1. Delete `DOPPLER_CMS_TOKEN` from GitHub repository secrets (Settings > Secrets)
2. Archive the CMS project in Doppler (preserves audit trail)
3. Delete AWS SSM parameters:
   - `/terraform/prd/DOPPLER_CMS_PROD_TOKEN`
   - `/terraform/prd/DOPPLER_CMS_STAGE_TOKEN`
4. (Optional) Clean up stale CMS Docker images from ECR
5. (Optional) Check for and remove any Datadog dashboards/monitors referencing `dd_source = "strapi"`

## Dependencies & Risks

- **Terraform state access** required for Phase A — operator needs AWS credentials and Terraform state backend access for both environments
- **No rollback for Phase A** — once cloud resources are destroyed, the database content is gone. This is acceptable since CMS is confirmed unused.
- **Worker workflow callers** — the `required: true` removal in worker workflows assumes no external repositories call these reusable workflows. If external callers exist and still pass the token, GitHub Actions will warn but not fail. If they omit it after the `required` declaration is removed, that's also fine.

## Success Metrics

- Zero files referencing Strapi or CMS remain in the repo (excluding git history and docs/brainstorms)
- Cloud resources fully torn down in both environments
- CI/CD pipelines run cleanly
- `pnpm install` and `nx` commands succeed without CMS references
- No orphaned secrets in Doppler, GitHub, or AWS SSM

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-03-30-remove-strapi-cms-requirements.md](docs/brainstorms/2026-03-30-remove-strapi-cms-requirements.md) — Key decisions: full removal (no data migration), terraform destroy before code removal, include infra teardown in plan.

### Internal References

- CMS app entry point: `apps/cms/src/index.ts`
- CMS Terraform module: `apps/cms/infrastructure/main.tf`
- Prod environment: `infrastructure/environments/prod/main.tf:120-133`
- Stage environment: `infrastructure/environments/stage/main.tf:157-170`
- Deploy workflow (prod): `.github/workflows/ecs-frontend-deploy-prod.yml`
- Deploy workflow (stage): `.github/workflows/ecs-frontend-deploy-stage.yml`
- Worker workflow (prod): `.github/workflows/ecs-frontend-deploy-prod-worker.yml`
- Worker workflow (stage): `.github/workflows/ecs-frontend-deploy-stage-worker.yml`
