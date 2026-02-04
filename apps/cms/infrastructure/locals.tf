locals {
  port = 1337
  environment_variables = [
    "ADMIN_JWT_SECRET",
    "API_TOKEN_SALT",
    "APP_KEYS",
    "ENCRYPTION_KEY",
    "JWT_SECRET",
    "MUX_ACCESS_TOKEN_ID",
    "MUX_PLAYBACK_SIGNING_ID",
    "MUX_PLAYBACK_SIGNING_SECRET",
    "MUX_SECRET_KEY",
    "MUX_WEBHOOK_SIGNING_SECRET",
    "PG_DATABASE_URL_CMS",
    "PG_DATABASE_URL_MEDIA",
    "PG_DATABASE_URL_LANGUAGES",
    "TRANSFER_TOKEN_SALT"
  ]
  service_config = {
    name           = "cms"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = var.env == "stage" ? 1 : 1
    zone_id        = var.ecs_config.zone_id
    alb = {
      arn      = var.ecs_config.alb.arn
      dns_name = var.ecs_config.alb.dns_name
    }
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port                  = local.port
      health_check_matcher  = "204"
    })
    auto_scaling = {
      max_capacity = var.env == "stage" ? 1 : 4
      min_capacity = var.env == "stage" ? 1 : 1
      cpu = {
        target_value = 75
      }
      memory = {
        target_value = 75
      }
    }
  }
}

