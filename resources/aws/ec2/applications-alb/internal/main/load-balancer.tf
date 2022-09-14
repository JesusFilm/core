module "applications_alb" {
  source = "../../../../../modules/aws/ec2/applications-alb"

  identifier        = local.identifier
  env               = local.env
  internal          = true
  add_http_listener = false
  security_groups = [
    data.aws_security_group.default_load_balancer_internal.id,
    aws_security_group.security_group.id,
  ]
  subnets = data.aws_subnets.prod_public.ids
  certificates_arns = [
    data.aws_acm_certificate.central_jesusfilm_org.arn,
  ]
  extra_tags = local.tags
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
    env  = "main"
    type = "public"
  }
}

data "aws_security_group" "default_load_balancer_internal" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    function = "load-balancer"
    type     = "ingress"
    network  = "internal"
  }
}

resource "aws_security_group" "security_group" {
  vpc_id                 = data.aws_vpc.main.id
  name                   = "${local.identifier}-${local.env}"
  description            = "Applications Internal ALB (Prod)"
  revoke_rules_on_delete = true
  tags = merge(local.tags, {
    Name = "${local.identifier}-${local.env}"
  })
}

data "aws_acm_certificate" "central_jesusfilm_org" {
  domain      = "*.central.jesusfilm.org"
  most_recent = true
}

output "load_balancer_arn" {
  description = "Load balancer ARN"
  value       = module.applications_alb.load_balancer_arn
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = module.applications_alb.https_listener_arn
}

output "security_group_id" {
  description = "Applications Internal ALB security group ID"
  value       = aws_security_group.security_group.id
}
