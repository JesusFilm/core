data "aws_route53_zone" "jesusfilm_org" {
  name = "jesusfilm.org"
}

data "aws_acm_certificate" "jesusfilm_org" {
  domain      = "jesusfilm.org"
  most_recent = true
}

data "aws_ecr_repository" "main" {
  name = "jfp-${local.identifier}"
}

resource "aws_ecs_task_definition" "main" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  family                   = "graphql"
  # execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  # task_role_arn            = aws_iam_role.ecs_task_role.arn
  container_definitions = jsonencode([{
   name        = "${local.identifier}-${local.env}"
   image       = "${data.aws_ecr_repository.main.name}:${local.env}"
   essential   = true
   environment = local.environment
   portMappings = [{
     protocol      = "tcp"
     containerPort = "443"
     hostPort      = local.port
   }]
}])
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

data "aws_subnets" "prod_public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  tags = {
    env  = "prod"
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
  subnets = data.aws_subnets.prod_public.ids
  # access_logs {
  #   bucket  = "cru-alb-logs"
  #   prefix  = "${local.identifier}/${local.environment}"
  #   enabled = "true"
  # }
  tags = local.tags
}

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
  certificate_arn   = data.aws_acm_certificate.jesusfilm_org.arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}

resource "aws_route53_record" "api" {
  name    = local.public_url
  type    = "CNAME"
  ttl     = 300
  zone_id = data.aws_route53_zone.jesusfilm_org.zone_id
  records = [aws_lb.application_load_balancer.dns_name]
}
