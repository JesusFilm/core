locals {
  port = 1337
  environment_variables = [
    "PRIVATE_DATABASE_URL",
    "HOST",
    "PORT",
    "APP_KEYS",
    "API_TOKEN_SALT",
    "ADMIN_JWT_SECRET",
    "JWT_SECRET"
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
      health_check_path                = "/api/health"
      health_check_interval            = 30
      health_check_timeout             = 5
      health_check_healthy_threshold   = 2
      health_check_unhealthy_threshold = 3
    })
    auto_scaling = {
      max_capacity = 4
      min_capacity = 2
      cpu = {
        target_value = 75
      }
      memory = {
        target_value = 75
      }
    }
  }
}

