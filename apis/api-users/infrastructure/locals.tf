locals {
  port = 4002
  environment_variables = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "EXAMPLE_EMAIL_TOKEN",
    "GATEWAY_HMAC_SECRET",
    "GOOGLE_APPLICATION_JSON",
    "INTEROP_TOKEN",
    "JESUS_FILM_PROJECT_VERIFY_URL",
    "JOURNEYS_ADMIN_URL",
    "NAT_ADDRESSES",
    "PG_DATABASE_URL_USERS",
    "REDIS_PORT",
    "REDIS_URL",
    "SMTP_URL"
  ]
  service_config = {
    name                              = "api-users"
    is_public                         = false
    container_port                    = local.port
    host_port                         = local.port
    cpu                               = 512
    memory                            = 1024
    desired_count                     = var.env == "stage" ? 1 : 1
    zone_id                           = var.ecs_config.zone_id
    health_check_grace_period_seconds = 60
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    auto_scaling = {
      max_capacity = var.env == "stage" ? 1 : 2
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
