locals {
  port = 4003
  environment_variables = [
    "PG_DATABASE_URL_LANGUAGES",
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "BIG_QUERY_APPLICATION_JSON",
    "REDIS_PORT",
    "REDIS_URL",
    "WESS_API_TOKEN",
    "GATEWAY_HMAC_SECRET"
  ]
  service_config = {
    name           = "api-languages"
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
      max_capacity = 3
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
