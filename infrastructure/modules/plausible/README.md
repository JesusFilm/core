# Plausible Analytics on ECS

[Plausible Community Edition](https://github.com/plausible/community-edition)
as an ECS Fargate Service on ARM64, from the published image, behind the
public ALB. Plan: `docs/plans/2026-10-14-002-feat-plausible-on-ecs-graviton-plan.md`.
Its PostgreSQL is in the Core Database.

The move off the EKS Platform Cluster happens in two steps per environment,
stage first:

1. **The app moves to ECS; the events stay put.** The task reads and writes
   the existing ClickHouse StatefulSet on EKS through a temporary internal NLB
   (`eks-clickhouse.tf`, `infrastructure/kube/plausible-analytics/clickhouse-ecs-bridge.yaml`).
   Traffic moves by DNS; rollback is DNS.
2. **The events move to ClickHouse Cloud.** Stop the task, copy, point
   `CLICKHOUSE_DATABASE_URL` at Cloud, start it. Rollback is the URL. Then the
   bridge goes, and EKS has nothing left to run.

|                                             | stage                                                                         | prod                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hostname                                    | `analytics.stage.central.jesusfilm.org`                                       | `analytics.jesusfilm.org`                              |
| Smoke-test hostname (module-created record) | `plausible.stage.central.jesusfilm.org`                                       | `plausible.central.jesusfilm.org`                      |
| Certificate                                 | the `*.stage.central.jesusfilm.org` wildcard                                  | ACM `analytics.jesusfilm.org`, validated in Cloudflare |
| DNS for the hostname                        | Route53 zone `stage.central.jesusfilm.org` (external-dns owned until cutover) | Cloudflare DNS, DNS-only CNAME, by hand                |
| Doppler                                     | `plausible` / `stg_ecs` (branch of `stg`)                                     | `plausible` / `prd_ecs` (branch of `prd`)              |
| Argo CD (EKS Deployment)                    | auto-sync from the `stage` branch                                             | auto-sync from `main`                                  |

Configuration is six keys of the `plausible` Doppler project (`BASE_URL`,
`CLICKHOUSE_DATABASE_URL`, `DATABASE_URL`, `DISABLE_REGISTRATION`,
`SECRET_KEY_BASE`, `TOTP_VAULT_KEY`); `ecs-task` copies them to SSM and injects
them. The ECS task reads a branch config that inherits everything from the
root config and overrides only `CLICKHOUSE_DATABASE_URL`, so the EKS
Deployment, which reads the root config, is untouched. Changing a value in
Doppler needs a Terraform apply (it rewrites the SSM parameter) and a new
deployment of the service to be picked up.

Plausible CE is single-node, so the Service runs one task and deploys with
`0% / 100%`: the old task stops, then the new one starts and runs migrations.
Expect a short gap on every deploy.

## Prerequisites (once per environment)

Each step needs the one before it.

1. **Doppler branch config and token.** In the `plausible` project create a
   branch config of `stg` named `stg_ecs` (prod: `prd_ecs` of `prd`). Leave
   it inheriting everything for now. Create a read-only service token for the
   branch config and store it:

   ```bash
   aws ssm put-parameter --type SecureString --overwrite \
     --name /terraform/prd/DOPPLER_PLAUSIBLE_STAGE_TOKEN --value 'dp.st....'
   ```

   (prod: `DOPPLER_PLAUSIBLE_PROD_TOKEN`). Without it the environment's plan
   fails on the `data.aws_ssm_parameter`.

2. **The NLB's security group**, on its own so the manifest can name it:

   ```bash
   tofu apply \
     -target=module.stage.module.plausible.aws_security_group.eks_clickhouse_nlb \
     -target=module.stage.module.plausible.aws_vpc_security_group_ingress_rule.eks_clickhouse_from_ecs \
     -target=module.stage.module.plausible.aws_vpc_security_group_egress_rule.eks_clickhouse_to_pods
   ```

3. **The internal NLB**, applied by hand (Argo CD does not track it and leaves
   it alone):

   ```bash
   sg=$(aws ec2 describe-security-groups \
     --filters Name=group-name,Values=jfp-plausible-eks-clickhouse-stage \
     --query 'SecurityGroups[0].GroupId' --output text)
   sed "s/NLB_SECURITY_GROUP_ID/$sg/" \
     infrastructure/kube/plausible-analytics/clickhouse-ecs-bridge.yaml |
     kubectl --context stage apply -f -
   kubectl --context stage get svc plausible-clickhouse-ecs -w   # until EXTERNAL-IP shows the NLB name
   ```

   The target turns healthy a minute or two after the NLB is active.

4. **Point the branch config at the NLB.** In `stg_ecs`, override
   `CLICKHOUSE_DATABASE_URL` with the root config's value, changing only the
   host to the NLB name from step 3 (keep the scheme, port 8123, credentials
   and database).

5. **Prod only: certificate.** The Terraform apply requests an ACM certificate
   for `analytics.jesusfilm.org`. Read its validation record and add it in
   Cloudflare (DNS-only):

   ```bash
   aws acm list-certificates --query "CertificateSummaryList[?DomainName=='analytics.jesusfilm.org'].CertificateArn" --output text
   aws acm describe-certificate --certificate-arn <arn> \
     --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
   ```

   `aws acm describe-certificate ... --query Certificate.Status` reads
   `ISSUED` a few minutes after the CNAME exists. The attach-to-listener step
   is in the prod cutover below.

Then apply the rest: `tofu apply -target=module.stage.module.plausible`.

## After the first apply: smoke test

On the module's own hostname, which the wildcard certificate covers and which
nothing else uses:

```bash
curl -s https://plausible.stage.central.jesusfilm.org/api/health
# a test pageview for a stage site; it lands in the EKS ClickHouse's events_v2
curl -s -X POST https://plausible.stage.central.jesusfilm.org/api/event \
  -H 'Content-Type: application/json' -H 'User-Agent: smoke' \
  -d '{"name":"pageview","url":"https://example.test/smoke","domain":"<a stage site domain>"}'
```

The task log (Datadog, `service:plausible`) should show `createdb` and
`migrate` with nothing to do, then the server booting. Dashboard login on this
hostname may be refused by Phoenix's origin check because `BASE_URL` names the
real hostname; check the dashboard after the DNS cutover instead.

Both Plausibles now share the same PostgreSQL and ClickHouse, which is fine
for the cutover: they write the same tables, and the background jobs are
coordinated through PostgreSQL.

## Stage cutover

`analytics.stage.central.jesusfilm.org` was a CNAME to the EKS ingress NLB.
external-dns created it but no longer manages it: each pass it logs "no hosted
zone matching record DNS Name was detected" and skips the record, and the zone
holds no `external-dns-` ownership TXT records. So Terraform takes the record
without the Ingress going first, and the Ingress stays through the soak so the
rollback is DNS alone.

1. Note the record's current value; it is the rollback. Before the cutover it
   was `k8s-ingressn-ingressn-c4435aa5e1-224931e8a90032ef.elb.us-east-2.amazonaws.com`.
2. Terraform: the `aws_route53_record` for `analytics` in the stage zone,
   CNAME to the stage public ALB, `allow_overwrite = true`. Apply it alone:
   `tofu apply -target=module.stage.aws_route53_record.plausible_analytics`.
3. Verify: dashboard login, a stats query through the stage gateway, realtime
   ingest from a stage journey.
4. After the soak, in `infrastructure/kube/plausible-analytics/values-stage.yaml`
   set `ingress.enabled: false` and `replicaCount: 0`, and get it onto the
   `stage` branch. Argo CD self-heals the stage app, so do it through the
   chart, not with kubectl. Its ClickHouse keeps running; the ECS task needs it.

**Rollback:** set the record back to the NLB name. If external-dns has started
managing the zone again by then, check its log first: it would want the record
on the NLB too.

## Prod cutover

1. Confirm the certificate is `ISSUED` (prerequisite 5). Terraform: the
   `aws_lb_listener_certificate` attaching it to the public listener. Apply.
2. Pre-check without touching DNS:

   ```bash
   alb=$(aws elbv2 describe-load-balancers --names jfp-public-alb-prod --query 'LoadBalancers[0].DNSName' --output text)
   ip=$(getent hosts "$alb" | head -1 | cut -d' ' -f1)
   curl -sv --resolve "analytics.jesusfilm.org:443:$ip" https://analytics.jesusfilm.org/api/health 2>&1 | grep -E 'subject:|HTTP/'
   ```

   The certificate must be the `analytics.jesusfilm.org` one and the health
   check must return 200.

3. In Cloudflare DNS for `jesusfilm.org`: change the `analytics` CNAME target
   from the ingress NLB name to `$alb`. Keep it DNS-only and TTL 300. Note the
   old value.
4. After TTL: dashboard, `api-journeys` stats, realtime ingest.
5. Scale the EKS Deployment to 0 after the rollback window. Prod's Argo app
   self-heals from `main`, so do it with `replicaCount: 0` in `values.yaml`,
   not kubectl.

**Rollback:** the CNAME back to the NLB name. Nothing else changes.

## What to watch (a week on stage, then prod)

- ECS: one task, `ARM64`, no restarts; the ALB target healthy on `/api/health`.
- Datadog logs for the task: ClickHouse or Postgres errors, slow queries.
- Task memory against 4 GiB. Stage's EKS pod leaked memory until killed
  (5.8 GB before it had a limit); find out whether the task does the same
  before prod moves.
- `api-journeys` stats queries and the journeys dashboard.
- Plausible's own jobs (email reports, salt rotation) in the log.

## Moving the events to ClickHouse Cloud

After the environment's cutover. The tenant setup on Cloud (database, users,
settings profile) and the copy are in plan `2026-10-14-001` and its runbook in
`infrastructure/kube/plausible-analytics/README.md`. Prod's event store is
about 1.3 GiB compressed, so the copy is one pass with Plausible stopped:

1. Prepare the tenant on Cloud.
2. Stop Plausible: set the service's desired count to 0
   (`aws ecs update-service --desired-count 0`), and confirm the EKS Deployment
   is already at 0.
3. Copy every table from the EKS ClickHouse to Cloud; compare counts.
4. In the branch config, set `CLICKHOUSE_DATABASE_URL` to the Cloud URL; apply
   Terraform; set the desired count back to 1.
5. Verify as in the cutover.

**Rollback:** the branch config URL back to the NLB, apply, restart. Events
written to Cloud in between are lost.

Once it has run on Cloud for the rollback window: delete
`plausible-clickhouse-ecs` from the cluster, remove `eks-clickhouse.tf` and
the manifest, and take a final EBS snapshot of the ClickHouse volume. EKS then
runs nothing of its own, and its teardown is a separate plan.

## Upgrading Plausible

Bump `plausible_version` (default in `variables.tf`, or per environment in the
module call). Read the release notes for ClickHouse-side requirements; the
service deploys 0/100 so the migration runs exactly once.
