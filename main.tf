

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
    alb_target_group = {
      port              = 443
      protocol          = "HTTPS"
      path_pattern      = ["/*"]
      health_check_path = "/.well-known/apollo/server-health"
      priority          = 1
    }
  }

  internal_ecs_config = {
    vpc_id                  = module.prod.vpc.id
    is_public               = false
    subnets                 = module.prod.vpc.internal_subnets
    alb_listener            = module.prod.internal_alb.aws_alb_listener
    security_group_id       = module.prod.ecs.internal_ecs_security_group_id
    task_execution_role_arn = module.iam.ecs_task_execution_role_arn
    cluster                 = module.prod.ecs.ecs_cluster
  }
}

module "api-gateway" {
  source     = "./apps/api-gateway/infrastructure"
  ecs_config = local.public_ecs_config
}

