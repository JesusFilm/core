locals {
  service_config = {
    name           = "api-journeys"
    is_public      = false
    container_port = 4001
    host_port      = 4001
    cpu            = 256
    memory         = 512
    desired_count  = 1
    image_tag      = var.image_tag
    alb_target_group = {
      port              = 4001
      protocol          = "HTTP"
      path_pattern      = ["/*"]
      health_check_path = "/.well-known/apollo/server-health"
      priority          = 1
    }
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
