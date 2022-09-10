module "ecs_app" {
  source = "git@github.com:CruGlobal/cru-terraform-modules.git//aws/ecs/app?ref=v21.1.0"

  identifier           = local.identifier
  env                  = local.env
  # contact_email        = local.tags.owner
  extra_tags           = local.tags
  load_balancer_arn    = data.aws_lb.network_load_balancer.arn
  create_listener_rule = false
  create_target_group  = false
  target_group_arn     = aws_lb_target_group.redirector.arn
  # developers           = local.developers
  task_names           = ["app"]
  services = [{
    name               = "app"
    memory             = "128"
    memory_reservation = "96"
    desired_count      = "1"
    log_dd_source      = "nginx"
  }]
  notification_recipients = local.notification_recipients
}

resource "aws_lb" "network_load_balancer" {
  name                             = "${local.identifier}-${local.environment}-nlb"
  load_balancer_type               = "network"
  subnets                          = data.aws_subnets.prod_public.ids
  enable_cross_zone_load_balancing = true
  # access_logs {
  #   bucket  = "cru-alb-logs"
  #   prefix  = "${local.identifier}/${local.env}"
  #   enabled = true
  # }
  tags = local.tags
}


data "aws_vpc" "main" {
  tags = { Name = "Main VPC" }
}

resource "aws_lb_target_group" "redirector" {
  name                 = "${local.identifier}-${local.environment}"
  protocol             = "TCP"
  port                 = 80
  vpc_id               = data.aws_vpc.main.id
  deregistration_delay = 30

  health_check {
    matcher  = "200-399"
    path     = "/.ping"
    port     = "traffic-port"
    protocol = "HTTP"
  }
}

resource "aws_lb_listener" "tcp_80" {
  load_balancer_arn = data.aws_lb.wordpress_nlb.arn
  port              = 80
  protocol          = "TCP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.redirector.arn
  }
}
