# Plausible Analytics on ECS

[Plausible Community Edition](https://github.com/plausible/community-edition)
as an ECS Fargate Service on ARM64, from the published image, behind the
public ALB. Plan: `docs/plans/2026-10-14-002-feat-plausible-on-ecs-graviton-plan.md`.
Its PostgreSQL is in the Core Database.

Its events are in the environment's ClickHouse Cloud service
(`module.<env>.module.short_links_clickhouse`), database `plausible_events_db`,
as the user `plausible` (`clickhouse-cloud/users.sql`).

|                                             | stage                                        | prod                                                   |
| ------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Hostname                                    | `analytics.stage.central.jesusfilm.org`      | `analytics.jesusfilm.org`                              |
| Smoke-test hostname (module-created record) | `plausible.stage.central.jesusfilm.org`      | `plausible.central.jesusfilm.org`                      |
| Certificate                                 | the `*.stage.central.jesusfilm.org` wildcard | ACM `analytics.jesusfilm.org`, validated in Cloudflare |
| DNS for the hostname                        | Route53 zone `stage.central.jesusfilm.org`   | Cloudflare DNS, DNS-only CNAME, by hand                |
| Doppler                                     | `plausible` / `stg_ecs` (branch of `stg`)    | `plausible` / `prd_ecs` (branch of `prd`)              |

Configuration is six keys of the `plausible` Doppler project (`BASE_URL`,
`CLICKHOUSE_DATABASE_URL`, `DATABASE_URL`, `DISABLE_REGISTRATION`,
`SECRET_KEY_BASE`, `TOTP_VAULT_KEY`); `ecs-task` copies them to SSM and injects
them. The ECS task reads a branch config that inherits everything from the
root config and overrides only `CLICKHOUSE_DATABASE_URL` (the Cloud URL).
Changing a value in Doppler needs a Terraform apply (it rewrites the SSM
parameter) and a new deployment of the service to be picked up.

Plausible CE is single-node, so the Service runs one task and deploys with
`0% / 100%`: the old task stops, then the new one starts and runs migrations.
Expect a short gap on every deploy.

## Prerequisites (once per environment; done for both)

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

2. **Prepare the event store** ("Preparing the event store" below) and, in
   the branch config, set `CLICKHOUSE_DATABASE_URL` to its URL:
   `https://plausible:<password>@<host>:8443/plausible_events_db`. Port 8443:
   Cloud drops other ports silently, and the task then dies at startup with
   `Ch.Connection ... failed to connect: ** (Mint.TransportError) timeout`.

3. **Prod only: certificate.** The Terraform apply requests an ACM certificate
   for `analytics.jesusfilm.org`. Read its validation record and add it in
   Cloudflare (DNS-only):

   ```bash
   aws acm list-certificates --query "CertificateSummaryList[?DomainName=='analytics.jesusfilm.org'].CertificateArn" --output text
   aws acm describe-certificate --certificate-arn <arn> \
     --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
   ```

   `aws acm describe-certificate ... --query Certificate.Status` reads
   `ISSUED` a few minutes after the CNAME exists; the
   `aws_lb_listener_certificate` in the prod environment attaches it to the
   public listener, and a pending certificate fails that apply.

Then apply the rest: `tofu apply -target=module.<env>.module.plausible`.

## Preparing the event store

The target is the environment's ClickHouse Cloud service
(`module.<env>.module.short_links_clickhouse`), which also holds the
short-links `redirects` database. Its HTTPS URL and `default` password are
`SHORT_LINKS_CLICKHOUSE_URL` and `SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD` in
the `core` Doppler project. Plausible gets its own database and user.

As `default` (SQL console, or `clickhouse client --secure --port 9440`): run
`clickhouse-cloud/schema.sql`, then `clickhouse-cloud/users.sql` with a new
password. The schema is only a bootstrap; Plausible's own migrations own it
from the first start.

The `plausible` user's settings profile caps one query at 2 GiB and all of
Plausible's queries together at 4 GiB, which is what protects the short-links
tenant on the shared 8 GiB replica, and allows 64 concurrent queries (8 was
exhausted by a single dashboard load).

## Smoke test

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
real hostname; use the real hostname for that.

## Taking the service down for maintenance

Plausible is down for the duration: tracking events sent meanwhile are lost,
and `api-journeys` stats fail.

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

2. Do the work. If it changes a Doppler value, change it in the `<cfg>_ecs`
   config.
3. `tofu apply -target=module.<env>.module.plausible`. It rewrites the SSM
   parameters and puts the autoscaling floor and desired count back to 1, so
   a new task starts.
4. Verify: `/api/health`; a test pageview reaches `events_v2`; a dashboard
   over a long range; journey stats in Journeys admin.

## What to watch

- ECS: one task, `ARM64`, no restarts; the ALB target healthy on `/api/health`.
- Datadog logs for the task: ClickHouse or Postgres errors, slow queries.
  `Ch.Connection ... disconnected: the connection is closed` every few
  minutes is Cloud closing idle connections; the pool reconnects.
- Task memory against 4 GiB (prod about 0.9 GiB, stage about 1.4 GiB).
- `api-journeys` stats queries and the journeys dashboard.
- Plausible's own jobs (email reports, salt rotation) in the log. No mailer is
  configured, so `Failed to send e-mail` at the top of every hour is expected
  until one is.

## Upgrading Plausible

Bump `plausible_version` (default in `variables.tf`, or per environment in the
module call). Read the release notes for ClickHouse-side requirements; the
service deploys 0/100 so the migration runs exactly once.
