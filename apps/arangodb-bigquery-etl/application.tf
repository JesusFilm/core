# module "api_gateway" {
#   source = "../../../resources/modules/aws/ecs/app"

#   identifier           = local.identifier
#   env                  = local.env
#   contact_email        = local.tags.owner
#   zone_id              = data.aws_route53_zone.central_jesusfilm_org.zone_id
#   extra_tags           = local.tags
#   # developers           = local.developers
#   load_balancer_arn    = aws_lb.application_load_balancer.arn
#   create_target_group  = false
#   create_listener_rule = false
#   target_group_arn     = aws_lb_target_group.target_group.arn
#   # maintenance_db_index = -1

#   # task_policy_override_json   = data.aws_iam_policy_document.atlantis_write_access.json
#   # additional_task_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]

#   task_names = ["app"]
#   services = [{
#     name               = "app"
#     launch_type        = "FARGATE"
#     desired_count      = "1"
#     # log_dd_source      = "node"
#     # memory             = "512"
#     # memory_reservation = "256"
#     # cpu                = "256"
#     container_port     = "4000"
#     host_port          = "4000"
#     network_mode       = "awsvpc"
    
#     container_definitions = [{
#       image = "${data.aws_ecr_repository.main.repository_url}/${data.aws_ecr_repository.main.name}:${local.env}"
#     }]
#     # network_configuration = jsonencode({
#     #   subnets         = data.aws_subnets.main_public.ids
#     #   # security_groups = [module.atlantis_sg.security_group_id]
#     # })
#   }]
# }
data "aws_caller_identity" "current" {}

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



resource "aws_ecs_service" "main" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cluster                  = local.env
  cpu                      = 256
  memory                   = 512
  desired_count            = 1
  family                   = local.identifier
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  container_definitions = jsonencode([{
   name        = "${local.identifier}-${local.env}"
   image       = "${data.aws_ecr_repository.main.repository_url}/${data.aws_ecr_repository.main.name}:${local.env}"
   essential   = true
   environment = [{
    name = "environment"
    value= local.environment
   }]
   portMappings = [{
     protocol      = "tcp"
     containerPort = local.port
     hostPort      = local.port
   }]
}])
}

data "aws_iam_policy_document" "task_execution_policy_document" {
  # override_policy_documents = [var.task_execution_policy_override_json]
  statement {
    # Allows role to get ssm parameters by name and path
    sid    = "AllowGetParameters"
    effect = "Allow"
    actions = [
      "ssm:GetParametersByPath",
      "ssm:GetParameters"
    ]
    resources = [
      "arn:aws:ssm:us-east-2:${data.aws_caller_identity.current.account_id}:parameter/ecs/${local.identifier}/${local.env}/*",
      "arn:aws:ssm:us-east-2:${data.aws_caller_identity.current.account_id}:parameter/shared/${local.env}/*"
    ]
  }
}


data "aws_iam_policy_document" "assume_task_document" {
  # Trust Policy JSON has max 2048 characters.
  # override_policy_documents = [var.task_assume_role_policy_override_json]
  statement {
    # Allows the role to be assumed by ECS Task
    sid    = "AllowECSToAssumeRole"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
  # TODO: fix github implementation
  # statement {
  #   # Allow the role to be assumed by GitHub Actions from the application repo
  #   sid     = "AllowGitHubToAssumeRole"
  #   effect  = "Allow"
  #   actions = ["sts:AssumeRoleWithWebIdentity"]
  #   principals {
  #     identifiers = [data.terraform_remote_state.github_oidc.outputs.github_oidc_arn]
  #     type        = "Federated"
  #   }
  #   condition {
  #     test     = "StringLike"
  #     values   = ["repo:${data.github_repository.repo.full_name}:*"]
  #     variable = "${data.terraform_remote_state.github_oidc.outputs.github_provider_hostname}:sub"
  #   }
  # }
}

resource "aws_iam_role" "task_role" {
  name               = "${local.identifier}-${local.env}-TaskRole"
  description        = "Task Role for ${local.identifier} (${local.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_document.json
  tags               = local.tags
}

resource "aws_iam_role" "task_execution_role" {
  name               = "${local.identifier}-${local.env}-TaskExecutionRole"
  description        = "Task Execution Role for ${local.identifier} (${local.env})."
  assume_role_policy = data.aws_iam_policy_document.assume_task_execution_document.json
  tags               = local.tags
}

data "aws_iam_policy_document" "assume_task_execution_document" {
  statement {
    # Allows role to be assumed by ECS
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = [
      "sts:AssumeRole"
    ]
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

resource "aws_route53_record" "api" {
  name    = local.public_url
  type    = "CNAME"
  ttl     = 300
  zone_id = data.aws_route53_zone.central_jesusfilm_org.zone_id
  records = [aws_lb.application_load_balancer.dns_name]
}
