# Staged infrastructure version upgrades

The rollout targets EKS **1.36** and Aurora PostgreSQL **17.11** in staging and
production.

**Current state (2026-10-18): the committed default is `prod-1.36`.** Both
environments have finished the EKS rollout. Staging completed `prepare`,
`stage-addons` and every minor through 1.36. Production completed `prod-prepare`,
`prod-addons` and every minor through 1.36 on 2026-10-18. In both, the control
plane, workers, kube-proxy, VPC CNI and CoreDNS are on their 1.36 versions, and
production's EBS CSI driver is the Argo-managed 1.53.0. Aurora is still 13.23 in
both, with staging on I/O-Optimized storage. `stage-aurora` is the next phase.

Live EKS preconditions reject skipped minors,
downgrades and control-plane upgrades before worker alignment. A separate live
Aurora precondition rejects a major change unless that environment's explicit
approval variable is true. Completing EKS never implicitly approves Aurora.

Use the existing Atlantis project and state. Resolve another PR's project lock
through its owner; never unlock or apply another PR's plan. **The current
`automerge: true` configuration merges a PR after its first successful apply and
deletes its branch.** This PR delivers the staging EKS upgrade to 1.36 and the
approved staging I/O-Optimized storage switch; each subsequent phase needs its
own reviewed PR that advances the committed `upgrade_phase`
default to that phase. Retain the successfully applied phase as the default so
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

## EKS rollout

First resolve the existing staging cert-manager webhook readiness issue. Check
all running pods, stateful applications, volume attachments, disruption budgets,
subnet IP availability and upgrade insights. Existing singleton workloads may
be interrupted by node drains. Do not force drains or bypass disruption budgets.
Node capacity stays at 3 desired/minimum and 5 maximum; updates allow one
unavailable node. Existing AL2023 workers are retained. **Stop if preparation or any minor's
actual Atlantis plan shows node-group replacement, deletion, or an AMI-type
change.** This applies to `prepare`, `prod-prepare` and every CI plan; do not
accept replacement as an expected consequence of the explicit AMI type. The unused AL2 AMI lookup
has been removed because AL2 images are unavailable for the new minor versions.

The three bootstrap components are first adopted as EKS managed add-ons at
their **observed live versions**, without a version upgrade. This applies only
to kube-proxy, VPC CNI and CoreDNS; it makes no ownership claim for EBS CSI.
Read-only observations on 2026-10-15 found these versions in both environments,
and DescribeAddonVersions reported them compatible with EKS 1.32:

| Component             | Live image version           | Preparation add-on pin |
| --------------------- | ---------------------------- | ---------------------- |
| kube-proxy            | `v1.30.0-minimal-eksbuild.3` | `v1.30.0-eksbuild.3`   |
| VPC CNI               | `v1.18.1-eksbuild.3`         | `v1.18.1-eksbuild.3`   |
| CoreDNS               | `v1.11.1-eksbuild.8`         | `v1.11.1-eksbuild.8`   |
| Stage node monitoring | `v1.1.0-eksbuild.1`          | `v1.1.0-eksbuild.1`    |
| Prod node monitoring  | `v1.4.0-eksbuild.2`          | `v1.4.0-eksbuild.2`    |

The bootstrap field manager was `eks`; no competing repository/GitOps controller
was found for these three components. Creation uses `OVERWRITE` to adopt existing
objects. **Before preparation, re-read live images, field managers, configuration
and the configuration schemas for these exact pins. Stop if a pin would change a
live version, if another controller owns the objects, or if the reviewed
configuration differs.** Adoption can still reconcile manifests and restart
pods, even at the same binary version. Networking settings, DNS replicas/resource
requests and its disruption budget must be compared before apply. Updates use
`PRESERVE`; removing Terraform management preserves the Kubernetes add-on objects.
No new IAM role is granted.

After adoption and health verification, a **separate `stage-addons` PR** upgrades
bootstrap add-ons to the reviewed 1.32 pins in `upgrades.tf` and staging monitoring
to 1.4.0. The analogous `prod-addons` PR follows production preparation. These
version changes are deliberate upgrade phases, never bundled into adoption.
Recheck the regional compatibility of every selected pin before its phase.

Prepare **staging only** on its existing 1.32 control plane:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=prepare -target=module.stage.module.eks -target=module.stage.module.postgresql
```

This initial saved plan includes the already approved staging I/O-Optimized
storage switch at the unchanged 13.23 engine. Review both targets together; do
not apply only one target and assume the other completed before automerge.

Apply the reviewed saved plan using the existing Atlantis review/apply workflow.
Confirm all core add-ons and the monitoring agent are ACTIVE and pods are healthy before proceeding.
Then use these phases **one at a time**, always targeting
`module.stage.module.eks`:

| Phase          | Staging control plane / workers | Production |
| -------------- | ------------------------------- | ---------- |
| `stage-addons` | 1.32; upgrade add-ons only      | Preserved  |
| `stage-1.33`   | 1.33                            | Preserved  |
| `stage-1.34`   | 1.34                            | Preserved  |
| `stage-1.35`   | 1.35                            | Preserved  |
| `stage-1.36`   | 1.36                            | Preserved  |

For example:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=stage-1.33 -target=module.stage.module.eks
```

Terraform updates the control plane, then matching add-ons, then workers. After
**each apply**, wait for ACTIVE cluster/node/add-on status and successful rolling
updates, recheck insights and application health, and run a fresh plan before
the next minor. Version 1.33 still has extended-support charges; 1.34 is the first
standard-support step, and 1.36 gives a longer supported runway. Verify current
regional support dates and the pinned add-on compatibility before rollout.

Existing managed node-monitoring agents are imported using declarative import
blocks and retain their live configuration and service-account IAM roles. The
staging agent remains on 1.1.0 during preparation; the separate add-on upgrade
phase advances it to production's existing 1.4.0 pin. The observed Pod Identity
association lists were empty; stop and review if that changes before import.

**EBS CSI is excluded from this Terraform module and its imports.** Both
environments run the driver from the ArgoCD wrapper Helm chart in
`infrastructure/kube/aws-ebs-csi-driver`, pinned to driver 1.53.0, with no
native EKS add-on. Production was handed over on 2026-10-18: its native add-on
(1.31.0, supported only through Kubernetes 1.34) was deleted and the manual
production Argo application synced from `main`. The Helm chart adds a selector
label that existing objects cannot take, so the handoff deleted the add-on
without `--preserve` and let Argo create fresh objects. Mounted volumes stayed
attached throughout, IRSA kept the existing role and service account, and every
node re-registered the driver. DescribeAddonVersions lists driver 1.53.0 as
compatible with Kubernetes 1.32 through 1.36, and staging has run it at 1.36,
including a ClickHouse volume reattachment. Do not run `deploy-prod.sh` or
`deploy-stage.sh`: they delete the EKS add-on and rewrite IAM trust, and neither
is needed now. Any driver version update goes through the wrapper chart and the
Argo applications. Production's Argo application does not sync automatically,
so sync it by hand after the change merges to `main`.

After staging workload verification, target `module.prod.module.eks`:

| Phase          | Production control plane | Production workers              |
| -------------- | ------------------------ | ------------------------------- |
| `prod-prepare` | 1.32                     | 1.31 → 1.32; adopt core add-ons |
| `prod-addons`  | 1.32                     | 1.32; upgrade core add-ons      |
| `prod-1.33`    | 1.33                     | 1.33                            |
| `prod-1.34`    | 1.34                     | 1.34                            |
| `prod-1.35`    | 1.35                     | 1.35                            |
| `prod-1.36`    | 1.36                     | 1.36                            |

Before each production phase, confirm the production `aws-ebs-csi-driver` Argo
application is Synced/Healthy and its volume attachments are healthy. During
`prod-1.33` it showed OutOfSync on the `CSIDriver` alone, because the chart sets
`nodeAllocatableUpdatePeriodSeconds` and 1.33 drops that alpha-gated field; a
manual sync after `prod-1.34` stored it and cleared the drift. Each production
worker roll takes `analytics.jesusfilm.org` offline for a minute or two at a
time: ingress-nginx, Plausible and both ClickHouse servers each run a single pod.
Production worker alignment is required before advancing its control plane.
Use the same health checks and saved-plan review at each minor. Do not lower the
phase for a live cluster that has already advanced; the precondition rejects it.

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
slots. The live SQL checks have not yet been completed by this PR.

Rehearse the major upgrade and application queries on an approved test copy.
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
each target against that cluster's live engine, independently of EKS state. An
ordinary plan after a successful major upgrade needs no approval flag because
its desired and live major versions match. Do not leave approval enabled in
committed defaults or persistent Atlantis variables.

Repeat the same recovery, maintenance-window and post-upgrade checks. Only after
live versions and billing are verified should support-fee savings be recorded.

## References

- [EKS upgrade procedure](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
- [EKS add-on adoption](https://docs.aws.amazon.com/eks/latest/userguide/creating-an-add-on.html)
- [Aurora PostgreSQL major upgrades](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_UpgradeDBInstance.PostgreSQL.MajorVersion.html)
