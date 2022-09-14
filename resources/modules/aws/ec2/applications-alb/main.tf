resource "aws_lb" "this" {
  name            = "${var.identifier}-${var.env}"
  internal        = var.internal
  security_groups = var.security_groups
  subnets         = var.subnets
  idle_timeout    = var.idle_timeout

  access_logs {
    enabled = var.log_bucket == "" ? false : true
    bucket  = var.log_bucket
    prefix  = "${var.identifier}/${var.env}"
  }

  tags = merge({
    name       = "${var.identifier}-${var.env}"
    env        = var.env
    # Owner      = "devops-engineering-team@cru.org"
    managed_by = "terraform"
  }, var.extra_tags)
}

resource "aws_lb_listener" "http" {
  count             = var.add_http_listener ? 1 : 0
  load_balancer_arn = aws_lb.this.arn
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
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificates_arns[0]
  default_action {
    type = "fixed-response"
    fixed_response {
      status_code  = "404"
      content_type = "text/plain"
      message_body = "Not Found"
    }
  }
}

resource "aws_lb_listener_certificate" "central_jesusfilm_org" {
  count           = length(var.certificates_arns) - 1
  listener_arn    = aws_lb_listener.https.arn
  certificate_arn = var.certificates_arns[count.index + 1]
}
