module "stage" {
  source            = "./modules/aws"
  env               = "stage"
  cidr              = "10.11.0.0/16"
  internal_url_name = "service.stage.internal"
  certificate_arn   = module.acm_central_jesusfilm_org.arn
}

locals {
  public_stage_ecs_config = {
    vpc_id                  = module.stage.vpc.id
    is_public               = true
    subnets                 = module.stage.vpc.public_subnets
    alb_listener_arn        = module.stage.public_alb.aws_alb_listener["HTTPS"].arn
    security_group_id       = module.stage.ecs.public_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.stage.ecs.ecs_cluster
    alb_dns_name            = module.stage.public_alb.dns_name
    image_tag               = "stage"
    zone_id                 = module.route53_central_jesusfilm_org.zone_id
    alb_target_group = {
      port              = 443
      protocol          = "HTTPS"
      path_pattern      = ["/*"]
      health_check_path = "/.well-known/apollo/server-health"
      priority          = 1
    }
  }

  internal_stage_ecs_config = {
    vpc_id                  = module.stage.vpc.id
    is_public               = false
    subnets                 = module.stage.vpc.internal_subnets
    alb_listener            = module.stage.internal_alb.aws_alb_listener
    security_group_id       = module.stage.ecs.internal_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.stage.ecs.ecs_cluster
  }
}

module "api-gateway-stage" {
  source     = "./apps/api-gateway/infrastructure"
  ecs_config = local.public_stage_ecs_config
  env        = "stage"
}
