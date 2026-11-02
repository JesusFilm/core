module "stage" {
  source                       = "../../modules/aws"
  env                          = "stage"
  cidr                         = "10.11.0.0/16"
  internal_url_name            = "stage.internal"
  certificate_arn              = aws_acm_certificate.stage.arn
  datadog_forwarder_lambda_arn = var.datadog_forwarder_lambda_arn
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

module "api-journeys-modern" {
  source        = "../../../apis/api-journeys/infrastructure"
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
  env              = "stage"
  doppler_token    = data.aws_ssm_parameter.doppler_arclight_stage_token.value
  alb_listener_arn = module.stage.public_alb.alb_listener.arn
  alb_dns_name     = module.stage.public_alb.dns_name
  host_name        = "core-stage.arclight.org"
  host_names       = ["*.arclight.org", "*.arc.gt"] // handle any arclight or arc.gt subdomain passed to stage alb
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
  node_type         = "cache.t2.medium"
  apply_immediately = true
  security_group_id = module.stage.ecs.internal_ecs_security_group_id
  cidr              = module.stage.cidr
  vpc_id            = module.stage.vpc.id
}

# ClickHouse Cloud service for short-link scan events (the redirect Worker
# inserts, api-media reads). # Idles when stage is quiet; only storage is billed while paused.
module "short_links_clickhouse" {
  source               = "../../modules/clickhouse/service"
  env                  = "stage"
  idle_scaling         = true
  idle_timeout_minutes = 15
  doppler_token        = data.aws_ssm_parameter.doppler_core_stage_token.value
}

# Plausible Analytics on ECS (arm64 Fargate). Serves
# analytics.stage.central.jesusfilm.org (the record below) and
# plausible.stage.central.jesusfilm.org (the module's own record, for smoke
# tests). Its events are in short_links_clickhouse, reached by the
# CLICKHOUSE_DATABASE_URL of the stg_ecs Doppler branch config; that config's
# token must be in SSM before the first apply (modules/plausible/README.md,
# "Prerequisites").
module "plausible" {
  source = "../../modules/plausible"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/api/health"
      health_check_port = "8000"
    })
  })
  env              = "stage"
  doppler_token    = data.aws_ssm_parameter.doppler_plausible_stage_token.value
  alb_listener_arn = module.stage.public_alb.alb_listener.arn
  alb_dns_name     = module.stage.public_alb.dns_name
  host_names       = ["analytics.stage.central.jesusfilm.org", "plausible.stage.central.jesusfilm.org"]
}

# The stage Plausible hostname, a CNAME to the stage public ALB. The record
# predates this configuration, so allow_overwrite lets Terraform take it as it
# is.
resource "aws_route53_record" "plausible_analytics" {
  zone_id         = module.route53_stage_central_jesusfilm_org.zone_id
  name            = "analytics"
  type            = "CNAME"
  ttl             = 300
  records         = [module.stage.public_alb.dns_name]
  allow_overwrite = true
}

module "postgresql" {
  source                          = "../../modules/aws/aurora"
  name                            = "jfp-core"
  env                             = "stage"
  engine_version                  = var.versions.aurora
  enforce_major_upgrade_approval  = true
  allow_major_version_upgrade     = var.allow_aurora_major_upgrade
  db_cluster_parameter_group_name = split(".", var.versions.aurora)[0] == "13" ? "aurora-postgresql13-cluster-replication" : null
  managed_parameter_group_family  = split(".", var.versions.aurora)[0] == "13" ? null : "aurora-postgresql${split(".", var.versions.aurora)[0]}"
  db_parameter_group_name         = "default.aurora-postgresql${split(".", var.versions.aurora)[0]}"
  managed_cluster_parameters = {
    "rds.logical_replication"    = { value = "1", apply_method = "pending-reboot" }
    "log_min_duration_statement" = { value = "5000", apply_method = "immediate" }
    # PostgreSQL 13 uses 0; preserve the existing connection policy during the
    # major upgrade rather than also changing application TLS requirements.
    "rds.force_ssl" = { value = "0", apply_method = "immediate" }
  }
  storage_type      = "aurora-iopt1"
  apply_immediately = true
  serverlessv2_capacity = {
    min_capacity = 0.5
    max_capacity = 16
  }
  doppler_token           = data.aws_ssm_parameter.doppler_core_stage_token.value
  doppler_project         = "core"
  subnet_group_name       = module.stage.vpc.db_subnet_group_name
  vpc_security_group_id   = module.stage.private_rds_security_group_id
  PG_DATABASE_URL_ENV_VAR = "PRIVATE_DATABASE_URL"
}
