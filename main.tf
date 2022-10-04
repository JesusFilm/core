module "iam" {
  source = "./modules/aws/iam"
}

module "vpc" {
  source = "./modules/aws/vpc"
  env    = var.env
  cidr   = var.cidr
}

module "internal_alb_security_group" {
  source        = "./modules/aws/security-group"
  name          = "jfp-internal-alb-sg"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = local.internal_alb_config.ingress_rules
  egress_rules  = local.internal_alb_config.egress_rules
}

module "public_alb_security_group" {
  source        = "./modules/aws/security-group"
  name          = "jfp-public-alb-sg"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = local.public_alb_config.ingress_rules
  egress_rules  = local.public_alb_config.egress_rules
}

module "internal_alb" {
  source            = "./modules/aws/alb"
  name              = "jfp-internal-alb"
  subnets           = module.vpc.internal_subnets
  vpc_id            = module.vpc.vpc_id
  internal          = true
  listener_port     = 80
  listener_protocol = "HTTP"
  listeners         = local.internal_alb_config.listeners
  security_groups   = [module.internal_alb_security_group.security_group_id]
}

module "public_alb" {
  source            = "./modules/aws/alb"
  name              = "jfp-public-alb"
  subnets           = module.vpc.public_subnets
  vpc_id            = module.vpc.vpc_id
  internal          = false
  listener_port     = 80
  listener_protocol = "HTTP"
  listeners         = local.public_alb_config.listeners
  security_groups   = [module.public_alb_security_group.security_group_id]
}

module "route53_private_zone" {
  source            = "./modules/aws/route53"
  internal_url_name = local.internal_url_name
  alb               = module.internal_alb.internal_alb
  vpc_id            = module.vpc.vpc_id
}

module "ecs" {
  source                      = "./modules/aws/ecs"
  vpc_id                      = module.vpc.vpc_id
  internal_alb_security_group = module.internal_alb_security_group
  public_alb_security_group   = module.public_alb_security_group
}

locals {
  public_ecs_config = {
    vpc_id                  = module.vpc.vpc_id
    is_public               = true
    subnets                 = module.vpc.public_subnets
    alb_listener            = module.public_alb.aws_alb_listener
    security_group_id       = module.ecs.public_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.ecs.ecs_cluster
  }

  internal_ecs_config = {
    vpc_id                  = module.vpc.vpc_id
    is_public               = false
    subnets                 = module.vpc.internal_subnets
    alb_listener            = module.internal_alb.aws_alb_listener
    security_group_id       = module.ecs.internal_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.ecs.ecs_cluster
  }
}

module "api-gateway" {
  source     = "./apps/api-gateway/infrastructure"
  ecs_config = local.public_ecs_config
}

