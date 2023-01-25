module "prod" {
  source            = "../../modules/aws"
  certificate_arn   = data.aws_acm_certificate.acm_central_jesusfilm_org.arn
  env               = "prod"
  cidr              = "10.10.0.0/16"
  internal_url_name = "service.internal"
}

locals {
  public_ecs_config = {
    vpc_id                  = module.prod.vpc.id
    is_public               = true
    subnets                 = module.prod.vpc.public_subnets
    security_group_id       = module.prod.ecs.public_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.prod.ecs.ecs_cluster
    alb_dns_name            = module.prod.public_alb.dns_name
    zone_id                 = data.aws_route53_zone.route53_central_jesusfilm_org.zone_id
    alb_target_group        = local.alb_target_group
    # alb_target_group = merge(local.alb_target_group, {
    #   health_check_path = "/health"
    #   health_check_port = "8088"
    # })
    alb_listener = {
      alb_arn         = module.prod.public_alb.arn
      port            = 443
      protocol        = "HTTPS"
      certificate_arn = data.aws_acm_certificate.acm_central_jesusfilm_org.arn
    }
  }

  internal_ecs_config = {
    vpc_id                  = module.prod.vpc.id
    is_public               = false
    subnets                 = module.prod.vpc.internal_subnets
    security_group_id       = module.prod.ecs.internal_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.prod.ecs.ecs_cluster
    alb_dns_name            = module.prod.internal_alb.dns_name
    zone_id                 = module.prod.route53_private_zone_id
    alb_target_group        = local.alb_target_group
    alb_listener = {
      alb_arn  = module.prod.internal_alb.arn
      protocol = "HTTP"
    }
  }
}

module "api-gateway" {
  source        = "../../../apps/api-gateway/infrastructure"
  ecs_config    = local.public_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_gateway_prod_token.value
}

module "api-journeys" {
  source        = "../../../apps/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_prod_token.value
}

module "api-languages" {
  source        = "../../../apps/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_languages_prod_token.value
}

module "api-users" {
  source        = "../../../apps/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_users_prod_token.value
}

module "api-videos" {
  source        = "../../../apps/api-videos/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_videos_prod_token.value
}

module "arango-bigquery-etl" {
  source                  = "../../../apps/arangodb-bigquery-etl/infrastructure"
  doppler_token           = data.aws_ssm_parameter.doppler_arango_bigquery_etl_prod_token.value
  task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
  subnet_ids              = module.prod.vpc.internal_subnets
  cluster_arn             = module.prod.ecs.ecs_cluster.arn
}
