locals {
  port = 4007
  environment_variables = [
    "BUCKET_ACCESS_KEY",
    "BUCKET_ENDPOINT",
    "BUCKET_NAME",
    "BUCKET_REGION",
    "BUCKET_SECRET_KEY",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_STREAM_TOKEN",
    "GOOGLE_API_KEY",
    "FIREBASE_API_KEY",
    "PG_DATABASE_URL_NEXUS",
    "GOOGLE_APPLICATION_JSON",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "REDIS_HOST"
  ]
  service_config = {
    name           = "api-nexus"
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
