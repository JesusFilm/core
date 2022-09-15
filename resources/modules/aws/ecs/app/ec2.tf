# Lookup load balancer by ARN if provided
data "aws_lb" "shared_alb" {
  count = var.load_balancer_arn == "" ? 0 : 1
  arn   = var.load_balancer_arn
}

# Otherwise, lookup default `ecs_config` load balancer name
data "aws_lb" "alb" {
  # Don't lookup if `load_balancer_arn` is present
  count = var.load_balancer_arn == "" ? 1 : 0
  name  = replace("${var.identifier}-${local.environment}-alb", "_", "-")
}

resource "aws_lb_target_group" "target_group" {
  count = var.create_target_group ? 1 : 0

  name                 = var.target_group_name != "" ? var.target_group_name : replace(local.name, "_", "-")
  vpc_id               = var.load_balancer_arn == "" ? data.aws_lb.alb[0].vpc_id : data.aws_lb.shared_alb[0].vpc_id
  port                 = var.target_group_port
  protocol             = var.target_group_protocol
  deregistration_delay = var.target_group_deregistration_delay
  target_type          = var.target_group_target_type
  health_check {
    enabled  = true
    protocol = var.target_group_protocol
    path     = var.target_group_healthcheck_path
    port     = "traffic-port"
    matcher  = "200"
  }

  stickiness {
    enabled = var.target_group_stickiness_enabled
    type    = "lb_cookie"
  }

  tags = local.tags
}

output "target_group_arn" {
  description = " The ARN of the Target Group. Undefined if `target_group_arns` is set."
  value       = var.create_target_group ? aws_lb_target_group.target_group[0].arn : var.target_group_arn
}

data "aws_lb_listener" "listener" {
  # Only lookup listener_arn if one wasn't passed in
  count             = var.listener_arn == "" ? 1 : 0
  load_balancer_arn = var.load_balancer_arn == "" ? data.aws_lb.alb[0].arn : data.aws_lb.shared_alb[0].arn
  port              = 443
}

resource "aws_lb_listener_rule" "rule" {
  count = var.create_listener_rule ? 1 : 0

  listener_arn = var.listener_arn == "" ? data.aws_lb_listener.listener[0].arn : var.listener_arn
  condition {
    host_header {
      values = compact(concat([local.dns_name], var.listener_rule_hostnames))
    }
  }
  action {
    type             = "forward"
    target_group_arn = var.create_target_group ? aws_lb_target_group.target_group[0].arn : var.target_group_arn
  }
}

output "listener_rule_arn" {
  description = "The ARN of the rule."
  value       = var.create_listener_rule ? aws_lb_listener_rule.rule[0].arn : ""
}

resource "aws_lb_listener_certificate" "cert" {
  for_each = toset(var.certificates)

  listener_arn    = var.listener_arn == "" ? data.aws_lb_listener.listener[0].arn : var.listener_arn
  certificate_arn = each.key
}
