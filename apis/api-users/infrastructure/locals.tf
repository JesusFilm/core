locals {
  port = 4002
  environment_variables = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "EXAMPLE_EMAIL_TOKEN",
    "GATEWAY_HMAC_SECRET",
    "GOOGLE_APPLICATION_JSON",
    "INTEROP_TOKEN",
    "JOURNEYS_ADMIN_URL",
    "NAT_ADDRESSES",
    "PG_DATABASE_URL_USERS",
    "REDIS_PORT",
    "REDIS_URL",
    "SMTP_URL"
  ]
  service_config = {
    name           = "api-users"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 512
    memory         = 1024
    desired_count  = 1
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port                             = local.port
      health_check_interval            = 5
      health_check_timeout             = 3
      health_check_healthy_threshold   = 2
      health_check_unhealthy_threshold = 2
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
