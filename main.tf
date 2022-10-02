module "iam" {
  source = "./modules/aws/iam"
}

module "vpc" {
  source             = "./modules/aws/vpc"
  env                = var.env
  cidr               = var.cidr
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
}

module "internal_alb_security_group" {
  source        = "./modules/aws/security-group"
  name          = "core-internal-alb-sg"
  description   = "core-internal-alb-sg"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = var.internal_alb_config.ingress_rules
  egress_rules  = var.internal_alb_config.egress_rules
}

module "public_alb_security_group" {
  source        = "./modules/aws/security-group"
  name          = "core-public-alb-sg"
  description   = "core-public-alb-sg"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = var.public_alb_config.ingress_rules
  egress_rules  = var.public_alb_config.egress_rules
}

module "internal-alb" {
  source            = "./modules/aws/alb"
  name              = "core-internal-alb"
  subnets           = module.vpc.private_subnets
  vpc_id            = module.vpc.vpc_id
  internal          = true
  listener_port     = 80
  listener_protocol = "HTTP"
  listeners         = var.internal_alb_config.listeners
  security_groups   = [module.internal_alb_security_group.security_group_id]
}

module "public-alb" {
  source            = "./modules/aws/alb"
  name              = "core-public-alb"
  subnets           = module.vpc.public_subnets
  vpc_id            = module.vpc.vpc_id
  internal          = false
  listener_port     = 80
  listener_protocol = "HTTP"
  listeners         = var.public_alb_config.listeners
  security_groups   = [module.public_alb_security_group.security_group_id]
}

module "route53_private_zone" {
  source            = "./modules/aws/route53"
  internal_url_name = var.internal_url_name
  alb               = module.internal-alb.internal_alb
  vpc_id            = module.vpc.vpc_id
}

module "ecs" {
  source                      = "./modules/aws/ecs"
  vpc_id                      = module.vpc.vpc_id
  internal_alb_security_group = module.internal_alb_security_group
  public_alb_security_group   = module.public_alb_security_group
}

module "api-gateway" {
  source                      = "./apps/api-gateway"
  account                     = var.account
  region                      = var.region
  ecs_task_execution_role_arn = module.iam.ecs_task_execution_role_arn
  vpc_id                      = module.vpc.vpc_id
  private_subnets             = module.vpc.private_subnets
  public_subnets              = module.vpc.public_subnets
  public_alb_security_group   = module.public_alb_security_group
  internal_alb_security_group = module.internal_alb_security_group
  internal_alb_target_groups  = module.internal-alb.target_groups
  public_alb_target_groups    = module.public-alb.target_groups
}

