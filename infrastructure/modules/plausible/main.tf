# Plausible Analytics as an ECS Fargate Service on ARM64 (Graviton), from the
# upstream community-edition image, behind the environment's public ALB. It
# replaces the Helm deployment on the EKS Platform Cluster; the cutover per
# environment and the rollback are in README.md. Plan:
# docs/plans/2026-10-14-002-feat-plausible-on-ecs-graviton-plan.md.
#
# Its two databases are elsewhere, both read from Doppler: PostgreSQL in the
# Core Database (Aurora, DATABASE_URL) and the event store (CLICKHOUSE_DATABASE_URL)
# in the environment's ClickHouse Cloud service, database plausible_events_db
# (clickhouse-cloud/ has its schema and users; README.md has the move from EKS).

module "ecs-task" {
  source                = "../aws/ecs-task"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  alb_listener_arn      = var.alb_listener_arn
  alb_dns_name          = var.alb_dns_name
  host_names            = var.host_names
  dd_source             = "plausible"

  # Not built in this repo: the published image, pinned by tag. The module's
  # ECR repository (jfp-plausible-<env>) is created anyway and stays empty.
  image = "ghcr.io/plausible/community-edition:${var.plausible_version}"

  # What the Helm chart's init container did: create the ClickHouse database
  # if missing, run both repos' migrations, then serve. Against the existing
  # EKS database, and later the prepared Cloud tenant, the first two are no-ops.
  command = ["sh", "-c", "/entrypoint.sh db createdb && /entrypoint.sh db migrate && /entrypoint.sh run"]

  cpu_architecture = "ARM64"

  # One writer and one migrator at a time: the old task stops before the new
  # one starts. A few seconds of downtime per deploy, which is rare for a
  # pinned third-party image.
  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100
}
