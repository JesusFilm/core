locals {
  port = 4000
  environment_variables = [
    "APOLLO_GRAPH_REF",
    "APOLLO_KEY",
    "GOOGLE_APPLICATION_JSON",
  ]
  service_config = {
    name           = "api-gateway"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    alb            = var.ecs_config.alb
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    auto_scaling = {
      max_capacity = 4
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
