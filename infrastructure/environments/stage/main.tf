module "stage" {
  source            = "../../modules/aws"
  env               = "stage"
  cidr              = "10.11.0.0/16"
  internal_url_name = "service.stage.internal"
  certificate_arn   = data.aws_acm_certificate.acm_central_jesusfilm_org.arn
}

locals {
  public_stage_ecs_config = {
    vpc_id                  = module.stage.vpc.id
    is_public               = true
    subnets                 = module.stage.vpc.public_subnets
    alb_listener_arn        = module.stage.public_alb.aws_alb_listener["HTTPS"].arn
    security_group_id       = module.stage.ecs.public_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.stage.ecs.ecs_cluster
    alb_dns_name            = module.stage.public_alb.dns_name
    image_tag               = "stage"
    zone_id                 = data.aws_route53_zone.route53_central_jesusfilm_org.zone_id
    alb_target_group        = local.alb_target_group
  }

  internal_stage_ecs_config = {
    vpc_id                  = module.stage.vpc.id
    is_public               = false
    subnets                 = module.stage.vpc.internal_subnets
    alb_listener            = module.stage.internal_alb.aws_alb_listener
    security_group_id       = module.stage.ecs.internal_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.stage.ecs.ecs_cluster
  }
}

module "api-gateway-stage" {
  source        = "../../../apps/api-gateway/infrastructure"
  ecs_config    = local.public_stage_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_gateway_stage_token.value
}
