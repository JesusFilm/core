---
date: 2026-03-30
topic: remove-strapi-cms
---

# Remove Strapi CMS and Related Infrastructure

## Problem Frame

The Strapi CMS (`apps/cms/`) is dead infrastructure with no active consumers. It adds maintenance burden, CI/CD complexity, cloud costs (ECS tasks, PostgreSQL database, DNS), and dependency surface area to the monorepo without providing value. It should be fully removed.

## Requirements

- R1. Delete the `apps/cms/` directory and all its contents (Strapi app, Dockerfile, local config, generated types)
- R2. Remove the CMS Terraform module references from production and staging environment configs (`infrastructure/environments/prod/main.tf`, `infrastructure/environments/stage/main.tf`)
- R3. Run `terraform destroy` for the CMS module in both staging and production to tear down ECS tasks, auto-scaling, DNS records, and associated cloud resources
- R4. Remove CMS-related CI/CD references from GitHub Actions workflows (deploy triggers, build steps, Doppler token usage)
- R5. Remove CMS-related entries from root `package.json`, `pnpm-lock.yaml`, and any workspace configuration
- R6. Remove CMS database creation from `.devcontainer/post-create-command.sh`
- R7. Remove CMS-related entries from `.gitignore` if any are CMS-specific
- R8. Clean up any Doppler configuration for `DOPPLER_CMS_TOKEN` (prod and stage)

## Success Criteria

- No files referencing Strapi or the CMS app remain in the repo (excluding git history)
- Cloud resources (ECS service, tasks, DNS) are torn down in both environments
- CI/CD pipelines run cleanly without CMS-related steps
- `pnpm install` and `nx affected` commands succeed without CMS references
- No orphaned secrets remain in Doppler

## Scope Boundaries

- **Not migrating data** — CMS content (articles, authors, categories, clients) is not being preserved or migrated
- **Not replacing the CMS** — no alternative CMS is being introduced
- **PostgreSQL database data** — will be lost as part of teardown; this is intentional since the CMS is unused
- **Mux video integration** — any Mux assets managed through the CMS are out of scope

## Key Decisions

- **Full removal**: Code, infrastructure, cloud resources, and secrets are all being removed in one effort
- **No data migration**: Content is confirmed unused and does not need preservation
- **Terraform destroy before code removal**: Cloud resources should be torn down while Terraform state still references them, before removing the Terraform code from the repo

## Dependencies / Assumptions

- Terraform state is accessible and current for both prod and stage environments
- Doppler access is available to clean up CMS tokens
- No external systems (outside this org's control) depend on `cms.central.jesusfilm.org` or `cms.stage.central.jesusfilm.org`

## Outstanding Questions

### Resolve Before Planning

(None)

### Deferred to Planning

- [Affects R2, R3][Needs research] Confirm exact Terraform module names and state paths for the CMS in prod and stage environments
- [Affects R4][Needs research] Identify all GitHub Actions workflow files that reference the CMS app and determine which references to remove vs. which workflows to delete entirely
- [Affects R8][Technical] Determine how Doppler CMS tokens are configured and the process to remove them

## Next Steps

-> `/ce:plan` for structured implementation planning
