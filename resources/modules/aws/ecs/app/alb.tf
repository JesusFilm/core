resource "aws_lb" "application_load_balancer" {
  name = "${local.name}-alb"
  security_groups = [    
    aws_security_group.load_balancer.id,
  ]
  subnets = data.aws_subnets.apps_public.ids
  access_logs {
    bucket  = "jfp-alb-logs"
    prefix  = "${var.identifier}/${var.env}"
    enabled = "true"
  }
  tags = local.tags
}

resource "aws_lb_target_group" "target_group" {
  name        = local.name
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.main.id
  target_type = "ip" # ip required for Fargate
  tags = local.tags
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.central_jesusfilm_org.arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}