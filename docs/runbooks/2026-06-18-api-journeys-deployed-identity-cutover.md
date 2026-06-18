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

> 🛑 **The current module cannot be instantiated twice as-is.** Before authoring the parallel module, understand these three collision points (verified against `apis/api-journeys/infrastructure` and `infrastructure/modules/aws/ecs-task`):
>
> 1. **`service_config.name` is hardcoded** in `locals.tf` (not a variable). Two instances from the same source would both be named `api-journeys` → every named AWS resource collides. The module must be temporarily parameterized (add a `service_name` variable, default `"api-journeys"`, and use it in `locals.tf`).
> 2. **Routing is host-header on a per-service ALB listener bound to the container port (4004).** The `alb-listener` module creates an `aws_alb_listener` on port 4004; the listener *rule* matches host `api-journeys.<internal-zone>` (derived from the service name). A second journeys service on **the same port 4004 collides on the listener.** The parallel service must use a temporary distinct listener port (e.g. 4014) — the gateway then reaches it at `api-journeys.<service|stage>.internal:4014` during Phase 1/2, and only lands on 4004 after contract.
> 3. **Target-group / listener-rule priority is shared** via `var.ecs_config.alb_target_group.priority`. The parallel instance needs a distinct, unused priority.
>
> Because of (2) the final-state port is 4004 but the parallel port is temporary, this expand is genuinely fiddly. **Strongly consider the maintenance-window alternative below instead** unless a zero-downtime journeys cutover is a hard requirement.

1. Temporarily parameterize the module name (scratch branch off this one): add a `service_name` variable to `apis/api-journeys/infrastructure/variables.tf` and a `port_override`, wire both into `locals.tf` (`name = var.service_name`, `port = var.port_override`). **Removed again in Phase 3.**
2. Add a temporary parallel module alongside the existing one. **UNTESTED skeleton — validate every value with `terraform plan` before apply:**
   ```hcl
   # infrastructure/environments/<env>/main.tf — TEMPORARY, removed in Phase 3.
   # Keep the existing `module "api-journeys"` (renamed in this PR) block in place; this adds a SECOND, short-lived instance.
   module "api-journeys-expand" {
     source        = "../../../apis/api-journeys/infrastructure"
     ecs_config    = local.internal_ecs_config   # override priority below to a free value
     env           = "<env>"
     service_name  = "api-journeys"               # requires the variable from step 1
     port_override = 4014                          # temporary: avoid the 4004 listener collision
     doppler_token = data.aws_ssm_parameter.doppler_api_journeys_<env>_token.value
     alb = { arn = module.<env>.internal_alb.arn, dns_name = module.<env>.internal_alb.dns_name }
   }
   ```
   > The original `module "api-journeys"` in this PR keeps `service_config.name = "api-journeys"` on port 4004 — but it isn't applied until the cutover. During expand, the live state still has the legacy `api-journeys-modern` resources (from `main`); this temporary `api-journeys-expand` instance is what serves the new name on the temporary port.
3. `terraform plan` / `apply`. Confirm the legacy `api-journeys-modern` service is untouched and the new `api-journeys` service is healthy on its temporary port.
4. Seed the image into the new ECR repo and force a deployment:
   ```bash
   # build + push to jfp-api-journeys-<env>, then:
   aws ecs update-service --force-new-deployment \
     --service api-journeys-<env>-service --cluster jfp-ecs-cluster-<env>
   ```
5. Health-check directly: `curl http://api-journeys.<service|stage>.internal:4014/graphql` from inside the VPC returns a valid GraphQL response.

**Do not publish the Hive subgraph yet.**

### Phase 2 — Cutover (flip Hive routing atomically)

6. Publish the new subgraph at the **temporary port** **and** remove the old one so composition has exactly one journeys subgraph:
   ```bash
   pnpm exec hive schema:publish apis/api-journeys/schema.graphql \
     --service api-journeys \
     --url http://api-journeys.<service|stage>.internal:4014/graphql \
     --registry.accessToken $HIVE_TOKEN
   # then delete the stale subgraph (Hive UI or CLI):
   pnpm exec hive schema:delete api-journeys-modern --registry.accessToken $HIVE_TOKEN
   ```
7. The gateway recomposes and routes journeys to `api-journeys.*.internal:4014` (healthy from Phase 1). **Verify journeys queries through the public gateway** (a real query + a `templateGalleryPage` public query). Watch error rates / Datadog for the journeys service.

> Rollback point: if anything is wrong, re-publish `api-journeys-modern` and delete `api-journeys` in Hive — the old service is still running, so the gateway returns to it. No data migration is involved.

### Phase 3 — Contract (merge + move to the final port + remove the old)

8. Remove the **old `api-journeys-modern` module** and `terraform apply` to destroy the legacy ECS service, target group, log group, ECR repo, and the `api-journeys-modern.*.internal` record. This frees **port 4004**.
9. **Merge this PR**, then remove the **temporary `service_name`/`port_override` parameterization and the `api-journeys-expand` module** so the canonical `module "api-journeys"` (port 4004) is the only journeys module. `terraform apply`. This recreates the journeys service on the final port 4004 — there is a brief re-register window here, so do it in a low-traffic slot (or, for true zero-downtime, run a second mini expand/contract from 4014 → 4004).
10. Re-publish the subgraph at the final URL and force a deploy:
    ```bash
    pnpm exec hive schema:publish apis/api-journeys/schema.graphql --service api-journeys \
      --url http://api-journeys.<service|stage>.internal:4004/graphql --registry.accessToken $HIVE_TOKEN
    ```
    (The on-merge deploy already targets `:4004` via `endpoint_url`, so this is usually a no-op republish.)
11. Confirm `api-journeys-modern` is gone from ECS, ECR, Route53, and Hive, and journeys serves on `:4004`.

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
