# Runbook — api-journeys deployed-identity cutover

**Status:** required manual operations — **do not merge this PR and walk away.**
**Owner:** infra / on-call
**Related PRs:** stacked on `chore(api-journeys): rename api-journeys-modern project to api-journeys` (PR 1, code-only, safe).

## What this PR changes

PR 1 renamed the **codebase/build** identity (`api-journeys-modern` → `api-journeys`) with zero production impact. This PR (PR 2) renames the **deployed** identity:

| Surface | Before | After |
| --- | --- | --- |
| ECS service | `api-journeys-modern-<env>-service` | `api-journeys-<env>-service` |
| ECR repo | `jfp-api-journeys-modern-<env>` | `jfp-api-journeys-<env>` |
| Task def / log group / target group | `*api-journeys-modern*` | `*api-journeys*` |
| Service-discovery DNS | `api-journeys-modern.{service,stage}.internal` | `api-journeys.{service,stage}.internal` |
| Hive subgraph | `api-journeys-modern` | `api-journeys` |
| Terraform module address | `module.api-journeys-modern` | `module.api-journeys` |
| In-image runtime strings | Pino `service`, `x-graphql-client-name`, worker `lockKey` | renamed to `api-journeys` |

## Why a plain merge is unsafe

1. **Terraform is applied out-of-band** (no terraform workflow in `.github/workflows/`). Merging code does **not** create the new AWS resources.
2. **`api-deploy-{prod,stage}.yml` runs on push** and, after this PR, builds `api-journeys` and deploys to ECR/ECS/Hive named `api-journeys` + endpoint `api-journeys.{service,stage}.internal`. If those resources don't exist yet, the deploy fails.
3. **`service_config.name` feeds immutable AWS resource names** (ECS service, task-def family, target group, log group, Route53 record). A single `terraform apply` of the rename **destroys** the `api-journeys-modern` resources and **creates** `api-journeys` ones. The production gateway routes to the journeys subgraph via the Hive-published URL (`api-journeys-modern.service.internal`); if that DNS/service is destroyed before the new one is live and Hive has recomposed, **journeys queries fail** for the cutover window.
4. **Hive composition:** publishing subgraph `api-journeys` while `api-journeys-modern` still exists produces two subgraphs with identical types → **composition conflict** → the gateway keeps serving the last good supergraph. The old subgraph must be removed for the new one to take effect.

## Recommended rollout — zero downtime (expand → cutover → contract)

> Run the **entire sequence on `stage` first**, verify, then repeat on `prod`.

### Phase 1 — Expand (stand up the new service alongside the old)

Goal: `api-journeys.{service,stage}.internal:4004` is healthy **before** any Hive change, while `api-journeys-modern` keeps serving.

Because this PR *renames* the module (it does not duplicate it), the expand uses a **temporary parallel module**:

1. From a scratch branch off this one, add a second module block that points at the same source but with the new name, e.g.:
   ```hcl
   # infrastructure/environments/<env>/main.tf — TEMPORARY, removed in Phase 3
   module "api-journeys" {
     source        = "../../../apis/api-journeys/infrastructure"
     ecs_config    = local.internal_ecs_config
     doppler_token = data.aws_ssm_parameter.doppler_api_journeys_<env>_token.value
     alb = { arn = module.<env>.internal_alb.arn, dns_name = module.<env>.internal_alb.dns_name }
   }
   ```
   Keep the existing `module "api-journeys-modern"` block in place. Set the new module's `service_config.name` to `api-journeys` (this PR's `locals.tf` already does).
   > ⚠️ The two modules share one ALB target-group **priority** and **path_pattern** (`var.ecs_config.alb_target_group`). Give the temporary `api-journeys` module a distinct listener-rule priority so the apply doesn't collide. Confirm against the live ALB before applying.
2. `terraform plan` / `apply` for the env. Confirm **both** ECS services exist and are healthy.
3. Seed the image into the new ECR repo and force a deployment so the new service runs the current journeys image:
   ```bash
   # build + push to jfp-api-journeys-<env>, then:
   aws ecs update-service --force-new-deployment \
     --service api-journeys-<env>-service --cluster jfp-ecs-cluster-<env>
   ```
4. Health-check directly: `curl http://api-journeys.<service|stage>.internal:4004/graphql` from inside the VPC (or a task) returns a valid GraphQL response.

**Do not publish the Hive subgraph yet.**

### Phase 2 — Cutover (flip Hive routing atomically)

5. Publish the new subgraph **and** remove the old one so composition has exactly one journeys subgraph:
   ```bash
   pnpm exec hive schema:publish apis/api-journeys/schema.graphql \
     --service api-journeys \
     --url http://api-journeys.<service|stage>.internal:4004/graphql \
     --registry.accessToken $HIVE_TOKEN
   # then delete the stale subgraph (Hive UI or CLI):
   pnpm exec hive schema:delete api-journeys-modern --registry.accessToken $HIVE_TOKEN
   ```
6. The gateway recomposes and routes journeys to `api-journeys.*.internal` (healthy from Phase 1). **Verify journeys queries through the public gateway** (a real query + a `templateGalleryPage` public query). Watch error rates / Datadog for the journeys service.

> Rollback point: if anything is wrong, re-publish `api-journeys-modern` and delete `api-journeys` in Hive — the old service is still running, so the gateway returns to it. No data migration is involved.

### Phase 3 — Contract (merge + remove the old)

7. **Merge this PR.** The on-merge deploy rebuilds and force-deploys `api-journeys` — idempotent, the service already exists and is healthy. The Hive publish step is now a no-op republish to the same subgraph/URL.
8. Remove the **temporary parallel module** from Phase 1 and the **old `api-journeys-modern` module**, then `terraform apply` to destroy the legacy ECS service, target group, log group, ECR repo, and the `api-journeys-modern.*.internal` record. (Net result: only `module.api-journeys` remains.)
9. Confirm `api-journeys-modern` is gone from ECS, ECR, Route53, and Hive.

### ⚠️ Worker `lockKey` caveat

This PR changes the Redis leader lock `api-journeys-modern:workers:leader` → `api-journeys:workers:leader`. During **any** window where two task revisions run with **different** lock keys (the Phase-1 parallel services, or the Phase-3 rolling deploy), **two leaders elect simultaneously** → duplicate worker runs (shortlink updater, transactional emails, e2e cleanup) → risk of double-sends.

Pick one:
- **(a) Defer the lockKey flip** to a separate tiny PR applied only **after** a single `api-journeys` service is stable (contract complete), during a low-traffic window. *(Recommended — smallest blast radius.)* To do this, revert just the `leader.ts` change from this PR and ship it last.
- **(b) Briefly pause workers** (scale the leader / disable the worker schedule) across the lockKey-changing deploy.
- **(c) Accept the overlap** only if the worst-case duplicate (e.g. a duplicate email batch) is tolerable for the few-minute drain window.

## Simpler alternative — maintenance window (NOT zero downtime)

If a short, scheduled journeys outage is acceptable:
1. Merge PR 1 (safe) first.
2. In a maintenance window: `terraform apply` the rename (one shot — destroys old, creates new), merge PR 2 to trigger the deploy, then publish `api-journeys` + delete `api-journeys-modern` in Hive.
3. Expect journeys to be unavailable through the gateway from when the old DNS/service is destroyed until the new service is healthy and Hive has recomposed (typically a few minutes).

## Post-cutover checklist

- [ ] `api-journeys-<env>-service` healthy; `api-journeys-modern-<env>-service` removed
- [ ] Hive: only `api-journeys` subgraph; supergraph composes; gateway serving it
- [ ] Public gateway journeys queries succeed (incl. a public `templateGalleryPage` query)
- [ ] Datadog/logs show `service: api-journeys`; error rate nominal
- [ ] Workers: exactly one leader; no duplicate shortlink/email runs (see lockKey caveat)
- [ ] Temporary parallel terraform module removed
