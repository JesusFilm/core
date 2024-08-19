locals {
  port = 4004
  environment_variables = [
    "ALGOLIA_APPLICATION_ID",
    "ALGOLIA_API_KEY",
    "ALGOLIA_INDEX",
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "BIG_QUERY_APPLICATION_JSON",
    "CROWDIN_API_KEY",
    "GATEWAY_URL",
    "PG_DATABASE_URL_VIDEOS",
    "REDIS_URL"
  ]
  service_config = {
    name           = "api-videos"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 4096
    desired_count  = 1
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    auto_scaling = {
      max_capacity = 2
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
