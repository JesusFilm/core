locals {
  port = 4005
  environment_variables = [
    "PG_DATABASE_URL",
    "CLOUDFLARE_IMAGES_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_STREAM_TOKEN",
    "GOOGLE_APPLICATION_JSON",
    "UNSPLASH_ACCESS_KEY"
  ]
  service_config = {
    name           = "api-media"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 512
    memory         = 1024
    desired_count  = 1
    alb_dns_name   = var.ecs_config.alb_dns_name
    zone_id        = var.ecs_config.zone_id
    alb_listener = merge(var.ecs_config.alb_listener, {
      port = local.port
    })
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
