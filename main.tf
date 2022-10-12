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

data "aws_iam_user" "jfp_terraform_user" {
  user_name = "jfp-terraform-user"
}

resource "aws_iam_access_key" "jfp_terraform_user_access_key" {
  user = data.aws_iam_user.jfp_terraform_user.user_name
}

data "aws_ssm_parameter" "atlantis_github_user_token" {
  name = "/terraform/prd/ATLANTIS_GITHUB_USER_TOKEN"
}

data "aws_ssm_parameter" "atlantis_github_webhook_secret" {
  name = "/terraform/prd/ATLANTIS_GITHUB_WEBHOOK_SECRET"
}

module "atlantis" {
  source  = "terraform-aws-modules/atlantis/aws"
  version = "~> 3.0"

  name = "atlantis"
  # user needed because of https://github.com/runatlantis/atlantis/issues/2221
  # this is atlantis user per the official docker image
  user = "100:1000"

  custom_environment_variables = [
    {
      name : "ATLANTIS_REPO_CONFIG_JSON",
      value : jsonencode(yamldecode(file("${path.module}/resources/atlantis/server-atlantis.yaml"))),
      }, {
      name : "AWS_ACCESS_KEY_ID"
      value : resource.aws_iam_access_key.jfp_terraform_user_access_key.id
      }, {
      name : "AWS_SECRET_ACCESS_KEY"
      value : resource.aws_iam_access_key.jfp_terraform_user_access_key.secret
    }
  ]

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
  atlantis_github_user           = "jesus-film-bot"
  atlantis_github_user_token     = data.aws_ssm_parameter.atlantis_github_user_token.value
  atlantis_github_webhook_secret = data.aws_ssm_parameter.atlantis_github_webhook_secret.value
  atlantis_repo_allowlist        = ["github.com/JesusFilm/*"]

  # GitHub
  allow_unauthenticated_access = true
  allow_github_webhooks        = true
}

data "aws_ssm_parameter" "doppler_api_gateway_prod_token" {
  name = "/terraform/prd/DOPPLER_API_GATEWAY_PROD_TOKEN"
}

module "api-gateway" {
  source        = "./apps/api-gateway/infrastructure"
  ecs_config    = local.public_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_gateway_prod_token.value
}

data "aws_ssm_parameter" "doppler_api_journeys_prod_token" {
  name = "/terraform/prd/DOPPLER_API_JOURNEYS_PROD_TOKEN"
}

module "api-journeys" {
  source        = "./apps/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_prod_token.value
}

data "aws_ssm_parameter" "doppler_api_languages_prod_token" {
  name = "/terraform/prd/DOPPLER_API_LANGUAGES_PROD_TOKEN"
}

module "api-languages" {
  source        = "./apps/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_languages_prod_token.value
}

data "aws_ssm_parameter" "doppler_api_users_prod_token" {
  name = "/terraform/prd/DOPPLER_API_USERS_PROD_TOKEN"
}

module "api-users" {
  source        = "./apps/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_users_prod_token.value
}

data "aws_ssm_parameter" "doppler_api_videos_prod_token" {
  name = "/terraform/prd/DOPPLER_API_VIDEOS_PROD_TOKEN"
}

module "api-videos" {
  source        = "./apps/api-videos/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_videos_prod_token.value
}
