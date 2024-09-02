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
    alb = {
      arn      = module.prod.public_alb.arn
      dns_name = module.prod.public_alb.dns_name
    }
    zone_id = data.aws_route53_zone.route53_central_jesusfilm_org.zone_id
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/health"
      health_check_port = "8088"
    })
  }

  internal_ecs_config = {
    vpc_id                  = module.prod.vpc.id
    is_public               = false
    subnets                 = module.prod.vpc.internal_subnets
    security_group_id       = module.prod.ecs.internal_ecs_security_group_id
    task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
    cluster                 = module.prod.ecs.ecs_cluster
    zone_id                 = module.prod.route53_private_zone_id
    alb = {
      arn      = module.prod.internal_alb.arn
      dns_name = module.prod.internal_alb.dns_name
    }
    alb_target_group = local.alb_target_group
  }
}

module "api-gateway" {
  source           = "../../../apps/api-gateway/infrastructure"
  ecs_config       = local.public_ecs_config
  doppler_token    = data.aws_ssm_parameter.doppler_api_gateway_prod_token.value
  alb_listener_arn = module.prod.public_alb.alb_listener.arn
  alb_dns_name     = module.prod.public_alb.dns_name
}

module "api-analytics" {
  source                = "../../../apps/api-analytics/infrastructure"
  ecs_config            = local.internal_ecs_config
  doppler_token         = data.aws_ssm_parameter.doppler_api_analytics_prod_token.value
  subnet_group_name     = module.prod.vpc.db_subnet_group_name
  vpc_security_group_id = module.prod.private_rds_security_group_id
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-journeys" {
  source        = "../../../apps/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-languages" {
  source        = "../../../apps/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_languages_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-tags" {
  source        = "../../../apps/api-tags/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_tags_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-users" {
  source        = "../../../apps/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_users_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-media" {
  source        = "../../../apps/api-media/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_media_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-nexus" {
  source        = "../../../apps/api-nexus/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_nexus_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "bastion" {
  source             = "../../modules/aws/ec2-bastion"
  name               = "bastion"
  env                = "prod"
  dns_name           = "bastion.central.jesusfilm.org"
  subnet_id          = module.prod.vpc.public_subnets[0]
  zone_id            = data.aws_route53_zone.route53_central_jesusfilm_org.zone_id
  security_group_ids = [module.prod.public_bastion_security_group_id]
  instance_type      = "t3.medium"
}


module "cloudflared" {
  source             = "../../modules/aws/ec2-cloudflared"
  name               = "cloudflared"
  env                = "prod"
  subnet_id          = module.prod.vpc.public_subnets[0]
  security_group_ids = [module.prod.public_bastion_security_group_id]
  cloudflared_token  = data.aws_ssm_parameter.cloudflared_prod_token.value
}

module "datadog_aurora" {
  source             = "../../modules/aws/ec2-dd-agent-aurora"
  name               = "dd-aurora"
  env                = "prod"
  subnet_id          = module.prod.vpc.public_subnets[0]
  security_group_ids = [module.prod.private_rds_security_group_id]
  rds_instances = [{
    host             = module.postgresql.aws_rds_cluster.endpoint
    port             = module.postgresql.aws_rds_cluster.port
    username         = module.postgresql.aws_rds_cluster.master_username
    password         = module.postgresql.random_password.result
    db_instance_name = module.postgresql.aws_rds_cluster.id
  }]
}

module "redis" {
  source            = "../../modules/aws/elasticache"
  cluster_id        = "redis-prod"
  subnet_ids        = module.prod.vpc.internal_subnets
  security_group_id = module.prod.ecs.internal_ecs_security_group_id
  cidr              = module.prod.cidr
  vpc_id            = module.prod.vpc.id
}

module "journeys-admin" {
  source = "../../../apps/journeys-admin/infrastructure"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/api/health"
      health_check_port = "3000"
    })
  })
  doppler_token    = data.aws_ssm_parameter.doppler_journeys_admin_prod_token.value
  alb_listener_arn = module.prod.public_alb.alb_listener.arn
  alb_dns_name     = module.prod.public_alb.dns_name
  host_name        = "admin.nextstep.is"
}

module "postgresql" {
  source                  = "../../modules/aws/aurora"
  name                    = "jfp-core"
  env                     = "prod"
  doppler_token           = data.aws_ssm_parameter.doppler_core_prod_token.value
  doppler_project         = "core"
  subnet_group_name       = module.prod.vpc.db_subnet_group_name
  vpc_security_group_id   = module.prod.private_rds_security_group_id
  PG_DATABASE_URL_ENV_VAR = "PRIVATE_DATABASE_URL"
}

module "eks" {
  source             = "../../modules/aws/eks"
  env                = "prod"
  name               = "jfp-eks"
  subnet_ids         = concat(module.prod.vpc.internal_subnets, module.prod.vpc.public_subnets)
  security_group_ids = [module.prod.ecs.internal_ecs_security_group_id, module.prod.ecs.public_ecs_security_group_id]
  vpc_id             = module.prod.vpc.id
}
