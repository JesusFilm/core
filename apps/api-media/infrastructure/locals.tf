locals {
  port = 4005
  environment_variables = [
    "PG_DATABASE_URL_MEDIA",
    "CLOUDFLARE_IMAGES_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_STREAM_TOKEN",
    "GOOGLE_APPLICATION_JSON",
    "UNSPLASH_ACCESS_KEY",
    "SEGMIND_API_KEY"
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
