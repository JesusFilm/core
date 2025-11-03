locals {
  port = 4000
  environment_variables = [
    "APOLLO_GRAPH_REF",
    "APOLLO_KEY",
    "GOOGLE_APPLICATION_JSON",
    "HIVE_CDN_ENDPOINT",
    "HIVE_CDN_KEY",
    "HIVE_REGISTRY_TOKEN",
    "GATEWAY_HMAC_SECRET"
  ]
  service_config = {
    name           = "api-gateway"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 4096
    desired_count  = 2
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port                             = local.port
      health_check_interval            = 5
      health_check_timeout             = 3
      health_check_healthy_threshold   = 2
      health_check_unhealthy_threshold = 2
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
