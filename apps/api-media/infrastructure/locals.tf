locals {
  port = 4005
  environment_variables = [
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "ALGOLIA_APPLICATION_ID",
    "ALGOLIA_API_KEY",
    "ALGOLIA_INDEX",
    "BIG_QUERY_APPLICATION_JSON",
    "CLOUDFLARE_IMAGES_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_STREAM_TOKEN",
    "CROWDIN_API_KEY",
    "GATEWAY_URL",
    "GOOGLE_APPLICATION_JSON",
    "PG_DATABASE_URL_MEDIA",
    "REDIS_PORT",
    "REDIS_URL",
    "SEGMIND_API_KEY",
    "UNSPLASH_ACCESS_KEY",
  ]
  service_config = {
    name           = "api-media"
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
