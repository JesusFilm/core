locals {
  port = 8000

  # Everything Plausible reads, all from the `plausible` Doppler project
  # (`stg` / `prd`). ecs-task copies each one into SSM under
  # /ecs/plausible/<env>/ and injects it as a container secret.
  environment_variables = [
    "BASE_URL",
    "CLICKHOUSE_DATABASE_URL",
    "DATABASE_URL",
    "DISABLE_REGISTRATION",
    "SECRET_KEY_BASE",
    "TOTP_VAULT_KEY"
  ]

  service_config = {
    name                 = "plausible"
    doppler_project_name = "plausible"
    is_public            = true
    container_port       = local.port
    host_port            = local.port
    cpu                  = 1024
    # Prod's EKS pod sits near 0.7-0.9 GiB under a 2 GiB limit. Stage's grew
    # without bound (5.8 GB before that limit, then repeated OOM kills), a
    # leak with no known cause yet. 4 GiB is headroom for prod, not a fix for
    # stage. Revisit with a week of task memory data.
    memory = 4096
    # Plausible CE is single-node: sessions and the ingest buffer live in
    # process memory. One task, no scaling; deploys are serialized in main.tf.
    desired_count = 1
    zone_id       = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    # Migrations run before the server starts (see `command` in main.tf).
    health_check_grace_period_seconds = 120
    auto_scaling = {
      max_capacity = 1
      min_capacity = 1
      cpu = {
        target_value = 75
      }
      memory = {
        target_value = 75
      }
    }
  }
}
