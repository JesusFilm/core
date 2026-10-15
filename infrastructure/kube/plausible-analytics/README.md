# Plausible Analytics on the Platform Cluster

Wrapper chart over [`zekker6/plausible-analytics`](https://github.com/zekker6/helm-charts/tree/main/charts/apps/plausible-analytics),
deployed by Argo CD (`infrastructure/kube/argocd/applications/<env>/plausible-analytics.yaml`;
stage syncs automatically, prod is a manual `argocd app sync`). Plausible's
configuration, including both database URLs, comes from the Doppler project
`plausible` (`stg` / `prd`) through the Doppler operator
(`infrastructure/kube/doppler/`), which the chart consumes as
`externalSecret.name`. When that is set the chart does not render its own
`CLICKHOUSE_DATABASE_URL`; whatever Doppler says is what Plausible connects to.

Plausible's PostgreSQL is external (`postgresql.enabled: false`). Its
ClickHouse was the `sentry/clickhouse` subchart (`clickhouse.enabled: true`), a
single-replica StatefulSet pinned to `us-east-2a` on a 500 GiB gp3 volume;
the plan below moves it to the shared ClickHouse Cloud service and then
removes the subchart.

## Migrating ClickHouse to ClickHouse Cloud

Plan: `docs/plans/2026-10-14-001-refactor-plausible-clickhouse-to-cloud-plan.md`.
Target: the environment's ClickHouse Cloud service (`jfp-clickhouse-<env>`,
Terraform module `infrastructure/modules/clickhouse/service`), which also holds
the short-links `redirects` database. Plausible gets its own database and user.
The `default` user's password is `SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD` and the
HTTPS endpoint is `SHORT_LINKS_CLICKHOUSE_URL`, both in the `core` Doppler
project; the native-protocol port is 9440 on the same host.

Everything below runs on stage first. Each section ends with the numbers to
record so the prod run can be estimated from the stage one.

### Before you start

1. **Measure the source.** From a machine with the cluster's kubectl context:

   ```bash
   cd infrastructure/kube/plausible-analytics
   ./export-source-clickhouse.sh stage sizes
   ```

   Record per table: rows, bytes on disk, uncompressed bytes, number of
   partitions; note any table that is not one of `events_v2`, `sessions_v2`,
   `ingest_counters`, `imported_*`, `schema_migrations`. Leftovers from the v1
   to v2 migration (`events`, `sessions`, `sessions_v2_tmp_versioned`, ...) are
   dropped from the copy unless something still reads them.

2. **Export the DDL** and commit it as `clickhouse/0001_plausible_events_db.sql`:

   ```bash
   ./export-source-clickhouse.sh stage ddl > clickhouse/0001_plausible_events_db.sql
   ```

   Read the file. Engines are rewritten for Cloud; `ORDER BY`, `PARTITION BY`,
   `SAMPLE BY`, `SETTINGS` and codecs are kept. If Cloud refuses `SAMPLE BY user_id`
   on the two v2 tables, drop that clause: Plausible v2.1 does not sample.

3. **Pre-flight the push path.** The copy is pushed from the pod with
   `remoteSecure()`, which needs the 24.3 server to complete a TLS handshake to
   Cloud. Prove it before doing anything else:

   ```bash
   CLICKHOUSE_CLOUD_HOST=<host from SHORT_LINKS_CLICKHOUSE_URL> \
   CLICKHOUSE_CLOUD_ADMIN_PASSWORD=<SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD> \
   ./export-source-clickhouse.sh stage preflight
   ```

   If this fails on TLS rather than on an idled service, stop: the fallback
   is staging the data through S3, which is a different runbook.

4. **Peak memory.** From Datadog, the ClickHouse pod's peak memory over the
   last month, and Plausible's `CLICKHOUSE_INGEST_POOL_SIZE` /
   `CLICKHOUSE_MAX_BUFFER_SIZE` / `CLICKHOUSE_FLUSH_INTERVAL_MS` in Doppler
   (defaults 5 / 10000 / 5000 when unset).

5. **Decide, and get them agreed before the Terraform change:**
   - `replica_memory_gb` per environment (Basic allows 8 or 12). The
     settings profile below gives Plausible a fraction of it.
   - The recovery window. The DLM policy being retired keeps 7 daily + 4 weekly
     EBS snapshots on prod. Cloud on Basic keeps one daily backup for 24 hours
     and restores whole-service into a new service. Options: accept 24 hours;
     move the organisation to Scale (retention configurable to 30 days);
     schedule `BACKUP DATABASE plausible_events_db TO S3(...)` from Cloud.
   - Prod copy time: stage's measured push rate (next section) against prod's
     compressed size. If it does not fit a weekend, use S3 instead.

6. **Argo CD state.** `argocd app get plausible-analytics` on each cluster,
   and whether the PVCs carry the chart's instance label:

   ```bash
   kubectl --context stage get pvc -l app.kubernetes.io/instance=plausible-analytics
   ```

   The live release was installed by `helm upgrade` from
   `apis/api-analytics/infrastructure/deploy*.sh`, so Argo's first sync from
   the real chart path would prune anything with that label that the chart
   does not render. The path fix lands with `prune: false` and pruning is
   re-enabled only after a reviewed sync. **Do not run those deploy scripts
   during the migration**: they reinstall the subchart.

### Prepare the tenant on Cloud

As `default`, with the SQL console or `clickhouse client`:

```bash
clickhouse client --host <host> --port 9440 --secure --user default \
  --password "$SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD" \
  --queries-file clickhouse/0001_plausible_events_db.sql
```

Then the users. Plausible's password goes into an Ecto URL, so generate it
without `@ : / ? # %` (or percent-encode it); `openssl rand -hex 24` does.

```sql
-- Plausible: everything on its own database, nothing else. Its migrations
-- need DDL rights. If GRANT ALL is refused, grant the explicit list:
-- SELECT, INSERT, ALTER, CREATE TABLE, CREATE DATABASE, DROP, TRUNCATE, OPTIMIZE, SHOW.
CREATE SETTINGS PROFILE plausible_profile SETTINGS
  max_memory_usage = <bytes: about 1/4 of the replica>,
  max_execution_time = 120,
  max_concurrent_queries_for_user = 8;
CREATE USER plausible IDENTIFIED WITH sha256_password BY '<plausible password>'
  SETTINGS PROFILE 'plausible_profile';
GRANT ALL ON plausible_events_db.* TO plausible;

-- The copy: no profile, so hour-long inserts are not cut off. Dropped at cutover.
CREATE USER migrator IDENTIFIED WITH sha256_password BY '<migrator password>';
GRANT INSERT, SELECT ON plausible_events_db.* TO migrator;
```

Checks before going further, each as the user named:

- `plausible`: `CREATE DATABASE IF NOT EXISTS plausible_events_db` succeeds (the
  init container runs it; the access check comes before the existence check).
- `plausible`: `SELECT 1 FROM redirects.redirect_events` is denied.
- `short_links_reader`: `SELECT 1 FROM plausible_events_db.events_v2` is denied.
- `plausible`: `CREATE TABLE plausible_events_db.t (x UInt8) ENGINE = TinyLog`
  fails. That is why `schema_migrations` is pre-created.
- On Cloud, `SHOW CREATE TABLE` of every table has the same columns **in the
  same order** as the exported DDL: `remoteSecure` inserts match positionally.

Stage the URL in Doppler `plausible/<cfg>` under a second key,
`CLICKHOUSE_DATABASE_URL_CLOUD`, as
`https://plausible:<password>@<host>:8443/plausible_events_db`. Cutover
renames it.

### Bulk copy

Plausible keeps running. Pick the boundary `W`: a UTC timestamp in the past,
typically the most recent midnight. Everything older than `W` is copied now;
everything from `W` on is copied at cutover with Plausible stopped.

Why one boundary works for all three live tables: `events_v2` only ever
appends, with `timestamp` set at ingest. `sessions_v2` is a
`VersionedCollapsingMergeTree`, but a session update inserts a cancel row that
carries the cancelled row's own `timestamp`, and a session whose last activity
is older than the session timeout (30 minutes) is never touched again. So once
the clock is past `W` + 30 minutes, every row with `timestamp < W` is
immutable. `ingest_counters` sums into minute buckets (`event_timebucket`) that
are closed within minutes. **Start the `< W` copy of `sessions_v2` and
`ingest_counters` no earlier than one hour after `W`.**

All statements run in the pod as the source's default user, pushing as
`migrator`:

```bash
kubectl --context stage exec -it plausible-analytics-clickhouse-0 -- clickhouse-client
```

```sql
-- One slice per statement. Whole partitions for old months; per day for the
-- big months of events_v2 (toDate(timestamp) leads its ORDER BY, so a day is cheap).
SET max_insert_threads = 4, max_memory_usage = <about half the pod's limit>;

INSERT INTO FUNCTION remoteSecure('<host>:9440', 'plausible_events_db.events_v2', 'migrator', '<pw>')
SELECT * FROM plausible_events_db.events_v2
WHERE _partition_id = '202501' AND timestamp < toDateTime('<W>', 'UTC');

INSERT INTO FUNCTION remoteSecure('<host>:9440', 'plausible_events_db.sessions_v2', 'migrator', '<pw>')
SELECT * FROM plausible_events_db.sessions_v2
WHERE _partition_id = '202501' AND timestamp < toDateTime('<W>', 'UTC');

INSERT INTO FUNCTION remoteSecure('<host>:9440', 'plausible_events_db.ingest_counters', 'migrator', '<pw>')
SELECT * FROM plausible_events_db.ingest_counters
WHERE event_timebucket < toDateTime('<W>', 'UTC');

-- imported_* and schema_migrations: whole tables, once.
INSERT INTO FUNCTION remoteSecure('<host>:9440', 'plausible_events_db.imported_visitors', 'migrator', '<pw>')
SELECT * FROM plausible_events_db.imported_visitors;
```

Log each completed slice (table, predicate, finished at, seconds) in a
scratch file; the prod estimate comes from it. **A failed slice is cleared on
Cloud before it is rerun**, never inserted on top of:

```sql
-- on Cloud, as default; whole-partition slice with nothing else in it:
ALTER TABLE plausible_events_db.events_v2 DROP PARTITION '202501';
-- any other slice: lightweight delete with the slice's own predicate
DELETE FROM plausible_events_db.events_v2
WHERE toDate(timestamp) = '2026-10-03' AND timestamp < toDateTime('<W>', 'UTC');
```

#### Verifying a copy

Raw `count()` is meaningless on `sessions_v2` and `ingest_counters`: it
depends on how far background merges have collapsed or summed rows on each
side, and the two sides merge on their own schedules. Compare merge-invariant
numbers, the same query on both sides, always with the `< W` predicate so the
source's ongoing writes do not move them:

```sql
-- events_v2 (plain MergeTree) and imported_*: counts are fine
SELECT _partition_id AS p, count(), uniqExact(session_id), min(timestamp), max(timestamp)
FROM plausible_events_db.events_v2
WHERE timestamp < toDateTime('<W>', 'UTC') GROUP BY p ORDER BY p;

-- sessions_v2: sign-weighted sums and a FINAL count
SELECT _partition_id AS p, sum(sign), sum(sign * pageviews), sum(sign * events)
FROM plausible_events_db.sessions_v2
WHERE timestamp < toDateTime('<W>', 'UTC') GROUP BY p ORDER BY p;
SELECT count() FROM plausible_events_db.sessions_v2 FINAL
WHERE timestamp < toDateTime('<W>', 'UTC');

-- ingest_counters: summed values per metric
SELECT metric, sum(value) FROM plausible_events_db.ingest_counters
WHERE event_timebucket < toDateTime('<W>', 'UTC') GROUP BY metric ORDER BY metric;

-- imported_* and schema_migrations
SELECT count() FROM plausible_events_db.schema_migrations;
```

Record: the per-table totals on both sides, the wall-clock time of the whole
copy, and the push rate (bytes on disk per minute) for the prod estimate. Do
one deliberate failure-and-retry on a `sessions_v2` slice on stage so the
clear-and-rerun and the metrics are both proven.

### Cutover

Schedule off peak. Tracking events sent during the window are lost (Plausible
does not retry from the browser) and `api-journeys` stats queries fail while
Plausible is down. Announce the expected length from the stage measurement.

1. **Stop Plausible.** Stage: pause Argo auto-sync for the app, then
   `kubectl --context stage scale deployment plausible-analytics --replicas=0`.
   Prod has manual sync, so just scale. Wait for the pod to terminate: the write
   buffer flushes on shutdown.
2. **Push the `>= W` half** of `events_v2`, `sessions_v2` and `ingest_counters`
   (per day for `events_v2` if the delta spans days). A failed delta slice is
   cleared with `DELETE ... WHERE <that slice's predicate>` and rerun; **never
   `DROP PARTITION` here**, the partition holds the verified `< W` half.
3. **Verify everything**, the queries above without the `< W` predicate, for
   every partition of every table; plus `imported_*` counts and
   `schema_migrations` count. Fix any mismatch before going on.
4. **Flip Doppler.** In `plausible/<cfg>`, set `CLICKHOUSE_DATABASE_URL` to
   the staged Cloud value (keep the old value in the key's history; rollback
   needs it). Confirm the operator refreshed the Secret:
   `kubectl get secret plausible -o jsonpath='{.data.CLICKHOUSE_DATABASE_URL}' | base64 -d`.
5. **Start Plausible**, replicas back to 1, resume Argo auto-sync on stage.
   Watch the init container: `db createdb` and `db migrate` must report nothing
   to do. If the start fails on the certificate rather than on auth, set
   `CLICKHOUSE_CACERTFILE` to the image's CA bundle path and restart; record
   which it was.
6. **Smoke:** a dashboard with a long range shows the same visitor numbers as
   before; a test pageview to a stage site shows up in realtime and in
   `events_v2` on Cloud; a `journeysPlausibleStatsAggregate` query through the
   stage gateway returns data for a journey with pre-migration traffic.
7. `DROP USER migrator` on Cloud.

Record: the window length, anything that needed a retry, whether
`CLICKHOUSE_CACERTFILE` was needed.

### Rollback

While the StatefulSet still runs (until the decommission below), rollback is
the Doppler flip in reverse and a restart: set `CLICKHOUSE_DATABASE_URL` back
to the in-cluster URL, scale to 0 and to 1. Events written to Cloud since
cutover are not copied back. Rehearse this once on stage and write down the
time it took.

### What to watch (stage soak, a week)

- Plausible logs for ClickHouse exceptions. The Cloud server is newer than the
  24.3 Plausible v2.1.1 was pinned to, and Cloud upgrades it on its own
  cadence; note the server version at cutover and any change during the soak.
- `ingest_counters` rows with `metric LIKE 'dropped_%'`.
- The Cloud service's idle and wake events on stage. If the first pageview
  after a wake is lost, switch stage to always-on in Terraform.
- The short-links Worker's queue: retries and dead letters during
  dashboard-heavy periods. Load a few dashboards at once on purpose. Dead
  letters attributable to Plausible load mean the settings profile is too
  generous.

Prod gate: no unexplained ClickHouse errors, dashboards and Stats API parity,
no Worker dead letters from Plausible load, and a prod copy-time estimate that
fits the window.

### Restore

Cloud restores are whole-service into a new service. To recover
`plausible_events_db` alone: restore the backup into a new service from the
Cloud console, then push the database back into the live service with the
same `remoteSecure` statements as the bulk copy (the new service is the
source, run from any host with `clickhouse client`), then delete the restored
service. The recovery window is the one decided in "Before you start".

### Decommission

After the agreed rollback window on prod (two weeks, and long enough to have
seen one Cloud server upgrade on stage). Order matters:

1. One final manual EBS snapshot of each prod data volume, tagged
   `DeleteAfter=<date>`.
2. Terraform: remove `module "plausible_clickhouse_snapshots"` from both
   environments and apply **while the volumes are still attached**. A module
   removed from configuration has no precondition to fail; the problem is the
   other way round, a still-configured module with detached volumes fails every
   other plan for that environment. Deleting the policy does not delete its
   snapshots: delete the DLM-created ones (tag `aws:dlm:lifecycle-policy-id`)
   by hand, keeping the final snapshot from step 1.
3. Chart: `clickhouse.enabled: false` in `values.yaml` and `values-stage.yaml`,
   delete `templates/storage-class.yaml`, `snapshot-class.yaml`,
   `volume-snapshot.yaml`. Stage syncs; prod is `argocd app sync --prune`.
4. Delete the PVCs (`plausible-analytics-clickhouse-data-...-0`,
   `...-replica-data-...-replica-0`), then their PVs (`Retain` keeps them),
   then the EBS volumes.
5. Delete the `clickhouse-gp3` StorageClass, the `clickhouse-gp3-snapshotclass`
   VolumeSnapshotClass, the two `VolumeSnapshot` objects and their
   `VolumeSnapshotContent`s.

`cleanup-csi-snapshots.sh` stays until the old CSI snapshot backlog has been
deleted; it does not depend on the StatefulSet.
