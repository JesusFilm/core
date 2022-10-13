resource "aws_alb" "alb" {
  name               = var.name
  internal           = var.internal
  load_balancer_type = "application"
  subnets            = var.subnets
  security_groups    = var.security_groups
}

resource "aws_alb_listener" "alb_listener" {
  for_each          = var.listeners
  load_balancer_arn = aws_alb.alb.id
  port              = each.value["listener_port"]
  protocol          = each.value["listener_protocol"]
  certificate_arn   = each.value.listener_protocol == "HTTPS" ? var.certificate_arn : null

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "No routes defined"
      status_code  = "200"
    }
  }
}
