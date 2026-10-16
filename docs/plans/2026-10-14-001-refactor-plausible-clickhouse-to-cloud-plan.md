---
title: "refactor: Move Plausible's ClickHouse from EKS to the shared ClickHouse Cloud service"
type: refactor
status: active
date: 2026-10-14
deepened: 2026-10-14
---

# refactor: Move Plausible's ClickHouse from EKS to the shared ClickHouse Cloud service

## Summary

Plausible Analytics keeps its event data in a self-hosted ClickHouse StatefulSet on the EKS Platform Cluster. This plan moves that data into the ClickHouse Cloud service Terraform already provisions per environment for short-link scan events (`jfp-short-links-<env>`), as a second database with its own user. The service becomes the shared "Core ClickHouse" for the environment; the EKS ClickHouse, its EBS volumes and the DLM snapshot policy are retired once Plausible has run on Cloud for a rollback window. Stage goes first, prod follows the same runbook.

---

## Problem Frame

Plausible's ClickHouse runs as a `sentry/clickhouse` subchart inside `infrastructure/kube/plausible-analytics` (ClickHouse 24.3, one replica, a 500 GiB gp3 volume pinned to `us-east-2a`, plus a second `-replica` PVC). It is the only stateful workload on the Platform Cluster, and the operational cost has been visible: PR #9618 had to add a DLM policy and a cleanup script because the chart's snapshot schedule had leaked ~1,460 EBS snapshots. Meanwhile the short-links work stood up a managed ClickHouse Cloud service per environment with Terraform, Doppler-published credentials and a runbook for in-service setup. Running two ClickHouses, one hand-operated on EKS and one managed, doubles the operational surface for a team that does not want to run databases on Kubernetes. Consolidating onto the managed service removes the EKS volumes, the snapshot machinery and the pinned-AZ StatefulSet, and gives Plausible ClickHouse Cloud's daily backups.

---

## Assumptions

_This plan was authored without synchronous user confirmation. The items below are agent inferences that fill gaps in the input and should be reviewed before implementation proceeds._

- **"The ClickHouse Cloud used by the shortener" means the same service, not a second service of the same kind.** Plausible gets its own database (`plausible_events_db`) and user on `jfp-short-links-<env>`; the service is renamed to reflect shared ownership. If a separate service per tenant is preferred, U2 shrinks to a second module call and everything else is unchanged.
- **Plausible stays on v2.1.1 through the migration.** One change at a time: the Plausible version upgrade (chart `0.11.1` → `1.4.0`, CE v3.x) is a separate piece of work. If stage shows v2.1.1 cannot run against ClickHouse Cloud's server version, the fallback sequencing is to upgrade Plausible on EKS first, then migrate.
- **A short ingestion gap at cutover is acceptable.** The cutover scales Plausible to zero while the final delta is copied, so tracking events sent during that window are lost and dashboards are unavailable. The window is sized in U1 and scheduled off-peak.
- **In-service objects stay hand-created from a runbook**, matching the short-links precedent (Terraform manages the service only; database, tables and users are SQL run as `default`) and the standing preference against widening what the control plane automates (see memory: `no-cloudflare-control-plane-from-api-media`).
- **Plausible's Doppler values are set by hand.** Terraform has no token for the `plausible` Doppler project (only `core` and the per-service projects), so `CLICKHOUSE_DATABASE_URL` is entered in the Doppler UI rather than published by Terraform.

---

## Requirements

- R1. Plausible (stage and prod) reads and writes analytics data from the environment's ClickHouse Cloud service, over TLS, as a user limited to its own database.
- R2. All historical analytics data is present on Cloud after cutover: every table in `plausible_events_db`, including `schema_migrations`, with per-partition row counts matching the source.
- R3. Plausible starts on Cloud without re-running or failing its ClickHouse migrations, and dashboards, the Stats API used by `api-journeys`, and ingestion all work.
- R4. The short-links tenant (`redirects` database, `short_links_writer` / `short_links_reader`) is unaffected during the migration, including its Doppler keys and Worker secrets, and after cutover its insert path is protected from Plausible's query load by per-user limits. (Sharing one single-replica service means Cloud restarts and upgrades are now shared downtime for both tenants; that is accepted, not avoided.)
- R5. Rollback to the EKS ClickHouse is a Doppler change plus a restart for the length of the rollback window.
- R6. After the window: the EKS ClickHouse subchart, its PVCs/volumes, the storage and snapshot templates and the DLM policy module calls are removed; the DLM-created snapshots are deleted; one final EBS snapshot per prod volume is kept with a delete-after date. The recovery window moves from the DLM policy's 7 daily + 4 weekly snapshots to whatever U1 decides (Cloud's default is one daily backup kept 24 hours); that trade is stated in the runbook.
- R7. Repo documentation reflects the new shape: the service's Terraform module, the infrastructure glossary, and a runbook for the migration that the prod run can follow after stage.

---

## Scope Boundaries

- Plausible's PostgreSQL database and `api-analytics` (which introspects it) are untouched.
- No Plausible version or chart upgrade in this plan.
- Local development keeps the self-hosted `clickhouse` service in `docker-compose.services.yml`.
- No Terraform automation of in-service objects (databases, users, grants) and no new Doppler token for the `plausible` project.
- The short-links schema and users are not changed.

### Deferred to Follow-Up Work

- Retiring `apis/api-analytics/infrastructure/{deploy.sh,deploy-stage.sh,values-*.yaml,*-class.yaml,volume-snapshot.yaml}`, the second copy of the Plausible chart deploy: already a tracked follow-up from PR #9618. Must not be run during this migration (it would reinstall the subchart); deletion is a separate PR.
- Deleting the historical EBS snapshot backlog with `infrastructure/kube/plausible-analytics/cleanup-csi-snapshots.sh`: operational, tracked from PR #9618. U7 keeps the script until that is done.
- Plausible upgrade to CE v3.x / chart 1.4.0 (brings `CLICKHOUSE_SKIP_USER_SETUP` and a tested path on ClickHouse 24.12+).
- Removing the `ebs-snapshot-policy` module directory itself once nothing calls it.

---

## Context & Research

### Relevant Code and Patterns

- `infrastructure/modules/clickhouse/service/*.tf`: the Cloud service module. Terraform manages the service, an admin password and two Doppler secrets in `core` (`SHORT_LINKS_CLICKHOUSE_URL`, `SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD`). `ip_access` is already `0.0.0.0/0`, so EKS pods can reach it with no network change. `prevent_destroy = true`.
- `infrastructure/environments/{stage,prod}/main.tf`: `module "short_links_clickhouse"` (stage idles after 15 min, prod always on) and `module "plausible_clickhouse_snapshots"` (DLM policy; its precondition fails if the volumes are not attached to cluster nodes, which dictates teardown order in U7).
- `infrastructure/kube/plausible-analytics/`: wrapper chart over `zekker6/plausible-analytics 0.11.1`. `values.yaml` / `values-stage.yaml` set `clickhouse.enabled: true` (the subchart), `externalSecret.name: plausible-prod` / `plausible`, and pin the StatefulSet to `us-east-2a`. Templates add the `clickhouse-gp3` StorageClass, the `Retain` VolumeSnapshotClass and two VolumeSnapshots.
- Upstream chart contract (`charts/apps/plausible-analytics/templates/_helpers.tpl`, `secret.yaml`): when `externalSecret.name` is set the pod uses `envFrom: secretRef` and the chart's own Secret (including the generated `CLICKHOUSE_DATABASE_URL`) is not rendered. So Plausible's ClickHouse URL already comes entirely from the Doppler-managed Secret (`infrastructure/kube/doppler/values*.yaml`: project `plausible`, config `prd`/`stg`). Cutover is a Doppler edit plus a rollout restart; `clickhouse.enabled` only controls whether the subchart StatefulSet exists.
- `infrastructure/kube/argocd/applications/{stage,prod}/plausible-analytics.yaml` point at `path: infrastructure/kube/plausible`, but the chart lives at `infrastructure/kube/plausible-analytics`. Stage has automated sync; prod does not. This must be reconciled before the cutover relies on a values change.
- `workers/short-links-redirect/README.md` "Setting up ClickHouse": the runbook pattern to mirror (admin `clickhouse client --secure --port 9440`, `--queries-file`, per-tenant users with `sha256_password`, narrow grants). `workers/short-links-redirect/clickhouse/0001_init.sql`: the checked-in DDL pattern.
- `infrastructure/GLOSSARY.md` "Short-links ClickHouse" entry explicitly contrasts the managed service with "Plausible's self-hosted ClickHouse on EKS"; it needs rewriting.
- Plausible v2.1.1 `config/runtime.exs`: `CLICKHOUSE_DATABASE_URL` is an Ecto URL, so `https://user:pass@host:8443/plausible_events_db` works; `CLICKHOUSE_CACERTFILE` and IPv6 transport options exist; `IngestRepo` uses `CLICKHOUSE_INGEST_POOL_SIZE`, `CLICKHOUSE_FLUSH_INTERVAL_MS`, `CLICKHOUSE_MAX_BUFFER_SIZE`. The `ClickhouseRepo` sets `readonly: 1` and `join_algorithm` per query; these are query-level settings and are allowed on Cloud.
- Plausible v2.1.1 `priv/ingest_repo/migrations`: table engines are `MergeTree` (×10), `SummingMergeTree(value)` (`ingest_counters`), `VersionedCollapsingMergeTree` (`sessions_v2`, since 2024-02) and one `ReplicatedMergeTree`; settings `index_granularity` and `replicated_deduplication_window`. Nothing uses `ON CLUSTER`. ClickHouse Cloud transparently maps the MergeTree family to the Shared\* equivalents.
- Consumers of Plausible's ClickHouse are only Plausible itself: `apis/api-journeys/src/schema/plausible/*` and `src/workers/plausible/*` go through Plausible's HTTP Stats API (`PLAUSIBLE_URL`), and `api-analytics` reads Plausible's Postgres. Nothing in the repo queries Plausible's ClickHouse directly.

### Institutional Learnings

- Memory `plausible-snapshot-retention-followups`: open items from PR #9618 (api-analytics duplicate copy, snapshot backlog, Argo CD path mismatch). This plan resolves the path mismatch and supersedes the snapshot retention work entirely.
- `docs/solutions/` has three Plausible write-ups (`plausible-default-30-day-window-when-period-omitted.md`, `plausible-trailing-slash-splits-step-into-two-pages-2026-07-15.md`, `plausible-analytics-event-name-mismatch-qa359.md`). Their titles concern the Stats API and event naming, not storage; not read for this plan.

### External References

- ClickHouse Cloud migration guide (`remoteSecure` pull/push, destination table rules): https://clickhouse.com/docs/cloud/migration/clickhouse-to-cloud
- Plausible on ClickHouse Cloud, the `schema_migrations` engine problem and the confirmed fix (pre-create it with a replicated/shared engine, `ORDER BY tuple()`): https://github.com/plausible/analytics/discussions/3497
- Plausible CE configuration reference (`CLICKHOUSE_DATABASE_URL` as an Ecto URL): https://github.com/plausible/community-edition/wiki/Configuration
- ClickHouse Cloud backups (daily backup on every tier, configurable retention from Scale): https://clickhouse.com/docs/cloud/features/backups
- Plausible CE v3.0.1 release notes (ClickHouse 24.12 and `CLICKHOUSE_SKIP_USER_SETUP`, relevant only to the deferred upgrade): https://github.com/plausible/analytics/releases

---

## Key Technical Decisions

- **One shared service per environment, tenant isolation by database + user.** The user asked for the shortener's service. Plausible gets `plausible_events_db`, a `plausible` user with grants on that database only, and a settings profile (`max_memory_usage` per query, `max_memory_usage_for_user` for the aggregate, `max_execution_time`, `max_concurrent_queries_for_user`) sized so Plausible's aggregate, not just one query, fits in a fraction of the replica. A per-query cap alone does not protect the Worker: a dashboard fans out several queries and `api-journeys` adds more, and when the server-wide memory limit trips every query on the service fails, including the Worker's `wait_for_async_insert` inserts. The cost of sharing one single-replica service is that Cloud restarts and upgrades are downtime for both tenants at once; a second service would avoid that at roughly double the compute price. The short-links user grants already stop it from seeing Plausible's data.
- **Rename the service and module call to reflect shared ownership; keep the short-links Doppler keys.** `jfp-short-links-<env>` → `jfp-clickhouse-<env>` and `module "short_links_clickhouse"` → `module "clickhouse"` with a `moved` block. `SHORT_LINKS_CLICKHOUSE_URL` / `_ADMIN_PASSWORD` keep their names because the Worker, api-media and the runbook consume them; renaming them is churn with no benefit. The admin password stays in `core`; Plausible's own credentials go in the `plausible` Doppler project.
- **Copy data with `remoteSecure` pushed from the source pod, as `default` or a throwaway migration user, never as `plausible`.** The EKS ClickHouse is private, so Cloud cannot pull from it; the pod can reach Cloud on 9440 because the service accepts connections from anywhere. Push needs no S3 bucket, no IRSA and no new tooling, just `kubectl exec` into the ClickHouse pod and `clickhouse-client`. The destination-side insert runs as the connecting user and inherits its settings profile, so pushing as `plausible` would have the dashboard-sized `max_execution_time` kill hour-long partition inserts. Per-partition inserts (per-day slices for large `events_v2` partitions, since `toDate(timestamp)` leads the ORDER BY) keep each statement small and resumable. U1 includes a pre-flight that proves the 24.3 pod can complete the TLS handshake to Cloud; if that fails, the fallback is the S3 route (see Alternative Approaches).
- **Pre-create the full schema on Cloud from the source's `SHOW CREATE TABLE`, including `schema_migrations`, and copy `schema_migrations` rows.** Plausible's init container runs `db createdb` then `db migrate`; with the database and migration log present both are no-ops. Without pre-creation, Ecto would create `schema_migrations` as `TinyLog`, which Cloud's Replicated database engine rejects. Engines in the DDL are written without replication parameters and without the `Shared` prefix; Cloud maps them. `remoteSecure` inserts match columns positionally, so the DDL diff in U3 compares column order, not just column sets. Legacy v1 tables (`events`, `sessions`, anything `*_tmp` or `*_versioned` left over from the v2 migration) are listed in U1 and dropped from the copy unless they still hold data Plausible reads.
- **Two-phase copy with one fixed time boundary `W` for all three live tables, verified with merge-invariant metrics.** `events_v2` is append-only with `timestamp ≈ ingest time`. `sessions_v2` is not append-only, but its mutations are bounded: a cancel row carries the cancelled row's own `timestamp`, and a session whose last activity is older than the session timeout (30 min) is never touched again. So for all of `events_v2`, `sessions_v2` and `ingest_counters`, rows with `timestamp < W` (or `event_timebucket` for counters) are immutable once the clock passes `W` plus the session timeout, and the whole `< W` half can be copied while Plausible runs; the `>= W` half is copied after Plausible is scaled to zero. No partition logic at cutover, so the window does not depend on the day of the month. Verification cannot use raw `count()` on the collapsing and summing tables because it depends on merge state on each side; the runbook uses `sum(sign)`, `sum(sign * pageviews)` and `count()` under `FINAL` for `sessions_v2`, `sum(value) GROUP BY metric` for `ingest_counters`, and `count()` plus `uniqExact(session_id)` for `events_v2`, compared per partition on both sides. `imported_*` tables are copied once and count-verified at cutover.
- **Retries are defined per slice, never "drop the partition".** A failed historical slice is re-run after a lightweight `DELETE` of that slice's predicate on Cloud (or `DROP PARTITION` when the slice is a whole partition and nothing else has landed in it). The post-shutdown delta is the most likely step to fail (it races the downtime clock, possibly against a stage service that idled), and its retry is `DELETE ... WHERE timestamp >= W` then re-run, verified with the same predicate on both sides.
- **Cutover is Doppler + restart; the EKS ClickHouse keeps running through a rollback window.** `clickhouse.enabled` stays `true` until U7, so rollback is reverting `CLICKHOUSE_DATABASE_URL` and restarting. Events written to Cloud during the window would be lost on rollback; acceptable for analytics.
- **Fix the Argo CD application path rather than relying on the api-analytics deploy script, but land it with pruning off.** The cutover and the decommission both depend on a values change reaching the cluster through the declared GitOps path (`infrastructure/kube/AGENTS.md`). The live release was installed by `helm upgrade --install` from the api-analytics copy, so every live object carries the `plausible-analytics` instance label; the stage app has `automated: {prune: true}`, and the first correctly-pathed sync would prune anything with that label that the wrapper chart does not render, which may include the ClickHouse PVCs if the subchart labels its `volumeClaimTemplates`. The path fix therefore merges with prune disabled, after a local diff, and pruning is re-enabled only after a reviewed sync. The deploy script is the undeclared path and is deferred for deletion.
- **Size the replica and the backup retention from measurement and recovery needs, not from the 500 GiB provisioned volume.** U1 records compressed bytes per table and peak memory of the current pod; the Basic tier allows 8 or 12 GiB replicas, one daily backup kept 24 hours, and whole-service restores into a new service (no per-database restore). The DLM policy being retired keeps 7 daily + 4 weekly snapshots. If the measured footprint, Plausible's query memory, or the wanted recovery window needs more, the decision to move the organisation to the Scale tier (configurable retention up to 30 days) or to add a periodic `BACKUP DATABASE ... TO S3` from Cloud is surfaced to the user before U2 is applied, not made silently.
- **Accept that ClickHouse's server version is now Cloud's to choose.** The EKS pin to 24.3 is what has kept Plausible v2.1.1 stable; Cloud upgrades on its own cadence and Basic cannot schedule it. The stage soak proves one version only. The deferred CE v3 upgrade (tested by Plausible on 24.12+) is therefore time-boxed to follow this migration, not left open-ended, and the EKS rollback window on prod should outlast at least one Cloud upgrade observed on stage.

---

## Open Questions

### Resolved During Planning

- Does Plausible v2.1.1 support a TLS ClickHouse URL? Yes: `CLICKHOUSE_DATABASE_URL` is an Ecto URL handed to the `ch` adapter, and `runtime.exs` has explicit `CLICKHOUSE_CACERTFILE` and IPv6 transport handling.
- Where does Plausible's ClickHouse URL come from today? Entirely from the Doppler-managed Secret via `externalSecret.name`; the chart's generated URL is not rendered.
- Can Cloud pull from the EKS ClickHouse? No (private cluster, no ingress for 9440/8123). Push from the pod instead.
- Does anything other than Plausible read the EKS ClickHouse? No.
- Must the DLM module be removed before the StatefulSet? Yes, but for a different reason than "the plan would fail". A module removed from configuration has no preconditions to evaluate, so removing it after the volumes detach plans cleanly. The real constraint is that while the module is still in configuration and the volumes are detached, every other Atlantis plan for that environment fails on its precondition. So the module calls are removed and applied before the Argo sync that deletes the StatefulSet, to avoid an unplannable environment in between.
- Does `clickhouse.enabled: false` delete the data? No. Kubernetes keeps `volumeClaimTemplates` PVCs when a StatefulSet is deleted, and `clickhouse-gp3` has `reclaimPolicy: Retain`, so the PVC, PV and EBS volume survive until U7 deletes them deliberately. The exposure is Argo label-based pruning at the U2 path fix, not the subchart removal.
- Can rows with `timestamp < W` arrive in `events_v2` after the `< W` copy? Not in normal operation: `timestamp` is assigned at ingest from the Plausible pod's clock and the write buffer flushes within seconds, and the copy runs hours after `W`. The comparison is written as `toDateTime('...', 'UTC')` so the server timezone cannot shift `W`.

### Deferred to Implementation

- Exact replica memory per environment and whether the Basic tier suffices: decided from U1 measurements.
- Whether stage keeps `idle_scaling`: Plausible's periodic jobs may keep the service awake, and a wake-up from idle may make an ingest flush fail. Observe on stage for a week; switch stage to always-on only if events are lost or the service never idles anyway.
- Whether Plausible v2.1.1's queries behave on Cloud's current server version (the service's `compatibility` setting is fixed at creation): proven on stage in U6 before prod.
- Cutover window length: the time to copy `timestamp >= W` of `events_v2` plus the current partitions of `sessions_v2` and `ingest_counters`, measured on stage and estimated for prod from U1 sizes.
- Whether the `-replica` PVC holds anything (the sentry subchart creates it; the values set one replica). Checked in U1; if empty it is just deleted in U7.
- Whether Erlang in the Plausible image trusts the Cloud certificate chain without `CLICKHOUSE_CACERTFILE`: first stage start proves it.

---

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

```mermaid
flowchart LR
  subgraph EKS["Platform Cluster (EKS)"]
    P[Plausible pod]
    CH[(ClickHouse 24.3<br/>StatefulSet, gp3 500Gi)]
  end
  subgraph Cloud["ClickHouse Cloud: jfp-clickhouse-env"]
    R[(redirects)]
    E[(plausible_events_db)]
  end
  W[short-links Worker] -->|short_links_writer| R
  M[api-media] -->|short_links_reader| R
  P -. "today: http://...:8123" .-> CH
  P ==>|"after: https://plausible@...:8443"| E
  CH -->|"remoteSecure push, per partition"| E
  D[Doppler plausible/prd,stg<br/>CLICKHOUSE_DATABASE_URL] --> P
```

Cutover sequence:

```mermaid
sequenceDiagram
  participant Op as Operator
  participant Src as EKS ClickHouse
  participant Dst as Cloud plausible_events_db
  participant Pl as Plausible
  Op->>Dst: create db, tables (engines mapped), schema_migrations, user + profile
  Op->>Src: push imported_*, schema_migrations, and the < W half of events_v2, sessions_v2, ingest_counters (after W + 30 min, Plausible still running)
  Op->>Dst: verify merge-invariant metrics per partition
  Op->>Pl: scale to 0 (buffer flushes on shutdown)
  Op->>Src: push the >= W half of the three live tables
  Op->>Dst: verify every partition of every table; imported_* counts
  Op->>Pl: set CLICKHOUSE_DATABASE_URL in Doppler, scale to 1
  Pl->>Dst: db migrate (no-op), serve
  Op->>Pl: smoke: dashboard, Stats API via api-journeys, live ingest
```

---

## Implementation Units

- U1. **Measure the source and fix the size**

**Goal:** Know what is being moved and what it needs on Cloud before any Terraform or runbook work.

**Requirements:** R2, R7

**Dependencies:** None

**Files:**

- Create: `infrastructure/kube/plausible-analytics/README.md` (runbook; this unit writes the "Before you start" section with the measurement queries and records the stage numbers)

**Approach:**

- From a `kubectl exec` into the ClickHouse pod: list tables in `plausible_events_db`, per-table and per-partition `rows`, `bytes_on_disk` and `data_uncompressed_bytes` from `system.parts`, the `schema_migrations` row count, and the `SHOW CREATE TABLE` of every table.
- Record the pod's peak memory from Datadog (the Platform Cluster runs the Datadog operator) and the current `CLICKHOUSE_INGEST_POOL_SIZE` / buffer settings in Doppler.
- Check whether the `-replica` PVC contains data. List any legacy v1 tables and decide (with their sizes) whether they are copied or dropped from scope.
- Pre-flight the push path from the pod: `SELECT 1 FROM remoteSecure('<host>:9440', 'system.one', 'default', '<pw>')`. This proves the subchart's server config and the alpine image's CA bundle can complete the TLS handshake; if it fails, the S3 route replaces `remoteSecure` before any further work. On stage, an idled service makes the first statement time out; rerun it.
- Decide `replica_memory_gb` per environment (8 or 12 on Basic) from footprint and peak memory, and decide the recovery window: accept Cloud's 24-hour daily backup, move to the Scale tier for configurable retention, or add a periodic `BACKUP DATABASE ... TO S3`. If any of these implies the Scale tier, stop and surface that as a cost decision for the user.
- Estimate prod bulk-copy time from stage's measured push rate against prod's compressed size; if it exceeds what one pod's outbound stream can do in the available time, revisit the S3 route (see Alternative Approaches).
- Confirm the Argo CD applications' actual state (`argocd app get plausible-analytics` on each cluster) and whether the live PVCs carry the `app.kubernetes.io/instance=plausible-analytics` label, so U2 knows what the first correctly-pathed sync would prune.

**Patterns to follow:**

- `workers/short-links-redirect/README.md` "Setting up ClickHouse" for runbook tone and the `clickhouse client --secure --port 9440` invocation.

**Test scenarios:**

- Test expectation: none -- measurement and documentation only. The outputs are the numbers written into the runbook.

**Verification:**

- The runbook lists every table with row and byte counts for stage, the chosen replica memory and recovery window per environment, the DDL export location, the pre-flight result, the prod copy-time estimate, and the Argo CD sync and PVC-label state per environment.

---

- U2. **Terraform and GitOps plumbing for a shared service**

**Goal:** Make the Cloud service's definition say it is shared, size it for both tenants, and make the Plausible chart reachable through Argo CD.

**Requirements:** R1, R4, R7

**Dependencies:** U1 (sizing)

**Files:**

- Modify: `infrastructure/modules/clickhouse/service/main.tf` (service name from a variable, tags, header comment naming both tenants and both runbooks)
- Modify: `infrastructure/modules/clickhouse/service/variables.tf` (`name` or `service_name` variable; `replica_memory_gb` description mentions both tenants)
- Modify: `infrastructure/environments/stage/main.tf`, `infrastructure/environments/prod/main.tf` (`module "clickhouse"` with a `moved` block from `module.short_links_clickhouse`, `replica_memory_gb` from U1, comments)
- Modify: `infrastructure/kube/argocd/applications/stage/plausible-analytics.yaml`, `infrastructure/kube/argocd/applications/prod/plausible-analytics.yaml` (`path: infrastructure/kube/plausible-analytics`)
- Modify: `infrastructure/GLOSSARY.md` ("Short-links ClickHouse" → "Core ClickHouse" entry describing both tenants, their databases and users, and that Plausible's old EKS ClickHouse is gone after U7)

**Approach:**

- Renaming `clickhouse_service.name` is an in-place update in the provider; the `moved` block keeps the resource address stable so `prevent_destroy` is never challenged. Confirm in the Atlantis plan that the only service change is `name`, `tags` and (if changed) memory.
- Doppler secret names and values in `core` are unchanged (R4).
- Stage keeps `idle_scaling = true` for now (see deferred question); prod stays always on.
- The Argo path fix is its own PR and lands with pruning off: before merging, `helm template` the wrapper chart and `argocd app diff` it against the live stage app; set `prune: false` (or the `Prune=false` sync option) in the stage application in the same change; merge; review what Argo reports as out-of-sync; re-enable pruning only once the diff contains nothing that holds data. Note that the wrapper chart adds two `VolumeSnapshot` objects the deploy script never applied, so the first sync creates two EBS snapshots. Prod has manual sync, so every later prod change (U5 values, U7 removal) is an explicit `argocd app sync`, with `--prune` only in U7.

**Patterns to follow:**

- `infrastructure/AGENTS.md`: variables not hardcoded values, `validation` blocks, `terraform fmt`.
- Existing `moved` usage in the estate, if any; otherwise the Terraform docs' `moved { from = module.a  to = module.b }` form.

**Test scenarios:**

- Happy path: Atlantis plan for stage shows the service updated in place (name/tags/memory), no destroy, no Doppler secret changes.
- Edge case: plan for prod with `replica_memory_gb` unchanged shows only name and tags.
- Error path: if the plan proposes replacing `clickhouse_service.this`, stop; `prevent_destroy` will block it, and the module change must be reworked.
- Error path: the pre-merge `argocd app diff` lists the ClickHouse PVCs or any other data-bearing object as prune candidates; the fix is to keep pruning off and, if needed, relabel or annotate those objects before pruning is ever enabled.
- Integration: after the Argo path fix merges to `stage` with pruning off, `argocd app get plausible-analytics` reports Healthy, the ClickHouse pod and both PVCs are untouched, and the only new objects are the two `VolumeSnapshot`s.

**Verification:**

- Both environments' Terraform applied with the service renamed and nothing destroyed; Worker inserts and api-media stats still work on stage; Argo shows both Plausible apps synced from the real chart path with no data-bearing object pruned.

---

- U3. **Prepare the Plausible tenant on Cloud**

**Goal:** Create the database, schema, migration log and user on Cloud so Plausible can start against it without running migrations.

**Requirements:** R1, R3, R4

**Dependencies:** U1 (DDL export), U2 (service exists in its final shape)

**Files:**

- Create: `infrastructure/kube/plausible-analytics/clickhouse/0001_plausible_events_db.sql` (the DDL generated from the source in U1 with engines rewritten for Cloud; header comment states Plausible's migrations own the schema from now on and this file is the migration-time snapshot)
- Create: `infrastructure/kube/plausible-analytics/clickhouse/0002_users.sql.example` or a README section (the `plausible` user, settings profile and grants, with placeholder password)
- Modify: `infrastructure/kube/plausible-analytics/README.md` ("Prepare the tenant" section)

**Approach:**

- DDL rewrite rules: drop `Replicated` parameters, keep `ORDER BY`, `PARTITION BY`, `SETTINGS`, codecs; `schema_migrations` becomes a MergeTree-family table `ORDER BY tuple()` (Cloud maps to Shared). Leave `replicated_deduplication_window` in place; it is a valid MergeTree setting on Cloud.
- Run the file with `clickhouse client --queries-file` as `default`, like the short-links runbook.
- The `plausible` user: `sha256_password` with a password that avoids `@ : / ? # %` (it is embedded in an Ecto URL; otherwise percent-encode it), grants on `plausible_events_db.*` only (Plausible's future migrations need DDL rights; try `GRANT ALL`, and keep the explicit list `SELECT, INSERT, ALTER, CREATE TABLE, CREATE DATABASE, DROP, TRUNCATE, OPTIMIZE, SHOW` ready in case Cloud's `default` cannot grant some sub-privilege), and a `SETTINGS PROFILE` with `max_memory_usage`, `max_execution_time` and `max_concurrent_queries_for_user`, sized so concurrency × per-query memory stays within a documented fraction of the replica. Document the chosen numbers and how to lift them temporarily for Plausible's own long-running work (imports, the future v3 data migrations).
- Verify on stage that the init container's `db createdb` (`CREATE DATABASE IF NOT EXISTS`) succeeds under the database-scoped grant; its access check runs before the existence check, and a failure here crash-loops the pod with `ACCESS_DENIED`.
- Create a throwaway `migrator` user with no profile and `INSERT` on `plausible_events_db.*` for the push (or push as `default`); it is dropped in U5 after cutover.
- Set `CLICKHOUSE_DATABASE_URL` in the `plausible` Doppler config as a _second_ key for now (e.g. `CLICKHOUSE_DATABASE_URL_CLOUD`) so the value is staged and reviewable before cutover swaps it in.

**Patterns to follow:**

- `workers/short-links-redirect/clickhouse/0001_init.sql` and the user block in its README.

**Test scenarios:**

- Happy path: running the DDL file twice is idempotent (`IF NOT EXISTS` throughout).
- Happy path: `SHOW CREATE TABLE` on Cloud for each table has the same columns in the same order, and the same order-by and partition expressions, as the source export (diff the normalized output; positional column match matters for the push).
- Happy path: as `plausible`, `CREATE DATABASE IF NOT EXISTS plausible_events_db` succeeds (what the init container runs).
- Error path: connecting as `plausible` and selecting from `redirects.redirect_events` is denied; connecting as `short_links_reader` and selecting from `plausible_events_db.events_v2` is denied.
- Edge case: as `plausible`, a query exceeding the profile's `max_memory_usage` fails with a memory-limit error while a concurrent `short_links_writer` insert still succeeds.
- Edge case: a `CREATE TABLE ... ENGINE = TinyLog` as the `plausible` user fails on Cloud, demonstrating why `schema_migrations` is pre-created.

**Verification:**

- `plausible_events_db` exists with every source table and an empty `schema_migrations`; the `plausible` user can read and write only that database.

---

- U4. **Bulk copy while Plausible keeps running**

**Goal:** Move all historical data and most of the current partition so the cutover delta is small.

**Requirements:** R2

**Dependencies:** U3

**Files:**

- Modify: `infrastructure/kube/plausible-analytics/README.md` ("Bulk copy" section with the statement shapes, the boundary `W` convention and the verification queries)

**Approach:**

- Choose `W` as a UTC timestamp in the past (for example the most recent midnight UTC, written as `toDateTime('...', 'UTC')`). The `< W` copy of `sessions_v2` and `ingest_counters` must start no earlier than `W` plus the session timeout (30 min) plus margin, so every row it reads is already immutable.
- From the source pod, as `migrator`/`default`, one slice at a time: `INSERT INTO FUNCTION remoteSecure('<host>:9440', 'plausible_events_db.<table>', '<user>', '<pw>') SELECT * FROM plausible_events_db.<table> WHERE <slice>`. Slices are whole partitions (`_partition_id = '<p>'`) for old months and per-day (`toDate(timestamp) = '<d>'`) for large `events_v2` months, always with `AND timestamp < W` (`event_timebucket < W` for `ingest_counters`). Copy every in-scope `imported_*` table whole. Copy `schema_migrations` whole.
- Run the inserts with `max_insert_threads` and a bounded `max_memory_usage` so the 24.3 pod is not OOM-killed; log each completed slice so a failure resumes at the next one. A failed slice is cleared on Cloud with a lightweight `DELETE` of its predicate (or `DROP PARTITION` when the slice is a whole partition and nothing else has landed in it) and re-run; nothing is ever re-inserted on top.
- Verification per table/partition, same query on both sides: `events_v2` and `imported_*`: `count()`, `uniqExact(session_id)`, `min/max(timestamp)`; `sessions_v2`: `sum(sign)`, `sum(sign * pageviews)` and `count()` under `FINAL` (raw `count()` depends on merge state and will not match); `ingest_counters`: `sum(value) GROUP BY metric`. Always with the `< W` predicate so the source's ongoing writes do not move the numbers.

**Patterns to follow:**

- ClickHouse Cloud migration guide, push variant.

**Test scenarios:**

- Happy path: after the run, every partition's merge-invariant metrics under `< W` match on both sides for all three live tables, and `imported_*` counts match.
- Error path: a slice insert interrupted mid-way is detected by the metric mismatch, the slice is cleared on Cloud with the documented `DELETE`/`DROP PARTITION`, and the retry produces matching metrics (exercise this deliberately on stage once, on a `sessions_v2` slice, to prove the metrics are stable across merges).
- Edge case: a table with zero rows (common for `imported_*` on stage) copies without error and verifies as 0 = 0.
- Integration: Plausible dashboards on the source keep working during the copy, and the short-links Worker's queue shows no rise in retries or dead letters while the Cloud service is ingesting the bulk load.

**Verification:**

- The runbook's count table is filled in for stage with all rows matching; the bulk copy took a recorded wall-clock time that sizes the prod run.

---

- U5. **Cutover**

**Goal:** Switch Plausible to Cloud with a consistent final delta and a documented, short gap.

**Requirements:** R1, R2, R3, R5

**Dependencies:** U4

**Files:**

- Modify: `infrastructure/kube/plausible-analytics/README.md` ("Cutover" and "Rollback" sections)

**Approach:**

- Scale the Plausible deployment to zero (stage: through the chart's `replicaCount` so Argo does not fight a manual scale, or pause auto-sync for the window; prod has manual sync so `kubectl scale` is fine). Wait for termination; the write buffer flushes on shutdown.
- Push the `>= W` half of `events_v2`, `sessions_v2` and `ingest_counters` (per-day slices for `events_v2` if the delta spans days). If a delta slice fails, clear it with `DELETE ... WHERE <slice predicate>` on Cloud and re-run; never drop the partition, which holds the verified `< W` half. Then verify every partition of every table with the U4 metrics, now without the `< W` predicate; re-verify `imported_*` counts; verify `schema_migrations` row count. Drop the `migrator` user.
- In Doppler `plausible/<cfg>`, set `CLICKHOUSE_DATABASE_URL` to the Cloud value (`https://plausible:<pw>@<host>:8443/plausible_events_db`); confirm the Doppler operator has refreshed the Kubernetes Secret.
- Scale back to one. Watch the init container: migrations report nothing to run. Watch the app log for ClickHouse connection errors.
- Smoke: open a dashboard with a long date range and compare a visitors number against the source; send a test pageview to a stage site and see it in realtime; run an `api-journeys` Stats query (`journeysPlausibleStatsAggregate`) from the gateway on stage.
- Rollback (documented, rehearsed once on stage): revert the Doppler key, scale down and up. Note the data written to Cloud since cutover is not copied back.

**Patterns to follow:**

- Argo CD sync discipline in `infrastructure/kube/AGENTS.md` (no hand-patching that the next sync undoes).

**Test scenarios:**

- Happy path: post-cutover, every partition of every table matches the source on the merge-invariant metrics taken after scale-down.
- Error path: a delta slice interrupted mid-way is cleared with the documented `DELETE` and re-run, and the `>= W` metrics then match (rehearse once on stage).
- Happy path: Plausible starts with "Migrations successful" / nothing pending and no ClickHouse errors in the first ten minutes.
- Error path: if the first start fails on TLS/CA, set `CLICKHOUSE_CACERTFILE` per the Plausible config reference and restart; record which was needed.
- Error path: rollback rehearsal on stage restores dashboards against the EKS ClickHouse within minutes and the runbook records the exact steps.
- Integration: a pageview sent after cutover appears in the Cloud `events_v2` and in the dashboard; `api-journeys` stats queries return data for a journey with pre-migration traffic.

**Verification:**

- Stage runs on Cloud with counts matching and the smoke checks green; the runbook has the measured gap length; the same runbook executed on prod with recorded numbers.

---

- U6. **Soak and stage-to-prod gate**

**Goal:** Prove v2.1.1 on Cloud for long enough to trust prod, and decide the stage idle setting.

**Requirements:** R3, R4

**Dependencies:** U5 on stage

**Files:**

- Modify: `infrastructure/kube/plausible-analytics/README.md` ("What to watch" section)
- Possibly modify: `infrastructure/environments/stage/main.tf` (`idle_scaling` / `idle_timeout_minutes` if the deferred question resolves to always-on)

**Approach:**

- Watch for a week on stage: Plausible error logs for ClickHouse exceptions (query behaviour differences on the newer server version), ingest counters (`ingest_counters` rows with `metric = 'dropped_*'`), Cloud service idle/wake events, Cloud's server version (note any upgrade during the soak and what it did), and the Worker's queue metrics, specifically retries and dead letters during dashboard-heavy periods (drive a few concurrent dashboard loads deliberately).
- Gate for prod: no unexplained ClickHouse errors, dashboards and Stats API parity, no Worker dead letters attributable to Plausible load, bulk copy + cutover timing acceptable when scaled by U1's prod sizes.
- Add a "Restore" section to the runbook: how a Cloud backup is restored (into a new service) and how `plausible_events_db` is pushed back from it, so the recovery window decided in U1 is backed by a procedure.

**Test scenarios:**

- Happy path: seven days of stage traffic with no ClickHouse exceptions in Plausible logs and no short-links dead letters.
- Edge case: after the service idles, the next pageview and the next dashboard load both succeed (possibly slowly); if the ingest flush is lost on wake, record it and switch stage to always-on.
- Integration: with several dashboards loading concurrently on stage, the Worker's queue shows no dead letters and `short_links_writer` inserts keep succeeding.

**Verification:**

- A dated "prod go" note in the runbook with the observed numbers; prod cutover then follows U3–U5.

---

- U7. **Decommission the EKS ClickHouse**

**Goal:** Remove the StatefulSet, volumes, snapshot machinery and their repo footprint after the rollback window.

**Requirements:** R6, R7

**Dependencies:** U5 on prod plus the agreed rollback window (suggest two weeks)

**Files:**

- Modify: `infrastructure/kube/plausible-analytics/values.yaml`, `infrastructure/kube/plausible-analytics/values-stage.yaml` (`clickhouse.enabled: false`, drop the subchart `affinity`/`clickhouse` blocks; keep the Plausible pod affinity only if still wanted)
- Delete: `infrastructure/kube/plausible-analytics/templates/storage-class.yaml`, `snapshot-class.yaml`, `volume-snapshot.yaml`
- Modify: `infrastructure/environments/stage/main.tf`, `infrastructure/environments/prod/main.tf` (remove `module "plausible_clickhouse_snapshots"`)
- Modify: `infrastructure/kube/plausible-analytics/README.md` ("Decommission" section with the ordering and the final-snapshot step)
- Modify: `infrastructure/GLOSSARY.md` (remove the "Plausible's self-hosted ClickHouse" contrast once gone)

**Approach:**

- Ordering matters: (1) take one final manual EBS snapshot of each prod data volume and tag it with a delete-after date; (2) apply the Terraform that removes the DLM module calls while the volumes are still attached. This is not because the removal would fail later (a module removed from configuration has no preconditions), but because a still-configured module with detached volumes fails every other plan for that environment; removing the `aws_ec2_tag` resources untags the volumes, which is fine. Deleting the policy does not delete its snapshots: delete the DLM-created snapshots (tagged `aws:dlm:lifecycle-policy-id`) explicitly, keeping only the final one from step 1; (3) merge the chart change so Argo removes the StatefulSet (stage: automated; prod: `argocd app sync --prune` by hand); (4) delete the PVCs, then the PVs (`Retain`), then the EBS volumes; (5) delete the `clickhouse-gp3` StorageClass and VolumeSnapshotClass objects, and the two `VolumeSnapshot` objects (their `VolumeSnapshotContent`s are `Retain`; clean them with the existing script's approach or by hand).
- Stage first, prod after. The prod window should be long enough to have observed at least one Cloud server upgrade on stage (see Key Technical Decisions).
- Leave `cleanup-csi-snapshots.sh` in place until the snapshot backlog follow-up is done; it does not depend on the StatefulSet.

**Patterns to follow:**

- `infrastructure/modules/aws/ebs-snapshot-policy/main.tf` precondition messages for the ordering rationale.

**Test scenarios:**

- Happy path: Terraform plan removing the DLM modules shows only the policy, role and volume tags being destroyed.
- Error path: if the StatefulSet is removed first, every plan for that environment fails on the DLM precondition until the module calls are removed; the runbook orders the steps to avoid it and names this as the symptom.
- Integration: after the Argo sync, Plausible pods are running, no `clickhouse` pods or PVCs remain, and dashboards still work (they never pointed at the subchart after U5).
- Edge case: the final prod snapshot exists in EC2 with the expected size before any volume is deleted, and no DLM-tagged snapshots remain afterwards.

**Verification:**

- No ClickHouse workload, PVC, PV, EBS volume, DLM policy or DLM snapshot remains for Plausible in either environment; one tagged final snapshot per prod volume; repo contains no references to the removed objects.

---

## System-Wide Impact

- **Interaction graph:** The short-links Worker (`workers/short-links-redirect`, queue consumer inserting as `short_links_writer`) and `api-media` (`apis/api-media/src/schema/shortLink/analytics/clickhouse.ts`, reading as `short_links_reader`) now share a service with Plausible's ingestion and dashboards. `api-journeys` Stats queries and the journeys dashboard (`apps/journeys-admin`) depend on Plausible being up, so the cutover gap is visible to them as failed stats requests.
- **Error propagation:** Plausible's `IngestRepo` drops a flush on persistent ClickHouse failure; a Cloud outage or idle wake delay becomes lost pageviews, not retries. The Worker side retries to its dead-letter queue, so it is the more resilient tenant, but a server-wide memory limit trip caused by Plausible load fails Worker inserts too; the `plausible` profile's concurrency and memory ceilings exist for that.
- **State lifecycle risks:** Partial slice copies are the main hazard; the runbook defines the clear-and-rerun for each slice kind and never drops a partition that holds verified rows. The EKS volumes stay (`Retain`) until U7 so nothing is irreversible before the window ends; after U7 the recovery window is whatever U1 chose.
- **API surface parity:** None. The Stats API, GraphQL schema and short-links contracts are unchanged.
- **Integration coverage:** Count parity per partition, the TLS connection from the Plausible image, Plausible's migration no-op on start, and Worker insert health during bulk load are only provable against the real service on stage.
- **Unchanged invariants:** `SHORT_LINKS_CLICKHOUSE_*` Doppler keys, `wrangler.toml` `CLICKHOUSE_URL`, the `redirects` schema and users, Plausible's Postgres, `api-analytics`, and local docker-compose.

---

## Risk Analysis & Mitigation

| Risk                                                                                                                                        | Likelihood                | Impact | Mitigation                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plausible v2.1.1 queries misbehave on Cloud's newer ClickHouse (analyzer or function changes; `compatibility` is fixed at service creation) | Med                       | High   | Stage soak (U6) before prod; fallback is upgrading Plausible on EKS first, which also means bumping the EKS ClickHouse image to 24.12+ for CE v3, then migrating    |
| Cloud upgrades the server after cutover and v2.1.1 breaks with no EKS to roll back to                                                       | Med                       | High   | Stated exposure; prod rollback window outlasts one observed stage upgrade; CE v3 upgrade time-boxed as the next piece of work                                       |
| Basic tier 8/12 GiB cannot serve Plausible's dashboard queries plus Worker inserts                                                          | Med                       | Med    | U1 measures peak memory; profile caps Plausible's concurrency × memory; Worker DLQ watched in U6; escalate to Scale tier as an explicit cost decision               |
| Partial or duplicated slice copy                                                                                                            | Med                       | High   | Per-slice statements, merge-invariant verification, defined clear-and-rerun per slice kind                                                                          |
| Verification false negatives on collapsing/summing tables                                                                                   | High if `count()` is used | Med    | Never compare raw `count()` on `sessions_v2` / `ingest_counters`; use `sum(sign)`, `FINAL` counts and summed values                                                 |
| `sessions_v2` rows mutated after the `< W` copy                                                                                             | Low                       | Med    | Start the `< W` copy only after `W` + session timeout; post-shutdown verification covers every partition, not only the current one                                  |
| Cutover gap loses pageviews and breaks `api-journeys` stats briefly                                                                         | High                      | Low    | Off-peak window; delta is only `>= W` across the three live tables, so the gap does not depend on day of month; gap length measured on stage and announced for prod |
| Argo CD's first correctly-pathed sync prunes the ClickHouse PVCs or other live objects                                                      | Med                       | High   | Path fix lands with pruning off after a local `argocd app diff`; pruning re-enabled only after review                                                               |
| Recovery window shrinks from weeks of EBS snapshots to Cloud's 24-hour backup                                                               | High                      | Med    | Explicit retention decision in U1 (accept, Scale tier, or `BACKUP ... TO S3`); Restore section in the runbook; final tagged EBS snapshot kept                       |
| `remoteSecure` TLS from the 24.3 pod fails (server config or CA bundle)                                                                     | Low                       | Med    | Pre-flight in U1 before any other work; S3 route as fallback                                                                                                        |
| Someone runs `apis/api-analytics/infrastructure/deploy.sh` mid-migration                                                                    | Low                       | Med    | Called out in the runbook and the deferred-work list; the duplicate is deleted in a follow-up                                                                       |
| DLM module precondition breaks Terraform once volumes detach                                                                                | High if misordered        | Med    | U7 orders the Terraform apply before the StatefulSet removal                                                                                                        |
| TLS trust from the Plausible image to Cloud                                                                                                 | Low                       | Low    | `CLICKHOUSE_CACERTFILE` is available if the system store is not trusted                                                                                             |
| Stage idle wake drops ingest flushes                                                                                                        | Med                       | Low    | Observed in U6; switch stage to always-on if it matters                                                                                                             |

---

## Alternative Approaches Considered

- **A second ClickHouse Cloud service for Plausible.** Avoids shared downtime and the noisy-neighbour profile work; costs roughly another always-on 8 GiB replica on prod. Rejected because the user asked for the shortener's service; the plan isolates by database, user and profile instead. Revisit if U6 shows Worker dead letters under Plausible load that the profile cannot prevent.
- **Stage the data through S3** (`INSERT INTO FUNCTION s3(...)` per slice from the pod, Cloud reading with `s3`/`s3Cluster`). Gives a durable, portable copy of the EKS data that outlives the volumes, parallel ingest on Cloud, and idempotent per-object retries. Costs an S3 bucket, credentials reachable from the pod (IRSA or a key), and two hops. Not chosen as the default because the push needs none of that; it becomes the route if the U1 pre-flight fails or the prod copy-time estimate does not fit the available window. The decision criteria are recorded in U1 so this can be flipped after measurement.
- **Keep the EKS ClickHouse and only fix the snapshot machinery.** Already done by PR #9618; leaves the only stateful workload on the Platform Cluster and two ClickHouses to run. Rejected as the status quo this plan replaces.
- **Upgrade Plausible to CE v3 first, then migrate.** Would give a Plausible tested against newer ClickHouse before it meets Cloud's version, but requires bumping the EKS ClickHouse image to 24.12+ first (a migration of the thing being retired). Kept as the fallback if stage shows v2.1.1 is incompatible with Cloud's server.

---

## Operational / Rollout Notes

- Stage first for every unit; prod repeats U3–U5 and U7 from the runbook with the stage numbers as the estimate.
- Cloud's daily backup replaces the DLM policy; retention beyond 24 hours needs the Scale tier or a scheduled `BACKUP ... TO S3`, decided in U1. Cloud restores are whole-service into a new service, so a Plausible-only restore is "restore, then push `plausible_events_db` back" (runbook Restore section, U6).
- ClickHouse's server version is now upgraded by Cloud on its own schedule; the CE v3 upgrade is the next piece of work after this migration, not an open-ended follow-up.
- After U7, memory `plausible-snapshot-retention-followups` is reduced to the two remaining items (api-analytics copy, snapshot backlog) and should be updated.
- `pnpm lint:changed --fix` and the Terraform `fmt`/`validate` ritual apply to every PR; Atlantis plans on the infra PRs are the first real check of U2 and U7.

---

## Sources & References

- Related code: `infrastructure/modules/clickhouse/service/`, `infrastructure/kube/plausible-analytics/`, `infrastructure/kube/argocd/applications/`, `infrastructure/kube/doppler/`, `workers/short-links-redirect/README.md`
- Related PRs/issues: #9618 (DLM snapshot policy), #9738 (short-links prod edge publishing)
- External docs: https://clickhouse.com/docs/cloud/migration/clickhouse-to-cloud, https://github.com/plausible/analytics/discussions/3497, https://github.com/plausible/community-edition/wiki/Configuration, https://clickhouse.com/docs/cloud/features/backups
