locals {
  service_config = {
    name           = "api-journeys"
    is_public      = false
    container_port = 4001
    host_port      = 4001
    cpu            = 512
    memory         = 1024
    desired_count  = 1
    image_tag      = var.ecs_config.image_tag
    alb_dns_name   = var.ecs_config.alb_dns_name
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = 4001
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
