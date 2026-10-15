# Plausible Analytics on ECS

[Plausible Community Edition](https://github.com/plausible/community-edition)
as an ECS Fargate Service on ARM64, from the published image, behind the
public ALB. Plan: `docs/plans/2026-10-14-002-feat-plausible-on-ecs-graviton-plan.md`.
Its PostgreSQL is in the Core Database; its ClickHouse is the shared
ClickHouse Cloud service (moved there by plan `2026-10-14-001`, runbook in
`infrastructure/kube/plausible-analytics/README.md` until that chart is gone).

|                                             | stage                                                                         | prod                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hostname                                    | `analytics.stage.central.jesusfilm.org`                                       | `analytics.jesusfilm.org`                              |
| Smoke-test hostname (module-created record) | `plausible.stage.central.jesusfilm.org`                                       | `plausible.central.jesusfilm.org`                      |
| Certificate                                 | the `*.stage.central.jesusfilm.org` wildcard                                  | ACM `analytics.jesusfilm.org`, validated in Cloudflare |
| DNS for the hostname                        | Route53 zone `stage.central.jesusfilm.org` (external-dns owned until cutover) | Cloudflare DNS, DNS-only CNAME, by hand                |
| Doppler                                     | `plausible` / `stg`                                                           | `plausible` / `prd`                                    |

Configuration is the six keys of the `plausible` Doppler project (`BASE_URL`,
`CLICKHOUSE_DATABASE_URL`, `DATABASE_URL`, `DISABLE_REGISTRATION`,
`SECRET_KEY_BASE`, `TOTP_VAULT_KEY`); `ecs-task` copies them to SSM and injects
them. Changing one in Doppler needs a Terraform apply (it rewrites the SSM
parameter) and a new deployment of the service to be picked up.

Plausible CE is single-node, so the Service runs one task and deploys with
`0% / 100%`: the old task stops, then the new one starts and runs migrations.
Expect a short gap on every deploy.

## Prerequisites (once per environment)

1. **Doppler token in SSM**, like every other Service. Create a read-only
   service token on the `plausible` project for the config, then:

   ```bash
   aws ssm put-parameter --type SecureString --overwrite \
     --name /terraform/prd/DOPPLER_PLAUSIBLE_STAGE_TOKEN --value 'dp.st....'
   aws ssm put-parameter --type SecureString --overwrite \
     --name /terraform/prd/DOPPLER_PLAUSIBLE_PROD_TOKEN --value 'dp.st....'
   ```

   Without it the environment's plan fails on the `data.aws_ssm_parameter`.

2. **ClickHouse on Cloud first.** An ECS task cannot reach the in-cluster
   ClickHouse Service. Apply this module for an environment only after that
   environment's `CLICKHOUSE_DATABASE_URL` points at ClickHouse Cloud, or the
   task crash-loops until it does.

3. **Prod certificate.** The Terraform apply requests an ACM certificate for
   `analytics.jesusfilm.org`. Read its validation record and add it in
   Cloudflare (DNS-only):

   ```bash
   aws acm list-certificates --query "CertificateSummaryList[?DomainName=='analytics.jesusfilm.org'].CertificateArn" --output text
   aws acm describe-certificate --certificate-arn <arn> \
     --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
   ```

   `aws acm describe-certificate ... --query Certificate.Status` reads
   `ISSUED` a few minutes after the CNAME exists. The attach-to-listener step
   is in the prod cutover below.

## After the first apply: smoke test

On the module's own hostname, which the wildcard certificate covers and which
nothing else uses:

```bash
curl -s https://plausible.stage.central.jesusfilm.org/api/health
# a test pageview for a stage site; then look for it in ClickHouse Cloud events_v2
curl -s -X POST https://plausible.stage.central.jesusfilm.org/api/event \
  -H 'Content-Type: application/json' -H 'User-Agent: smoke' \
  -d '{"name":"pageview","url":"https://example.test/smoke","domain":"<a stage site domain>"}'
```

The task log (Datadog, `service:plausible`) should show `createdb` and
`migrate` with nothing to do, then the server booting. Dashboard login on this
hostname may be refused by Phoenix's origin check because `BASE_URL` names the
real hostname; check the dashboard after the DNS cutover instead.

## Stage cutover

`analytics.stage.central.jesusfilm.org` is a CNAME to the EKS ingress,
created and owned by external-dns (TXT registry, `upsert-only`). external-dns
rewrites any record it still desires, so the ingress has to go first.

1. In `infrastructure/kube/plausible-analytics/values-stage.yaml` set
   `ingress.enabled: false`; merge; let Argo sync (stage tracks the `stage`
   branch). Watch external-dns for one reconcile: it must log nothing about
   the record (under `upsert-only` it does not delete it).
2. Terraform: the `aws_route53_record` for `analytics` in the stage zone,
   CNAME to the stage public ALB, `allow_overwrite = true` (plan U5). Apply.
3. Delete the orphaned registry records `external-dns-analytics.stage.central.jesusfilm.org`
   (TXT, and the `cname-` prefixed one if present) from the zone.
4. Verify: dashboard login, a stats query through the stage gateway, realtime
   ingest from a stage journey.
5. Leave the EKS Deployment running but idle for the soak; it is the rollback.

**Rollback:** set the record back to the ingress NLB name
(`k8s-ingressn-ingressn-...elb.us-east-2.amazonaws.com`, the current value, note
it before step 2), either by reverting the Terraform record or in the console.
Rehearse once.

## Prod cutover

1. Confirm the certificate is `ISSUED` (prerequisite 3). Terraform: the
   `aws_lb_listener_certificate` attaching it to the public listener (plan U6).
   Apply.
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
5. In `infrastructure/kube/plausible-analytics/values.yaml` set
   `ingress.enabled: false`; merge; `argocd app sync plausible-analytics` on
   prod. Leave the Deployment for the rollback window.

**Rollback:** the CNAME back to the NLB name. Nothing else changes.

## What to watch (a week on stage, then prod)

- ECS: one task, `ARM64`, no restarts; the ALB target healthy on `/api/health`.
- Datadog logs for the task: ClickHouse or Postgres errors, slow queries.
- Task memory against the 2 GiB; adjust `locals.tf` if it sits above 70%.
- `api-journeys` stats queries and the journeys dashboard.
- Plausible's own jobs (email reports, salt rotation) in the log.

## Removing Plausible from EKS

After the prod rollback window (plan U7): delete the two Argo CD
`plausible-analytics` Applications (prune removes the Deployment, Service,
Ingress and TLS secret), the `infrastructure/kube/plausible-analytics` chart
(move the ClickHouse runbook here first), the `plausible` DopplerSecret in
`infrastructure/kube/doppler/`, and the api-analytics deploy copies. With
Plausible gone the Platform Cluster runs only its own support tooling; its
teardown is a separate plan.

## Upgrading Plausible

Bump `plausible_version` (default in `variables.tf`, or per environment in the
module call). Read the release notes for ClickHouse-side requirements; the
service deploys 0/100 so the migration runs exactly once.
