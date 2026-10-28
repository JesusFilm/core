# Plausible Analytics on ECS

[Plausible Community Edition](https://github.com/plausible/community-edition)
as an ECS Fargate Service on ARM64, from the published image, behind the
public ALB. Plan: `docs/plans/2026-10-14-002-feat-plausible-on-ecs-graviton-plan.md`.
Its PostgreSQL is in the Core Database.

Its events are in the environment's ClickHouse Cloud service
(`module.<env>.module.short_links_clickhouse`), database `plausible_events_db`,
as the user `plausible` (`clickhouse-cloud/users.sql`).

The move off the EKS Platform Cluster is complete. It went in two steps per
environment, stage first, and the sections below are the record of it:

1. **The app moved to ECS; the events stayed put.** The task read and wrote
   the ClickHouse StatefulSet on EKS through a temporary internal NLB. Traffic
   moved by DNS (stage 2026-10-23, prod 2026-10-26).
2. **The events moved to ClickHouse Cloud** with the task stopped (stage
   2026-10-26, prod 2026-10-27). The EKS ClickHouse, its volumes and the NLB
   bridge are gone; the final snapshots of the data volumes are
   `snap-016b2925ce7836226` (stage) and `snap-0decfd85f117e31a6` (prod).

Nothing of Plausible's runs on EKS now (the Argo CD apps remain, at
`replicaCount: 0`, until the cluster goes). There is no rollback to EKS.

|                                             | stage                                                                         | prod                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hostname                                    | `analytics.stage.central.jesusfilm.org`                                       | `analytics.jesusfilm.org`                              |
| Smoke-test hostname (module-created record) | `plausible.stage.central.jesusfilm.org`                                       | `plausible.central.jesusfilm.org`                      |
| Certificate                                 | the `*.stage.central.jesusfilm.org` wildcard                                  | ACM `analytics.jesusfilm.org`, validated in Cloudflare |
| DNS for the hostname                        | Route53 zone `stage.central.jesusfilm.org` (external-dns owned until cutover) | Cloudflare DNS, DNS-only CNAME, by hand                |
| Doppler                                     | `plausible` / `stg_ecs` (branch of `stg`)                                     | `plausible` / `prd_ecs` (branch of `prd`)              |
| Argo CD (EKS Deployment, at 0 replicas)     | auto-sync from the `stage` branch                                             | auto-sync from `main`                                  |

Configuration is six keys of the `plausible` Doppler project (`BASE_URL`,
`CLICKHOUSE_DATABASE_URL`, `DATABASE_URL`, `DISABLE_REGISTRATION`,
`SECRET_KEY_BASE`, `TOTP_VAULT_KEY`); `ecs-task` copies them to SSM and injects
them. The ECS task reads a branch config that inherits everything from the
root config and overrides only `CLICKHOUSE_DATABASE_URL` (the Cloud URL; the
root config still names the gone EKS ClickHouse). Changing a value in Doppler
needs a Terraform apply (it rewrites the SSM parameter) and a new deployment
of the service to be picked up.

Plausible CE is single-node, so the Service runs one task and deploys with
`0% / 100%`: the old task stops, then the new one starts and runs migrations.
Expect a short gap on every deploy.

## Prerequisites (once per environment; done for both)

Each step needs the one before it. The NLB bridge to the EKS ClickHouse that
sat between these steps (its security group in this module and the manifest
`infrastructure/kube/plausible-analytics/clickhouse-ecs-bridge.yaml`) was
removed once both environments were on Cloud; see the git history for it.

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

2. **Point the branch config at the event store.** In `stg_ecs`, override
   `CLICKHOUSE_DATABASE_URL` with the Cloud URL
   (`https://plausible:<password>@<host>:8443/plausible_events_db`, see
   "Moving the events to ClickHouse Cloud").

3. **Prod only: certificate.** The Terraform apply requests an ACM certificate
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
# a test pageview for a stage site; it lands in events_v2 on ClickHouse Cloud
curl -s -X POST https://plausible.stage.central.jesusfilm.org/api/event \
  -H 'Content-Type: application/json' -H 'User-Agent: smoke' \
  -d '{"name":"pageview","url":"https://example.test/smoke","domain":"<a stage site domain>"}'
```

The task log (Datadog, `service:plausible`) should show `createdb` and
`migrate` with nothing to do, then the server booting. Dashboard login on this
hostname may be refused by Phoenix's origin check because `BASE_URL` names the
real hostname; check the dashboard after the DNS cutover instead.

## Stage cutover (done 2026-10-23)

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

**Rollback** was the record back to the NLB name. It is gone: the Ingress is
off and the EKS ClickHouse no longer exists.

## Prod cutover (done 2026-10-26)

1. Confirm the certificate is `ISSUED` (prerequisite 3). Terraform: the
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

**Rollback** was the CNAME back to the NLB name. It is gone, as for stage.

## What to watch (a week on stage, then prod)

- ECS: one task, `ARM64`, no restarts; the ALB target healthy on `/api/health`.
- Datadog logs for the task: ClickHouse or Postgres errors, slow queries.
- Task memory against 4 GiB. Stage's EKS pod leaked memory until killed
  (5.8 GB before it had a limit); find out whether the task does the same
  before prod moves.
- `api-journeys` stats queries and the journeys dashboard.
- Plausible's own jobs (email reports, salt rotation) in the log.

## Moving the events to ClickHouse Cloud (done: stage 2026-10-26, prod 2026-10-27)

The stop/start steps of "the window" are still how to take the service down
for maintenance. The copy itself cannot be repeated: its source is gone.

After the environment's DNS cutover, with the EKS Deployment at 0 (stage:
`replicaCount: 0` in `values-stage.yaml`; prod: the same in `values.yaml`,
which ends the DNS rollback). The target is the environment's ClickHouse Cloud
service (`module.<env>.module.short_links_clickhouse`), which also holds the
short-links `redirects` database. Its HTTPS URL and `default` password are
`SHORT_LINKS_CLICKHOUSE_URL` and `SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD` in
the `core` Doppler project. Plausible gets its own database and users; the
files are in `clickhouse-cloud/`.

The event stores are small (stage 45 MiB on disk, prod about 1.3 GiB), so the
copy is one pass with Plausible stopped. It is pushed from the EKS ClickHouse
pod with `remoteSecure()` to the native TLS port, 9440.

**Before the window**, with Plausible running:

1. As `default` on Cloud (SQL console, or `clickhouse client --secure --port 9440`):
   run `clickhouse-cloud/schema.sql`, then `clickhouse-cloud/users.sql` with two
   new passwords.
2. With kubectl on `jfp-eks-<env>`:

   ```bash
   CLICKHOUSE_CLOUD_HOST=<host> CLICKHOUSE_CLOUD_PASSWORD=<migrator password> \
     infrastructure/modules/plausible/clickhouse-cloud/copy-to-cloud.sh <env> check
   ```

   It proves the push route, that every table exists on Cloud with the same
   columns in the same order, and that Cloud is empty. An idled stage service
   can time out the first attempt: rerun.

3. Have the URL ready: `https://plausible:<plausible password>@<host>:8443/plausible_events_db`.
   Port 8443, not the NLB URL's 8123: Cloud drops other ports silently, and
   the task then dies at startup with `Ch.Connection ... failed to connect:
** (Mint.TransportError) timeout` (prod lost 40 minutes to this).

**The window** (Plausible is down: tracking events sent meanwhile are lost,
and `api-journeys` stats fail):

1. Stop the service. Its autoscaling floor is 1, so lower that too, or it
   starts a task again:

   ```bash
   svc=plausible-<env>-service cluster=jfp-ecs-cluster-<env>
   aws application-autoscaling register-scalable-target --service-namespace ecs \
     --scalable-dimension ecs:service:DesiredCount --resource-id "service/$cluster/$svc" \
     --min-capacity 0 --max-capacity 0
   aws ecs update-service --cluster "$cluster" --service "$svc" --desired-count 0
   aws ecs wait services-stable --cluster "$cluster" --services "$svc"
   ```

   The task flushes its write buffer on shutdown.

2. Copy: the same command with `copy`. It refuses while any Plausible runs,
   compares merge-independent numbers per partition after each slice, and
   prints a whole-table comparison at the end. It is rerunnable; a slice that
   is partly on Cloud stops it, with the `DELETE` to run first.
3. In the `<cfg>_ecs` Doppler config, set `CLICKHOUSE_DATABASE_URL` to the
   Cloud URL.
4. `tofu apply -target=module.<env>.module.plausible`. It rewrites the SSM
   parameter and puts the autoscaling floor and desired count back to 1, so the
   new task starts on Cloud. Its log should show the migrations with nothing
   to do.
5. Verify: `/api/health`; a test pageview reaches `events_v2` on Cloud; a
   dashboard over a long range shows the same numbers as before; journey
   stats in Journeys admin.
6. As `default`: `DROP USER migrator`.

**Rollback** was `CLICKHOUSE_DATABASE_URL` back to the NLB value and the same
apply. It went with the EKS ClickHouse.

### Retiring the EKS ClickHouse (done for both)

Per environment, once Plausible ran on Cloud. Order mattered:

1. A final snapshot of the data volume (the PV behind
   `plausible-analytics-clickhouse-data-plausible-analytics-clickhouse-0`),
   tagged `DeleteAfter`. The replica's volume holds no Plausible data, only
   its own system logs. Stage: `snap-016b2925ce7836226`; prod:
   `snap-0decfd85f117e31a6`.
2. Remove the environment's `module "plausible_clickhouse_snapshots"` and
   apply it (`tofu apply -target=module.<env>.module.plausible_clickhouse_snapshots`)
   **while the volumes still exist**: the module looks them up, so a
   still-configured module with deleted volumes fails every plan for the
   environment. The DLM snapshots it took stay until deleted by hand.
3. Chart: `plausible-analytics.clickhouse.enabled: false` in the environment's
   values file. The StorageClass, VolumeSnapshotClass and VolumeSnapshot
   templates follow the same flag. Argo CD prunes the StatefulSets and those
   objects; the PVCs, the PVs (`Retain`) and the VolumeSnapshotContents
   (`Retain`) stay.
4. `kubectl delete svc plausible-clickhouse-ecs` (the NLB).
5. Delete the PVCs, then the PVs, then the EBS volumes; then the
   VolumeSnapshotContents and the EBS snapshots of these volumes, keeping the
   final one.
6. With both environments done, the NLB's security group
   (`eks-clickhouse.tf` in this module) and the bridge manifest were removed
   from the configuration, and the groups destroyed with a targeted apply per
   environment (2026-10-28).

EKS now runs nothing of its own; its teardown is a separate plan.

## Upgrading Plausible

Bump `plausible_version` (default in `variables.tf`, or per environment in the
module call). Read the release notes for ClickHouse-side requirements; the
service deploys 0/100 so the migration runs exactly once.
