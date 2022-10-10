locals {
  service_config = {
    name           = "api-gateway"
    is_public      = true
    container_port = 4000
    host_port      = 4000
    cpu            = 512
    memory         = 1024
    desired_count  = 1
    image_tag      = var.ecs_config.image_tag
    alb_dns_name   = var.ecs_config.alb_dns_name
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = 4000
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
