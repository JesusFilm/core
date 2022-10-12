data "aws_availability_zones" "current" {}

module "prod" {
  source          = "./modules/aws"
  certificate_arn = module.acm_central_jesusfilm_org.arn
}

locals {
  public_ecs_config = {
    vpc_id                  = module.prod.vpc.id
    is_public               = true
    subnets                 = module.prod.vpc.public_subnets
    alb_listener_arn        = module.prod.public_alb.aws_alb_listener["HTTPS"].arn
    security_group_id       = module.prod.ecs.public_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.prod.ecs.ecs_cluster
    alb_dns_name            = module.prod.public_alb.dns_name
    image_tag               = "main"
    zone_id                 = module.route53_central_jesusfilm_org.zone_id
    alb_target_group        = local.alb_target_group
  }

  internal_ecs_config = {
    vpc_id                  = module.prod.vpc.id
    is_public               = false
    subnets                 = module.prod.vpc.internal_subnets
    alb_listener_arn        = module.prod.internal_alb.aws_alb_listener["HTTP"].arn
    security_group_id       = module.prod.ecs.internal_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.prod.ecs.ecs_cluster
    alb_dns_name            = module.prod.internal_alb.dns_name
    image_tag               = "main"
    zone_id                 = module.prod.route53_private_zone_id
    alb_target_group        = local.alb_target_group
  }
}

module "atlantis" {
  source  = "terraform-aws-modules/atlantis/aws"
  version = "~> 3.0"

  name = "atlantis"
  # user needed because of https://github.com/runatlantis/atlantis/issues/2221
  # this is atlantis user per the official docker image
  user = "100:1000"

  # ephemeral storage, needed because the EFS storage
  # gets created with root-owned directories
  enable_ephemeral_storage = true

  # VPC
  vpc_id             = module.prod.vpc.id
  private_subnet_ids = module.prod.vpc.internal_subnets
  public_subnet_ids  = module.prod.vpc.public_subnets
  cidr               = var.cidr

  # DNS
  route53_zone_name = module.route53_central_jesusfilm_org.name

  # ACM
  certificate_arn = module.acm_central_jesusfilm_org.arn

  # ECS
  ecs_cluster_id = module.prod.ecs.ecs_cluster.id

  # Atlantis
  atlantis_github_user       = "jesus-film-bot"
  atlantis_github_user_token = var.atlantis_github_user_token
  atlantis_repo_allowlist    = ["github.com/JesusFilm/*"]

  # GitHub
  allow_unauthenticated_access = true
  allow_github_webhooks        = true
}

module "api-gateway" {
  source        = "./apps/api-gateway/infrastructure"
  ecs_config    = local.public_ecs_config
  doppler_token = var.doppler_api_gateway_prod_token
}

module "api-journeys" {
  source        = "./apps/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = var.doppler_api_journeys_prod_token
}

module "api-languages" {
  source        = "./apps/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = var.doppler_api_languages_prod_token
}

module "api-users" {
  source        = "./apps/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = var.doppler_api_users_prod_token
}

module "api-videos" {
  source        = "./apps/api-videos/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = var.doppler_api_videos_prod_token
}
