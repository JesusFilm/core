locals {
  alb_target_group = {
    port              = 80
    protocol          = "HTTP"
    path_pattern      = ["/*"]
    health_check_path = "/.well-known/apollo/server-health"
    health_check_port = 80
    priority          = 1
  }
}
