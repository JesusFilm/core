module "prod" {
  source                       = "../../modules/aws"
  certificate_arn              = data.aws_acm_certificate.acm_central_jesusfilm_org.arn
  env                          = "prod"
  cidr                         = "10.10.0.0/16"
  internal_url_name            = "service.internal"
  datadog_forwarder_lambda_arn = var.datadog_forwarder_lambda_arn
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
      health_check_port = "4000"
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
  source = "../../../apis/api-gateway/infrastructure"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/readiness"
      health_check_port = "4000"
    })
  })
  doppler_token    = data.aws_ssm_parameter.doppler_api_gateway_prod_token.value
  alb_listener_arn = module.prod.public_alb.alb_listener.arn
  alb_dns_name     = module.prod.public_alb.dns_name
}

module "api-analytics" {
  source                = "../../../apis/api-analytics/infrastructure"
  ecs_config            = local.internal_ecs_config
  doppler_token         = data.aws_ssm_parameter.doppler_api_analytics_prod_token.value
  subnet_group_name     = module.prod.vpc.db_subnet_group_name
  vpc_security_group_id = module.prod.private_rds_security_group_id
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-journeys-modern" {
  source        = "../../../apis/api-journeys/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_journeys_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-languages" {
  source        = "../../../apis/api-languages/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_languages_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-users" {
  source        = "../../../apis/api-users/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_users_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
  }
}

module "api-media" {
  source        = "../../../apis/api-media/infrastructure"
  ecs_config    = local.internal_ecs_config
  doppler_token = data.aws_ssm_parameter.doppler_api_media_prod_token.value
  alb = {
    arn      = module.prod.internal_alb.arn
    dns_name = module.prod.internal_alb.dns_name
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
  doppler_token    = data.aws_ssm_parameter.doppler_arclight_prod_token.value
  alb_listener_arn = module.prod.public_alb.alb_listener.arn
  alb_dns_name     = module.prod.public_alb.dns_name
  host_name        = "core.arclight.org"
  host_names       = ["arclight.org", "*.arclight.org", "arc.gt", "*.arc.gt"]
}

module "bastion" {
  source             = "../../modules/aws/ec2-bastion"
  name               = "bastion"
  env                = "prod"
  dns_name           = "bastion.central.jesusfilm.org"
  subnet_id          = module.prod.vpc.public_subnets[0]
  zone_id            = data.aws_route53_zone.route53_central_jesusfilm_org.zone_id
  security_group_ids = [module.prod.public_bastion_security_group_id, "sg-0134831ac8ca8c963", "sg-0fc432a3d89fc39fc"]
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
  node_type         = "cache.t2.medium"
  apply_immediately = true
  subnet_ids        = module.prod.vpc.internal_subnets
  security_group_id = module.prod.ecs.internal_ecs_security_group_id
  cidr              = module.prod.cidr
  vpc_id            = module.prod.vpc.id
}

# Short-link scan events (ClickHouse Cloud, always on; stage idles).
module "short_links_clickhouse" {
  source        = "../../modules/clickhouse/service"
  env           = "prod"
  idle_scaling  = false
  doppler_token = data.aws_ssm_parameter.doppler_core_prod_token.value
}

# Plausible Analytics on ECS (arm64 Fargate). Serves analytics.jesusfilm.org
# (a Cloudflare CNAME to the public ALB, by hand) and plausible.central.jesusfilm.org
# (the module's own record, for smoke tests). Its events are in
# short_links_clickhouse above, reached by the CLICKHOUSE_DATABASE_URL of the
# prd_ecs Doppler branch config; that config's token must be in SSM before the
# first apply (modules/plausible/README.md, "Prerequisites").
module "plausible" {
  source = "../../modules/plausible"
  ecs_config = merge(local.public_ecs_config, {
    alb_target_group = merge(local.alb_target_group, {
      health_check_path = "/api/health"
      health_check_port = "8000"
    })
  })
  env              = "prod"
  doppler_token    = data.aws_ssm_parameter.doppler_plausible_prod_token.value
  alb_listener_arn = module.prod.public_alb.alb_listener.arn
  alb_dns_name     = module.prod.public_alb.dns_name
  host_names       = ["analytics.jesusfilm.org", "plausible.central.jesusfilm.org"]
}

# analytics.jesusfilm.org is served by Cloudflare DNS, not Route53, so the ACM
# validation CNAME is added there by hand (modules/plausible/README.md) and
# the certificate is attached to the public listener in the cutover step once
# ACM reports ISSUED. Deliberately no aws_acm_certificate_validation: it would
# hold an Atlantis apply for up to 75 minutes waiting on that record.
resource "aws_acm_certificate" "analytics_jesusfilm_org" {
  domain_name       = "analytics.jesusfilm.org"
  validation_method = "DNS"

  tags = {
    Name = "analytics.jesusfilm.org"
    Env  = "prod"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Attach only once ACM reports the certificate ISSUED; attaching a pending
# certificate fails the apply. The public listener then answers for
# analytics.jesusfilm.org, and the Cloudflare CNAME edit is the cutover
# (modules/plausible/README.md, "Prod cutover").
resource "aws_lb_listener_certificate" "analytics_jesusfilm_org" {
  listener_arn    = module.prod.public_alb.alb_listener.arn
  certificate_arn = aws_acm_certificate.analytics_jesusfilm_org.arn
}

module "postgresql" {
  source                          = "../../modules/aws/aurora"
  name                            = "jfp-core"
  env                             = "prod"
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
  storage_type      = null
  apply_immediately = true
  serverlessv2_capacity = {
    min_capacity = 0.5
    max_capacity = 16
  }
  doppler_token           = data.aws_ssm_parameter.doppler_core_prod_token.value
  doppler_project         = "core"
  subnet_group_name       = module.prod.vpc.db_subnet_group_name
  vpc_security_group_id   = module.prod.private_rds_security_group_id
  PG_DATABASE_URL_ENV_VAR = "PRIVATE_DATABASE_URL"
}
