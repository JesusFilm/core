data "aws_route53_zone" "central_jesusfilm_org" {
  name = "central.jesusfilm.org"
}

data "aws_acm_certificate" "central_jesusfilm_org" {
  domain      = "*.central.jesusfilm.org"
  most_recent = true
}

data "aws_ecr_repository" "main" {
  name = "jfp-${local.identifier}"
}

module "api_gateway" {
  source = "../../../resources/modules/aws/ecs/app"

  identifier           = local.identifier
  env                  = local.env
  contact_email        = local.tags.owner
  zone_id              = data.aws_route53_zone.central_jesusfilm_org.zone_id
  extra_tags           = local.tags
  # developers           = local.developers
  load_balancer_arn    = data.terraform_remote_state.main_alb.outputs.load_balancer_arn
  create_target_group  = false
  create_listener_rule = false
  # target_group_arn     = aws_lb_target_group.atlantis.arn
  maintenance_db_index = -1

  # task_policy_override_json   = data.aws_iam_policy_document.atlantis_write_access.json
  # additional_task_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]

  task_names = ["app"]
  services = [{
    name               = "app"
    launch_type        = "FARGATE"
    desired_count      = "1"
    log_dd_source      = "node"
    memory             = "256"
    memory_reservation = "512"
    cpu                = "256"
    container_port     = "443"
    host_port          = "4000"
    network_mode       = "awsvpc"
    network_configuration = jsonencode({
      subnets         = data.aws_subnets.main_public.ids
      # security_groups = [module.atlantis_sg.security_group_id]
    })
  }]
}

# resource "aws_ecs_task_definition" "main" {
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = 256
#   memory                   = 512
#   family                   = "graphql"
#   execution_role_arn       = aws_iam_role.task_execution_role.arn
#   task_role_arn            = aws_iam_role.task_role.arn
#   container_definitions = jsonencode([{
#    name        = "${local.identifier}-${local.env}"
#    image       = "${data.aws_ecr_repository.main.repository_url}/${data.aws_ecr_repository.main.name}:${local.env}"
#    essential   = true
#    environment = [{
#     name = "environment"
#     value= local.environment
#    }]
#    portMappings = [{
#      protocol      = "tcp"
#      containerPort = local.port
#      hostPort      = local.port
#    }]
# }])
# }

# resource "aws_iam_role" "task_execution_role" {
#   name               = "${local.name}-TaskExecutionRole"
#   description        = "Task Execution Role for ${var.identifier} (${var.env})."
#   assume_role_policy = data.aws_iam_policy_document.assume_task_execution_document.json
#   tags               = local.tags
# }

# resource "aws_iam_role" "task_role" {
#   name               = "${local.name}-TaskRole"
#   description        = "Task Role for ${var.identifier} (${var.env})."
#   assume_role_policy = data.aws_iam_policy_document.assume_task_document.json
#   tags               = local.tags
# }

resource "aws_lb" "network_load_balancer" {
  name                             = "${local.identifier}-${local.environment}-nlb"
  load_balancer_type               = "network"
  subnets                          = data.aws_subnets.main_public.ids
  enable_cross_zone_load_balancing = true
  access_logs {
    bucket  = "jfp-alb-logs"
    prefix  = "${local.identifier}/${local.env}"
    enabled = true
  }
  tags = local.tags
}


data "aws_vpc" "main" {
  tags = { Name = "Main VPC" }
}

data "aws_subnets" "main_public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  tags = {
    env  = "main"
    type = "public"
  }
}

// Lookup Default ALB security group
data "aws_security_group" "default_load_balancer" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    function = "load-balancer"
    type     = "ingress"
    network  = "public"
  }
}

// Lookup ECS security group
data "aws_security_group" "ecs" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    function = "ecs"
    env      = local.env
  }
}

// Create Load Balancer Security group with egress to ECS on ephemeral ports
resource "aws_security_group" "load_balancer" {
  name        = "${local.identifier}-${local.env}-alb"
  description = "${local.identifier} (${local.env}) ALB"
  vpc_id      = data.aws_vpc.main.id
  tags = merge(local.tags, {
    Name = "${local.identifier}-${local.env}-alb"
  })

  egress {
    from_port       = 49153
    protocol        = "tcp"
    to_port         = 65535
    security_groups = [data.aws_security_group.ecs.id]
    description     = data.aws_security_group.ecs.description
  }
}

// Allow ingress on ECS from Load Balancer using ephemeral ports.
resource "aws_security_group_rule" "ecs_ingress" {
  security_group_id        = data.aws_security_group.ecs.id
  type                     = "ingress"
  description              = aws_security_group.load_balancer.description
  from_port                = 49153
  protocol                 = "tcp"
  to_port                  = 65535
  source_security_group_id = aws_security_group.load_balancer.id
}

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

# TODO: Health check?
resource "aws_lb_target_group" "target_group" {
  name     = "${local.identifier}-${local.environment}"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.main.id
  # health_check {
  #   enabled             = true
  #   protocol            = "HTTP"
  #   path                = "/monitors/lb"
  #   port                = "traffic-port"
  #   matcher             = "200"
  #   healthy_threshold   = 2
  #   unhealthy_threshold = 2
  # }
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

resource "aws_route53_record" "api" {
  name    = local.public_url
  type    = "CNAME"
  ttl     = 300
  zone_id = data.aws_route53_zone.central_jesusfilm_org.zone_id
  records = [aws_lb.application_load_balancer.dns_name]
}
