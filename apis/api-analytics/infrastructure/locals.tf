locals {
  port = 4008
  environment_variables = [
    "PG_DATABASE_URL_ANALYTICS",
    "PRISMA_LOCATION_ANALYTICS",
    "PLAUSIBLE_SECRET_KEY_BASE",
    "GATEWAY_HMAC_SECRET"
  ]
  service_config = {
    name           = "api-analytics"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    auto_scaling = {
      max_capacity = 4
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
