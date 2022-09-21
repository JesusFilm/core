resource "aws_lb" "application_load_balancer" {
  name = "${local.identifier}-${local.environment}-alb"
  security_groups = [
    data.aws_security_group.default_load_balancer.id,
    aws_security_group.load_balancer.id,
  ]
  subnets = data.aws_subnets.main_public.ids
  access_logs {
    bucket  = "jfp-alb-logs"
    prefix  = "${local.identifier}/${local.environment}"
    enabled = "true"
  }
  tags = local.tags
}

resource "aws_lb_target_group" "target_group" {
  name        = "${local.identifier}-${local.environment}"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.main.id
  target_type = "ip" # ip required for Fargate
  health_check {
    enabled             = true
    protocol            = "HTTP"
    path                = "/monitors/lb"
    port                = "traffic-port"
    matcher             = "200"
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
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