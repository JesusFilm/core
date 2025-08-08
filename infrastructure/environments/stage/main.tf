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
    zone_id                 = module.route53_stage_central_jesusfilm_org.zone_id
    alb = {
      arn      = module.stage.public_alb.arn
      dns_name = module.stage.public_alb.dns_name
    }
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/health"
      health_check_port = "4000"
    })
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
    alb = {
      arn      = module.stage.internal_alb.arn
      dns_name = module.stage.internal_alb.dns_name
    }
    alb_listener     = module.stage.internal_alb.alb_listener
    alb_target_group = local.alb_target_group
  }
}

module "api-gateway-stage" {
  source = "../../../apis/api-gateway/infrastructure"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/readiness"
      health_check_port = "4000"
    })
  })
  env              = "stage"
  doppler_token    = data.aws_ssm_parameter.doppler_api_gateway_stage_token.value
  alb_listener_arn = module.stage.public_alb.alb_listener.arn
  alb_dns_name     = module.stage.public_alb.dns_name
}

module "api-analytics" {
  source                = "../../../apis/api-analytics/infrastructure"
  ecs_config            = local.internal_ecs_config
  env                   = "stage"
  doppler_token         = data.aws_ssm_parameter.doppler_api_analytics_stage_token.value
  subnet_group_name     = module.stage.vpc.db_subnet_group_name
  vpc_security_group_id = module.stage.private_rds_security_group_id
  alb = {
    arn      = module.stage.internal_alb.arn
    dns_name = module.stage.internal_alb.dns_name
  }
}

module "api-journeys" {
  source        = "../../../apis/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_stage_token.value
  alb = {
    arn      = module.stage.internal_alb.arn
    dns_name = module.stage.internal_alb.dns_name
  }
}

module "api-journeys-modern" {
  source        = "../../../apis/api-journeys-modern/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_stage_token.value
  alb = {
    arn      = module.stage.internal_alb.arn
    dns_name = module.stage.internal_alb.dns_name
  }
}

module "api-languages" {
  source        = "../../../apis/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_languages_stage_token.value
  alb = {
    arn      = module.stage.internal_alb.arn
    dns_name = module.stage.internal_alb.dns_name
  }
}

module "api-users" {
  source        = "../../../apis/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_users_stage_token.value
  alb = {
    arn      = module.stage.internal_alb.arn
    dns_name = module.stage.internal_alb.dns_name
  }
}

module "api-media" {
  source        = "../../../apis/api-media/infrastructure"
  ecs_config    = local.internal_ecs_config
  env           = "stage"
  doppler_token = data.aws_ssm_parameter.doppler_api_media_stage_token.value
  alb = {
    arn      = module.stage.internal_alb.arn
    dns_name = module.stage.internal_alb.dns_name
  }
}

module "arclight" {
  source = "../../../apps/arclight/infrastructure"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/"
      health_check_port = "3000"
    })
  })
  doppler_token    = data.aws_ssm_parameter.doppler_arclight_stage_token.value
  alb_listener_arn = module.stage.public_alb.alb_listener.arn
  alb_dns_name     = module.stage.public_alb.dns_name
  host_name        = "core-stage.arclight.org"
  host_names       = ["*.arclight.org", "*.arc.gt"] // handle any arclight or arc.gt subdomain passed to stage alb
  env              = "stage"
}

module "bastion" {
  source             = "../../modules/aws/ec2-bastion"
  name               = "bastion"
  env                = "stage"
  dns_name           = "bastion.stage.central.jesusfilm.org"
  subnet_id          = module.stage.vpc.public_subnets[0]
  zone_id            = data.aws_route53_zone.route53_stage_central_jesusfilm_org.zone_id
  security_group_ids = [module.stage.public_bastion_security_group_id, "sg-0d3fe6651aeda358e"]
}


module "cloudflared" {
  source             = "../../modules/aws/ec2-cloudflared"
  name               = "cloudflared"
  env                = "stage"
  subnet_id          = module.stage.vpc.public_subnets[0]
  security_group_ids = [module.stage.public_bastion_security_group_id]
  cloudflared_token  = data.aws_ssm_parameter.cloudflared_stage_token.value
}

module "datadog_aurora" {
  source             = "../../modules/aws/ec2-dd-agent-aurora"
  name               = "dd-aurora"
  env                = "stage"
  subnet_id          = module.stage.vpc.public_subnets[0]
  security_group_ids = [module.stage.private_rds_security_group_id]
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
  cluster_id        = "redis-stage"
  subnet_ids        = module.stage.vpc.internal_subnets
  env               = "stage"
  security_group_id = module.stage.ecs.internal_ecs_security_group_id
  cidr              = module.stage.cidr
  vpc_id            = module.stage.vpc.id
}

module "journeys-admin" {
  source = "../../../apps/journeys-admin/infrastructure"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/api/health"
      health_check_port = "3000"
    })
  })
  env              = "stage"
  doppler_token    = data.aws_ssm_parameter.doppler_journeys_admin_stage_token.value
  alb_listener_arn = module.stage.public_alb.alb_listener.arn
  alb_dns_name     = module.stage.public_alb.dns_name
  host_name        = "admin-stage.nextstep.is"
}

module "postgresql" {
  source                  = "../../modules/aws/aurora"
  name                    = "jfp-core"
  env                     = "stage"
  doppler_token           = data.aws_ssm_parameter.doppler_core_stage_token.value
  doppler_project         = "core"
  subnet_group_name       = module.stage.vpc.db_subnet_group_name
  vpc_security_group_id   = module.stage.private_rds_security_group_id
  PG_DATABASE_URL_ENV_VAR = "PRIVATE_DATABASE_URL"
}

module "eks" {
  source             = "../../modules/aws/eks"
  env                = "stage"
  name               = "jfp-eks"
  subnet_ids         = concat(module.stage.vpc.internal_subnets, module.stage.vpc.public_subnets)
  security_group_ids = [module.stage.ecs.internal_ecs_security_group_id, module.stage.ecs.public_ecs_security_group_id]
  vpc_id             = module.stage.vpc.id
  subnet_ids_2a      = ["subnet-03bd7850c8bbe2ce9", "subnet-01f4e86883462b5ce"]
  subnet_ids_2b      = ["subnet-0a609b33cdac65789", "subnet-09cbfc19be5214a8b"]
  subnet_ids_2c      = ["subnet-062de12e3e3639eff", "subnet-0c394639d255c3261"]
}

module "media-transcoder" {
  source                  = "../../../apis/media-transcoder/infrastructure"
  env                     = "stage"
  doppler_token           = data.aws_ssm_parameter.doppler_media_transcoder_stage_token.value
  task_execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
}
