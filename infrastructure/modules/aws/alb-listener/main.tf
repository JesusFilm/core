resource "aws_alb_listener" "alb_listener" {
  load_balancer_arn = var.alb_arn
  port              = var.port
  protocol          = var.protocol
  certificate_arn   = var.protocol == "HTTPS" ? var.certificate_arn : null

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "No routes defined"
      status_code  = "200"
    }
  }
}
