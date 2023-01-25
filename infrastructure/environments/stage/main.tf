module "stage" {
  source            = "../../modules/aws"
  env               = "stage"
  cidr              = "10.11.0.0/16"
  internal_url_name = "stage.internal"
  certificate_arn   = aws_acm_certificate.stage.arn
}

module "route53_stage_central_jesusfilm_org" {
  source         = "../../modules/aws/route53/subdomain"
  domain_name    = "stage.central.jesusfilm.org"
  parent_zone_id = data.aws_route53_zone.route53_central_jesusfilm_org.zone_id
}

resource "aws_acm_certificate" "stage" {
  domain_name       = "*.stage.central.jesusfilm.org"
  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "stage" {
  certificate_arn = aws_acm_certificate.stage.arn
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for validation in aws_acm_certificate.stage.domain_validation_options :
    validation.domain_name => validation
  }
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = "300"
  records         = [each.value.resource_record_value]
  allow_overwrite = true
  zone_id         = module.route53_stage_central_jesusfilm_org.zone_id
}

locals {
  public_ecs_config = {
    vpc_id                  = module.stage.vpc.id
    is_public               = true
    subnets                 = module.stage.vpc.public_subnets
    security_group_id       = module.stage.ecs.public_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.stage.ecs.ecs_cluster
    alb_dns_name            = module.stage.public_alb.dns_name
    zone_id                 = module.route53_stage_central_jesusfilm_org.zone_id
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/health"
      health_check_port = "8088"
    })
    alb_listener = {
      alb_arn         = module.stage.public_alb.arn
      port            = 443
      protocol        = "HTTPS"
      certificate_arn = data.aws_acm_certificate.acm_central_jesusfilm_org.arn
    }
  }

  internal_ecs_config = {
    vpc_id                  = module.stage.vpc.id
    is_public               = false
    subnets                 = module.stage.vpc.internal_subnets
    security_group_id       = module.stage.ecs.internal_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.stage.ecs.ecs_cluster
    alb_dns_name            = module.stage.internal_alb.dns_name
    zone_id                 = module.stage.route53_private_zone_id
    alb_target_group        = local.alb_target_group
    alb_listener = {
      alb_arn  = module.stage.internal_alb.arn
      protocol = "HTTP"
    }
  }
}

module "api-gateway-stage" {
  source        = "../../../apps/api-gateway/infrastructure"
  ecs_config    = local.public_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_gateway_stage_token.value
}

module "api-journeys" {
  source        = "../../../apps/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_stage_token.value
}

module "api-languages" {
  source        = "../../../apps/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_languages_stage_token.value
}

module "api-users" {
  source        = "../../../apps/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_users_stage_token.value
}

module "api-videos" {
  source        = "../../../apps/api-videos/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_videos_stage_token.value
}
