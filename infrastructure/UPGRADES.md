# Staged infrastructure version upgrades

The desired state is EKS **1.36** and Aurora PostgreSQL **17.11** in staging and
production. `upgrade_phase` selects intermediate configurations in the same
Terraform root. The default `complete` remains the desired state after rollout;
do not merge a temporary phase into the defaults. A live EKS precondition rejects
skipped minors and downgrades. An initial unqualified plan is therefore expected
to fail while the clusters are still on 1.32.

Use the existing Atlantis project and state. Resolve another PR's project lock
through its owner; never unlock or apply another PR's plan. Every phase needs a
fresh reviewed saved plan. Do not apply a broad plan: unrelated production ECS
desired-count drift has been observed. Targeted plans do not prove that the rest
of the root is reconciled. After all phases, review the complete root plan and
resolve unrelated drift separately before declaring reconciliation complete.

## EKS rollout

First resolve the existing staging cert-manager webhook readiness issue. Check
all running pods, stateful applications, volume attachments, disruption budgets,
subnet IP availability and upgrade insights. Existing singleton workloads may
be interrupted by node drains. Do not force drains or bypass disruption budgets.
Node capacity stays at 3 desired/minimum and 5 maximum; updates allow one
unavailable node. Existing AL2023 workers are retained. The unused AL2 AMI lookup
has been removed because AL2 images are unavailable for the new minor versions.

The three bootstrap components are adopted as EKS managed add-ons with pinned
versions: kube-proxy, VPC CNI and CoreDNS. Their observed field manager was `eks`,
and no competing repository/GitOps controller was found. Creation uses
`OVERWRITE` to adopt those existing objects, so inspect the stored configuration
and compare it to live objects before this step. Networking settings, DNS
replicas/resource requests and its disruption budget are explicitly preserved.
Updates use `PRESERVE`; removing Terraform management preserves the Kubernetes
add-on objects. This does not remove replication or grant a new IAM role.

Prepare **staging only** on its existing 1.32 control plane:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=prepare -target=module.stage.module.eks
```

Apply the reviewed saved plan using the existing Atlantis review/apply workflow.
Confirm all core add-ons and the monitoring agent are ACTIVE and pods are healthy before proceeding.
Then use these phases **one at a time**, always targeting
`module.stage.module.eks`:

| Phase        | Staging control plane / workers | Production |
| ------------ | ------------------------------- | ---------- |
| `stage-1.33` | 1.33                            | Preserved  |
| `stage-1.34` | 1.34                            | Preserved  |
| `stage-1.35` | 1.35                            | Preserved  |
| `stage-1.36` | 1.36                            | Preserved  |

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

The existing managed node-monitoring agents and production EBS CSI driver are imported using declarative import blocks. The staging agent advances from 1.1.0 to the existing production agent version 1.4.0; production EBS CSI advances from 1.31.0 to the pinned regional default 1.67.0. Both targets were verified compatible with 1.32 and 1.36. Their live configuration and service-account IAM roles are read and retained. No existing add-on is recreated, and their current Pod Identity association lists were empty. Recheck those lists and ownership before apply; stop if either changes. Check every pinned add-on's compatibility before each minor, along with storage attachment and node-health checks.

After staging workload verification, target `module.prod.module.eks`:

| Phase          | Production control plane | Production workers              |
| -------------- | ------------------------ | ------------------------------- |
| `prod-prepare` | 1.32                     | 1.31 → 1.32; adopt core add-ons |
| `prod-1.33`    | 1.33                     | 1.33                            |
| `prod-1.34`    | 1.34                     | 1.34                            |
| `prod-1.35`    | 1.35                     | 1.35                            |
| `prod-1.36`    | 1.36                     | 1.36                            |

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

After preflight and recovery readiness, upgrade **staging only**:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=stage-aurora -target=module.stage.module.postgresql
```

Inspect the new parameter group and in-place cluster/instance updates. No
replacement, data deletion, capacity reduction or credential change is expected.
After apply, verify the actual engine is
17.11, both parameter groups are in-sync, replication consumers resume, API
queries and migrations work, and database performance is acceptable. Refresh
statistics and update extensions only through a reviewed database procedure.

Then plan **production only**, leaving the completed staging configuration intact:

```text
atlantis plan -d infrastructure -- -var=upgrade_phase=complete -target=module.prod.module.postgresql
```

Repeat the same recovery, maintenance-window and post-upgrade checks. Only after
live versions and billing are verified should support-fee savings be recorded.

## References

- [EKS upgrade procedure](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html)
- [EKS add-on adoption](https://docs.aws.amazon.com/eks/latest/userguide/creating-an-add-on.html)
- [Aurora PostgreSQL major upgrades](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_UpgradeDBInstance.PostgreSQL.MajorVersion.html)
