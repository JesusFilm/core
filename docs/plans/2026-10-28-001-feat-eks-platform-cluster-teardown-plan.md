---
title: 'feat: Tear down the EKS Platform Clusters'
type: feat
status: active
date: 2026-10-28
---

# feat: Tear down the EKS Platform Clusters

## Summary

The two EKS clusters (`jfp-eks-stage`, `jfp-eks-prod`) ran one workload of
their own, Plausible Analytics with its ClickHouse. Plausible now runs on ECS
Fargate and its events are in ClickHouse Cloud (plan `2026-10-14-002`, runbook
`infrastructure/modules/plausible/README.md`; the last piece, the NLB bridge,
went in #10046). What is left on both clusters is platform tooling that served
it: Argo CD, ingress-nginx, cert-manager, external-dns, the Doppler operator,
the AWS Load Balancer Controller, the EBS CSI driver, the snapshot controller
and snapscheduler, metrics-server, the Kubernetes dashboard and the Datadog
agent. None of it has a tenant any more.

This plan deletes both clusters, stage first, with Terraform where Terraform
created it and by hand where the clusters created it themselves, then removes
the Kubernetes layer from the repo. It saves roughly 550 USD a month (two
control planes, six `t3.large` nodes, two NLBs).

## Inventory (2026-10-28)

Verified before writing this plan, both environments unless noted.

**Nothing but tooling runs there.** Non-`kube-system` workloads: Argo CD,
cert-manager, Datadog operator and agent, Doppler operator, external-dns,
ingress-nginx, Kubernetes dashboard, metrics-server, snapscheduler, and the
Plausible Deployment at 0 replicas. No Ingress objects, no PVCs, no
VolumeSnapshots, no DopplerSecrets other than Plausible's and external-dns's.

**Nothing points at the clusters.**

- The only hostnames the ingresses ever served (git history of
  `infrastructure/kube`) are `analytics.stage.central.jesusfilm.org` and
  `analytics.jesusfilm.org`; both are CNAMEs to the public ALBs now.
- Route53 has no record whose value is an ingress NLB and no
  `external-dns-` ownership TXT records. The Cloudflare tunnel module routes
  nothing to the clusters.
- Prod's external-dns has been failing every minute with
  `InvalidClientTokenId` (its IAM user `externaldns` has no access keys any
  more); nothing noticed, which is its own evidence.
- No Datadog monitor references Kubernetes, EKS or Argo CD.
- No security group outside the clusters' own references the node or cluster
  security groups. Aurora, Redis and ECS reach each other without them.
- No GitHub workflow uses `kubectl`, `helm` or EKS.

**Terraform owns** (`module.<env>.module.eks`, `infrastructure/modules/aws/eks`):
the cluster, the node group `jfp-eks-node-group-2a-<env>`, the add-ons
(`aws_eks_addon.core`: kube-proxy, vpc-cni, coredns, eks-node-monitoring-agent),
the IAM roles `terraform-eks-cluster-<env>` and `terraform-eks-node-<env>` with
their policy attachments and instance profile, and the security groups
`terraform-eks-cluster-<env>` and `terraform-eks-node-<env>` with their rules.
Twenty resources per environment. The module's only output, `cluster_name`,
is referenced nowhere.

**The clusters created, outside Terraform** (must be removed by hand or by the
in-cluster controllers before the cluster goes):

| Resource | stage | prod | Created by |
| --- | --- | --- | --- |
| Ingress NLB `k8s-ingressn-ingressn-*` | `c4435aa5e1` | `f9b5e10220` | AWS Load Balancer Controller for the `ingress-nginx-controller` Service |
| NLB security group `k8s-ingressn-ingressn-*` | `sg-0f4cfb50378c6d583` | `sg-04d2139f6221f5568` | same |
| Shared backend security group `k8s-traffic-jfpeks<env>-*` | `sg-0308abecd60cb7634` | `sg-0ea69881812a17bcf` | same; references the EKS-managed cluster security group |
| EKS-managed cluster security group `eks-cluster-sg-jfp-eks-<env>-*` | `sg-0f325d1f95172a8f9` | `sg-0b81b56ab982de63a` | EKS; deleted with the cluster, but only once nothing references it |
| IAM OIDC provider | `.../id/805F2E83DC00D36BAE414C922D462626` | `.../id/2139796B026E33A2CDC80C0DECE2CFE9` | by hand (IRSA) |
| IRSA roles | `AmazonEKSLoadBalancerControllerRoleStage`, `AmazonEKS_EBS_CSI_DriverRole`, `AmazonEKS_EBS_CSI_DriverRole_stage` | `AmazonEKSLoadBalancerControllerRole`, `AmazonEKS_EBS_CSI_DriverRole_prod` | by hand |
| IAM user `externaldns` | shared | shared | by hand; no access keys remain |
| Policy `AllowExternalDNSUpdates` attached to `terraform-eks-node-stage` | stage | | by hand, outside Terraform; the policy is also on the user `externaldns` and on `mike.allison` |
| Policy `AWSLoadBalancerControllerIAMPolicy` | shared | shared | by hand; attached to the two controller roles only |

No CloudWatch log groups under `/aws/eks`, no EBS volumes or snapshots tagged
to either cluster (the Plausible ones were cleaned up in #10020 and #10038).

**Not EKS, leave alone:** `apis/api-analytics/infrastructure/` is the live
ECS module for api-analytics (its `main.tf`, `locals.tf`, `variables.tf`);
only the stale Kubernetes files beside them go (see Phase 4). The ECR
repositories `jfp-plausible-<env>` belong to the ECS Plausible module.

## Assumptions

- No one needs the Kubernetes dashboard or Argo CD UI after this. Both were
  reached by port-forward only.
- The final ClickHouse snapshots (`snap-016b2925ce7836226`,
  `snap-0decfd85f117e31a6`) stay until their own retention dates; they are
  independent of the clusters.
- The Doppler `plausible` project's root configs (`stg`, `prd`) keep their
  stale `CLICKHOUSE_DATABASE_URL` (the EKS value). Nothing reads them once the
  clusters are gone; tidy later or leave.
- Applies are local targeted `tofu apply` runs by a person, never
  `atlantis apply`: the PR's Atlantis plan will also carry the unrelated prod
  Arclight `desired_count` drift (1 live, 2 in config), which must not ride
  along. Claude's applies and deletes are blocked by policy; Claude prepares
  the PRs and commands and verifies afterwards.

## Order of work

Stage first; prod after stage has been gone for a day with nothing missed.
Each environment: Phase 1 by hand in the cluster, Phase 2 by Terraform, Phase
3 by hand in AWS. Phase 4 is the repo cleanup once both are gone.

### Phase 1: let the controllers remove what they created

The AWS Load Balancer Controller deletes the NLB and its two security groups
when its Service goes; EKS cluster deletion will not, and the shared backend
group would then block the deletion of the EKS-managed cluster security
group. Argo CD self-heals the Service, so stop Argo first.

```bash
# <ctx> is the kubeconfig context for the environment
kubectl --context <ctx> -n argocd delete application ingress-nginx aws-load-balancer-controller --cascade=orphan
kubectl --context <ctx> -n ingress-nginx delete svc ingress-nginx-controller
# wait: the NLB and its security groups go within a few minutes
aws elbv2 describe-load-balancers --query "LoadBalancers[?contains(LoadBalancerName,'k8s-ingressn')].LoadBalancerName"
aws ec2 describe-security-groups --filters Name=group-name,Values='k8s-*' --query 'SecurityGroups[].GroupName'
```

Both must come back empty for the environment before Phase 2. If the
`k8s-traffic-*` group stays (the controller keeps it while any load balancer
it manages exists), delete it by hand once the NLB is gone.

Stage only: `AllowExternalDNSUpdates` was attached to the node role by hand,
and the module does not set `force_detach_policies`, so the role's destroy
would fail with `DeleteConflict`. Detach it first:

```bash
aws iam detach-role-policy --role-name terraform-eks-node-stage \
  --policy-arn arn:aws:iam::410965620680:policy/AllowExternalDNSUpdates
```

Nothing else in the cluster needs deleting first: no volumes, no DNS records,
no certificates that matter. The Datadog agent's hosts expire from Datadog on
their own.

### Phase 2: Terraform removes the cluster

One PR, `infrastructure/`:

- `environments/stage/main.tf`, `environments/prod/main.tf`: delete
  `module "eks"` and the `eks_addon_configuration` local.
- `environments/*/variables.tf`: drop `eks_cluster` and `eks_nodes` from
  `versions` (and their validation), delete `eks_addon_versions`.
- `main.tf`: stop passing them to the environment modules.
- `upgrades.tf`: keep the phase variable and Aurora versions (the Aurora
  precondition and `allow_*_aurora_major_upgrade` still use them), delete the
  `*_eks`, `prod_nodes` and `prod_addons` fields, `eks_adoption_versions`,
  `*_addon_versions` and `eks_addon_versions`. Simplest: collapse the phase
  table to `complete` and the Aurora fields only.
- Delete `eks-addon-imports.tf` and `modules/aws/eks/` (with its tests).
- `UPGRADES.md`: a note that the EKS rollout history is in git and the
  clusters were removed; `GLOSSARY.md`: retire **Platform Cluster**.

Atlantis autoplan on the PR shows the destroys (and the Arclight drift; do not
apply it). After merge, per environment, from an initialised checkout of main:

```bash
tofu plan -target=module.<env>.module.eks     # expect 20 to destroy, nothing else
tofu apply -target=module.<env>.module.eks
```

The node group goes first (about 10 minutes, it drains and terminates the
three instances), then the add-ons and the cluster (another 10), then the
security groups and IAM. Do it with Terraform, not the console: the module's
`data.aws_eks_cluster.live` / `data.aws_eks_node_group.live` lookups make a
still-configured module with a deleted cluster fail every plan for the
environment (the same trap as the Plausible snapshot module).

If `terraform-eks-cluster-<env>` refuses to delete because of a dependency,
Phase 1 was incomplete: look for ENIs or security groups still referencing
it.

### Phase 3: by hand, what the clusters left behind

Per environment, after Phase 2:

```bash
aws iam delete-open-id-connect-provider --open-id-connect-provider-arn arn:aws:iam::410965620680:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/<id>
for r in <the environment's IRSA roles from the table>; do
  for p in $(aws iam list-attached-role-policies --role-name $r --query 'AttachedPolicies[].PolicyArn' --output text); do
    aws iam detach-role-policy --role-name $r --policy-arn $p
  done
  aws iam delete-role --role-name $r
done
```

`AWSLoadBalancerControllerIAMPolicy` goes after the second controller role.
After prod, also the IAM user `externaldns` (detach `AllowExternalDNSUpdates`,
delete the user). Keep the policy itself: it is also attached to
`mike.allison`, and whether that is still wanted is a separate decision.

In Doppler: revoke the service tokens the two Doppler operators used
(`plausible` project, configs `stg`/`prd`, and whichever project held the
external-dns credentials).

Locally: `kubectl config delete-context` for the clusters.

### Phase 4: remove the Kubernetes layer from the repo

After both clusters are gone, one PR:

- Delete `infrastructure/kube/` entirely (charts, Argo CD applications,
  `aws-auth-cm-*.yaml`, `deploy.sh`, `storage/`, `AGENTS.md`, READMEs).
- Root `AGENTS.md`: drop `infrastructure/kube/AGENTS.md` from the nested
  locations list.
- `renovate.json`: remove the `argocd` manager, the `infrastructure/kube/**`
  helm rule and the Argo CD install-manifest regex manager.
- `apis/api-analytics/infrastructure/`: delete the stale Kubernetes files
  (`deploy.sh`, `deploy-stage.sh`, `values-prod.yaml`, `values-stage.yaml`,
  `storage-class.yaml`, `snapshot-class.yaml`, `volume-snapshot.yaml`); keep
  the Terraform files, which are the live ECS module.
- `infrastructure/GLOSSARY.md`: already handled in Phase 2 if not before.
- `docs/plans/2026-10-14-002-feat-plausible-on-ecs-graviton-plan.md`:
  status `done`.

## Verification

After each environment's Phase 2:

- `aws eks list-clusters` no longer lists it; `aws ec2 describe-instances`
  filtered on `tag:eks:cluster-name` shows nothing running.
- `aws ec2 describe-security-groups` with name filters `*eks*` and `k8s-*`
  shows only the other environment's groups.
- A full `tofu plan` for the environment has no EKS resources and no new
  errors. The ECS services, Aurora, Redis and the public ALBs are untouched:
  spot-check `analytics.<host>/api/health` and a stats query through the
  gateway.
- Datadog: the agent hosts disappear within the retention window; no
  monitor fires.

## Rollback

There is none worth planning. A cluster that has been deleted is recreated,
not restored, and nothing depends on these. Stop after stage if the prod
Phase 1 checks find something this inventory missed.

## Out of scope

- The prod Arclight `desired_count` drift (1 live, 2 in config). Decide which
  is right before any broad prod apply.
- Tidying the Doppler `plausible` root configs.
- The old Plausible snapshot retention follow-ups.
