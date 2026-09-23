---
status: proposed
date: 2026-09-22
deciders: core team
---

# Plausible EBS snapshot retention

Retain only a bounded set of EBS snapshots of the Plausible ClickHouse volumes, enforced by an AWS Data Lifecycle Manager policy rather than by the in-cluster snapshot schedule, and delete the existing backlog.

## Context

The Plausible Analytics release in `infrastructure/kube/plausible-analytics` snapshots its ClickHouse PVCs daily. The schedule is a SnapScheduler `SnapshotSchedule` (`templates/snapscheduler.yaml`, `0 0 * * *`, `retention.maxCount: 5`, no `claimSelector`, so it covers every PVC in the namespace). The `VolumeSnapshotClass` it uses (`templates/snapshot-class.yaml`) has `deletionPolicy: Retain`, so when SnapScheduler prunes a `VolumeSnapshot` past the fifth, only the Kubernetes object is removed and the underlying EBS snapshot is kept forever. `templates/volume-snapshot.yaml` also declares two one-shot `VolumeSnapshot`s of the primary and replica ClickHouse PVCs. The same schedule runs in both prod and stage.

As of 22 Sep 2026 the account holds 1,462+ EBS snapshots, nearly all of the two 500 GiB `clickhouse-gp3` volumes (prod holds about 59 GiB of data, stage about 74 GiB). Cost Explorer shows `USE2-EBS:SnapshotUsage` at $469 in June, $495 in July, and $522 in August 2026, rising about $25 a month. That is 12% of the account's monthly spend and more than the four volumes themselves cost. Snapshots are incremental, but ClickHouse rewrites merged parts constantly, so each snapshot carries a real delta and the backlog grows without bound.

No cost-allocation tags are active on the account, so this was found by reading the Snapshots console, not from a report.

## Decision

Keep the last 7 daily snapshots and the last 4 weekly snapshots per volume, in prod. Keep the last 3 daily snapshots in stage. Delete everything older, in both environments, after one verified restore from a recent snapshot.

Implement retention with an AWS Data Lifecycle Manager policy targeting the volumes by their `kubernetes.io/created-for/pvc/name` tag, rather than in the Kubernetes snapshot resources, so the policy survives chart upgrades and is visible in the AWS console. Remove the `SnapshotSchedule` from the chart once DLM is confirmed producing snapshots, so there is one source of them.

## Alternatives considered

- **Leave it.** Cost keeps rising ~$25/month. Rejected.
- **Retention in Kubernetes: switch the `VolumeSnapshotClass` to `deletionPolicy: Delete` so SnapScheduler's `maxCount` prunes the EBS snapshot too.** Stops the growth with a one-line change, but lives inside the Plausible release and is invisible outside Kubernetes, and does nothing about the existing backlog. Rejected in favor of DLM, which the same people who read Cost Explorer can see.
- **Replace snapshots with `clickhouse-backup` to S3.** Better backups (logical, restorable to a different cluster, needed anyway if Plausible ever moves off EKS). Deferred: it is the right long-term answer but a larger change than this ADR needs, and it belongs with the Plausible-off-EKS decision tracked in the short links gap analysis.

## Consequences

- Snapshot cost drops from ~$522/month to roughly $30–50/month within one billing cycle of deleting the backlog, about $5,500/year.
- Restore points go from "every snapshot ever" to seven days plus four weeks. Nobody has ever restored from a snapshot older than that, and ClickHouse data older than a month is not something Plausible needs to roll back to.
- One-time work: verify a restore, write the DLM policy (Terraform, alongside the existing EKS resources in `infrastructure/modules/aws/eks`), delete the backlog, edit the chart. Half a day.
- Follow-up: the same audit should check whether any other PVC in either cluster has an unbounded snapshot schedule. `apis/api-analytics/infrastructure/snapscheduler.yaml` is a copy of the same schedule applied to the `default` namespace by that service's deploy scripts.

## References

- [plausible-analytics values.yaml](https://github.com/JesusFilm/core/blob/main/infrastructure/kube/plausible-analytics/values.yaml)
- [snapscheduler.yaml](https://github.com/JesusFilm/core/blob/main/infrastructure/kube/plausible-analytics/templates/snapscheduler.yaml)
- [snapshot-class.yaml](https://github.com/JesusFilm/core/blob/main/infrastructure/kube/plausible-analytics/templates/snapshot-class.yaml)
- [volume-snapshot.yaml](https://github.com/JesusFilm/core/blob/main/infrastructure/kube/plausible-analytics/templates/volume-snapshot.yaml)
- Gap analysis, analytics store section: [GMNS vs. core](https://claude.ai/code/artifact/d80d53d0-6929-4907-8fb7-ebff9e085bec)
