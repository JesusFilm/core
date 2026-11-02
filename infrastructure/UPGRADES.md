# Staged infrastructure version upgrades

The rollout took Aurora PostgreSQL to **17.11** in staging and production
through the phases of `upgrade_phase` (`upgrades.tf`): `prepare`,
`stage-aurora`, `complete`.

**Current state (2026-10-20): the rollout is complete; the committed default is
`complete`.** Staging completed `stage-aurora` on 2026-10-19: its Aurora
cluster is on 17.11, still on I/O-Optimized storage. Production completed
`complete` on 2026-10-20: its Aurora cluster is on 17.11, on standard storage.

A live Aurora precondition rejects a major change unless that environment's
explicit approval variable is true.

Use the existing Atlantis project and state. Resolve another PR's project lock
through its owner; never unlock or apply another PR's plan. **The current
`automerge: true` configuration merges a PR after its first successful apply and
deletes its branch.** Each phase needs its own reviewed PR that advances the
committed `upgrade_phase` default to that phase. Retain the successfully applied phase as the default so
future autoplan does not request a downgrade or a later upgrade. Never commit a
future phase before its predecessors have completed and passed their health checks.

Every phase needs a fresh reviewed Atlantis saved plan for the current commit.
Local targeted plans are supporting evidence, not deployment signoff. Obtain the
actual Atlantis plan after the project lock is resolved and before approving an
apply. **Atlantis apply uses the last saved plan. A push triggers default
autoplan and can replace a custom-variable plan.** After the final push, rerun the
exact phase/target plan immediately before apply, review its commit and complete
diff, then apply without intervening pushes or plans.

Do not apply a broad plan: unrelated production ECS desired-count drift has been
observed. Targeted plans do not prove that the rest of the root is reconciled.
After all phases, review the complete root plan and resolve unrelated drift
separately before declaring reconciliation complete. Deletion protection remains
a separate protection change; this PR preserves its current setting.

## Aurora rollout

AWS reported 13.23 → 17.11 as a valid direct major upgrade in the configured
region, with `db.serverless` available. Check again before planning deployment.
The change creates a separate PostgreSQL 17 cluster parameter group per
environment rather than modifying the shared PostgreSQL 13 group. It retains
logical replication, the five-second slow-query threshold, and the existing
TLS connection policy (`rds.force_ssl=0`). Changing application TLS requirements
is a separate change. The instance uses the matching default PostgreSQL 17
parameter group. ACU bounds, credentials, identifiers and backup retention stay
unchanged. Staging retains the I/O-Optimized choice; production retains standard
storage. Cluster and instance changes apply immediately once the reviewed phase is applied. Execute the phase during the coordinated maintenance window so Terraform waits for the cluster upgrade before updating the instance parameter group. Do not queue an engine change and then apply a new-family instance group while the old engine is still running.

Before either major upgrade, run `aurora-upgrade-preflight.sql` against **every
application database** using an existing approved connection. It reads catalog
metadata only. Inventory extensions and their target-version compatibility,
prepared transactions, invalid databases, templates, unsupported `reg*` columns,
replication slots, publications and subscriptions. A nonempty logical-slot
result blocks the in-place upgrade until its consumers have a reviewed migration
plan. Do not drop slots, publications, subscriptions, databases or extensions
as an automatic fix. Enabling logical replication is not evidence of unused
slots.

The staging preflight ran on 2026-10-19 against all ten databases (`cms`,
`journeys`, `languages`, `media`, `nexus`, `plausible`, `postgres`, `stage`,
`users` and a leftover Prisma shadow database) and found nothing blocking: no
replication slots, publications, subscriptions, prepared transactions, invalid
databases or `reg*` columns. Extensions are `plpgsql` everywhere, plus `pg_trgm`
1.5 in `languages` and `citext` 1.6 in `plausible`, both supported on 17.
Staging's Plausible database lives on this cluster, so staging analytics also
pauses during the upgrade.

The production preflight ran on 2026-10-20 against all nine databases (`cms`,
`journeys`, `languages`, `media`, `nexus`, `plausible`, `postgres`, `prod` and
`users`). It found the same extensions as staging and no prepared transactions,
subscriptions, invalid databases or `reg*` columns. It did find four logical
replication slots, all `pgoutput`, used by Google Datastream to stream changes
to BigQuery through the bastion: `bigquery` (`journeys`), `bigquery_languages`,
`bigquery_media` and `bigquery_users` (each in its namesake database), with
publication `bq_publication` for all tables in those four databases. Logical
slots cannot survive a major upgrade from 13, so with the Datastream owner's
approval the streams were paused, the four inactive slots were dropped by name,
the upgrade was applied, the slots were recreated with the same names and
plugin, and each stream was recovered and backfilled. The publications survive
the upgrade unchanged. Repeat that sequence for any future major upgrade while
the streams exist, with two cautions learned here:

- Create each slot while connected to its own database. A replication slot
  belongs to the database of the session that creates it. GUI SQL clients send
  psql's `\c` to the server as text instead of switching databases, so two
  slots first landed in `journeys` and their streams failed to read them.
  Check with
  `SELECT slot_name, database FROM pg_replication_slots ORDER BY 1`.
- Recover the streams; do not just resume them. The upgrade restarts the WAL
  position (LSN) near zero, while Datastream keeps its pre-upgrade position, which
  is far ahead. A resumed stream asks the slot to start from that old position,
  so PostgreSQL skips every change and the stream looks healthy while sending
  nothing. Datastream's **Recover** option, started from the slot, reads from
  the new slot's own position; the backfill covers changes made before then.

`stage-aurora` was applied on 2026-10-19. AWS reported 503 seconds offline and
kept the pre-upgrade snapshot
`preupgrade-jfp-core-stage-13-23-to-17-11-2026-10-19-22-17`. The staging ECS
APIs failed health checks during the outage, were replaced automatically and
were serving queries through the gateway within five minutes of the database
returning. Keep that snapshot until production is verified.

`complete` was applied on 2026-10-20. AWS reported 515 seconds offline and kept
the pre-upgrade snapshot
`preupgrade-jfp-core-prod-13-23-to-17-11-2026-10-20-07-07`. Production was not
rehearsed on a clone; staging served as the rehearsal. Most production ECS
tasks reconnected without being replaced, and the gateway served languages,
videos and journeys queries afterwards. The four Datastream streams were
recovered and backfilled. Both approval flags were then cleared with a
flag-only targeted apply of both Aurora modules; a plan without them shows no
changes. Keep both pre-upgrade snapshots until production has run cleanly on 17
for a while, then delete them by hand: they are manual snapshots and do not
expire.

The PostgreSQL logs show a monitoring client polling
`pg_stat_bgwriter.checkpoints_timed` and `pg_stat_progress_vacuum.max_dead_tuples`,
which PostgreSQL 17 moved and renamed. Those queries now fail every 15 seconds.
It affects monitoring only; update the monitoring agent's Postgres check.

Rehearse the major upgrade and application queries on an approved test copy.
Staging, which can be restored from its five-day point-in-time window, serves
as the rehearsal for production; rehearse production on a clone of production.
Creating a clone, restoring a copy, or adding manual backups is a separate
provisioning action that needs its own approval. Confirm an existing recovery
point and a tested restore/cutover procedure. Major upgrades interrupt database
connections; coordinate the maintenance window. AWS takes an automatic snapshot
during the upgrade. Recovery uses a restored cluster and application cutover,
not an in-place major-version downgrade.

After preflight and recovery readiness, open the `stage-aurora` PR with that
committed default. Keep both approval-variable defaults false. Upgrade **staging
only** with explicit approval in the final reviewed plan:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=stage-aurora -var=allow_stage_aurora_major_upgrade=true -target=module.stage.module.postgresql
```

Inspect the new parameter group and in-place cluster/instance updates. No
replacement, data deletion, capacity reduction or credential change is expected.
After apply, verify the actual engine is
17.11, both parameter groups are in-sync, replication consumers resume, API
queries and migrations work, and database performance is acceptable. Refresh
statistics and update extensions only through a reviewed database procedure.

After staging verification, open the production Aurora PR with default
`complete`. Keep both approval-variable defaults false. Plan **production only**,
leaving the completed staging configuration intact:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=complete -var=allow_prod_aurora_major_upgrade=true -target=module.prod.module.postgresql
```

Never approve both environments' major changes in one plan. The guard compares
each target against that cluster's live engine. An
ordinary plan after a successful major upgrade needs no approval flag because
its desired and live major versions match. Do not leave approval enabled in
committed defaults or persistent Atlantis variables.

Repeat the same recovery, maintenance-window and post-upgrade checks. Only after
live versions and billing are verified should support-fee savings be recorded.

## References

- [Aurora PostgreSQL major upgrades](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_UpgradeDBInstance.PostgreSQL.MajorVersion.html)
