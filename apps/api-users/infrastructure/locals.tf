locals {
  port = 4002
  environment_variables = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "EXAMPLE_EMAIL_TOKEN",
    "GOOGLE_APPLICATION_JSON",
    "INTEROP_TOKEN",
    "JOURNEYS_ADMIN_URL",
    "PG_DATABASE_URL_USERS",
    "REDIS_URL"
  ]
  service_config = {
    name           = "api-users"
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
