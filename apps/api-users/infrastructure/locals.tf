locals {
  port = 4002
  environment_variables = [
    "GOOGLE_APPLICATION_JSON",
    "PG_DATABASE_URL",
    "PG_DATABASE_URL_USERS",
    "REDIS_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY"
  ]
  service_config = {
    name           = "api-users"
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
