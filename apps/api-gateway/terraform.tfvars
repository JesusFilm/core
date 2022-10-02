microservice_config = {
  name           = "WebApp"
  is_public      = true
  container_port = 80
  host_port      = 80
  cpu            = 256
  memory         = 512
  desired_count  = 1
  alb_target_group = {
    port              = 80
    protocol          = "HTTP"
    path_pattern      = ["/*"]
    health_check_path = "/health"
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
