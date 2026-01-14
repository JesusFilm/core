locals {
  port = 1337
  environment_variables = [
    "ADMIN_JWT_SECRET",
    "API_TOKEN_SALT",
    "APP_KEYS",
    "ENCRYPTION_KEY",
    "MUX_ACCESS_TOKEN_ID",
    "MUX_PLAYBACK_SIGNING_ID",
    "MUX_PLAYBACK_SIGNING_SECRET",
    "MUX_SECRET_KEY",
    "MUX_WEBHOOK_SIGNING_SECRET",
    "PG_DATABASE_URL_CMS",
    "TRANSFER_TOKEN_SALT"
  ]
  service_config = {
    name           = "cms"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 2
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port                             = local.port
      health_check_path                = "/_health"
      health_check_interval            = 30
      health_check_timeout             = 5
      health_check_healthy_threshold   = 2
      health_check_unhealthy_threshold = 3
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

