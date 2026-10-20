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

# Plausible Analytics on ECS (arm64 Fargate), replacing the Deployment on the
# EKS Platform Cluster. Serves plausible.stage.central.jesusfilm.org (the
# module's own record) for smoke tests; analytics.stage.central.jesusfilm.org
# moves here in the cutover step (modules/plausible/README.md). Apply only
# once its Doppler token for the stg_ecs branch config is in SSM; the task
# then needs the EKS ClickHouse NLB (README.md, "Prerequisites").
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

module "eks" {
  source                     = "../../modules/aws/eks"
  env                        = "stage"
  cluster_version            = var.versions.eks_cluster
  node_version               = var.versions.eks_nodes
  node_max_unavailable       = 1
  node_ami_type              = "AL2023_x86_64_STANDARD"
  enforce_sequential_upgrade = true
  addons = {
    for name, version in var.eks_addon_versions : name => {
      version              = version
      existing             = name == "eks-node-monitoring-agent"
      configuration_values = lookup(local.eks_addon_configuration, name, null)
    }
  }
  node_repair_thresholds = {
    max_parallel_nodes_repaired_percentage  = 10
    max_unhealthy_node_threshold_percentage = 20
  }
  node_scaling_config = {
    desired_size = 3
    min_size     = 3
    max_size     = 5
  }
  name               = "jfp-eks"
  subnet_ids         = concat(module.stage.vpc.internal_subnets, module.stage.vpc.public_subnets)
  security_group_ids = [module.stage.ecs.internal_ecs_security_group_id, module.stage.ecs.public_ecs_security_group_id]
  vpc_id             = module.stage.vpc.id
  subnet_ids_2a      = ["subnet-03bd7850c8bbe2ce9", "subnet-01f4e86883462b5ce"]
  subnet_ids_2b      = ["subnet-0a609b33cdac65789", "subnet-09cbfc19be5214a8b"]
  subnet_ids_2c      = ["subnet-062de12e3e3639eff", "subnet-0c394639d255c3261"]
}

# Bounded EBS snapshot retention for the Plausible ClickHouse volumes: 3 daily
# snapshots, replacing the former SnapScheduler schedule, whose EBS
# snapshots were never deleted (the VolumeSnapshotClass uses deletionPolicy:
# Retain).
module "plausible_clickhouse_snapshots" {
  source       = "../../modules/aws/ebs-snapshot-policy"
  env          = "stage"
  name         = "plausible-clickhouse"
  cluster_name = module.eks.cluster_name
  pvc_names = [
    "plausible-analytics-clickhouse-data-plausible-analytics-clickhouse-0",
    "plausible-analytics-clickhouse-replica-data-plausible-analytics-clickhouse-replica-0"
  ]
  schedules = [
    { name = "daily", cron_expression = "cron(0 1 * * ? *)", retain_count = 3 }
  ]
}

locals {
  # Preserve existing networking, fixed DNS replicas and resource requests
  # while adopting the EKS bootstrap add-ons into Terraform.
  eks_addon_configuration = {
    "vpc-cni" = jsonencode({
      "env" = {
        "ADDITIONAL_ENI_TAGS"                   = "{}"
        "ANNOTATE_POD_IP"                       = "false"
        "AWS_VPC_CNI_NODE_PORT_SUPPORT"         = "true"
        "AWS_VPC_ENI_MTU"                       = "9001"
        "AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG"    = "false"
        "AWS_VPC_K8S_CNI_EXTERNALSNAT"          = "false"
        "AWS_VPC_K8S_CNI_LOGLEVEL"              = "DEBUG"
        "AWS_VPC_K8S_CNI_LOG_FILE"              = "/host/var/log/aws-routed-eni/ipamd.log"
        "AWS_VPC_K8S_CNI_RANDOMIZESNAT"         = "prng"
        "AWS_VPC_K8S_CNI_VETHPREFIX"            = "eni"
        "AWS_VPC_K8S_PLUGIN_LOG_FILE"           = "/var/log/aws-routed-eni/plugin.log"
        "AWS_VPC_K8S_PLUGIN_LOG_LEVEL"          = "DEBUG"
        "DISABLE_INTROSPECTION"                 = "false"
        "DISABLE_METRICS"                       = "false"
        "DISABLE_NETWORK_RESOURCE_PROVISIONING" = "false"
        "ENABLE_POD_ENI"                        = "false"
        "ENABLE_PREFIX_DELEGATION"              = "false"
        "ENABLE_SUBNET_DISCOVERY"               = "true"
        "NETWORK_POLICY_ENFORCING_MODE"         = "standard"
        "WARM_ENI_TARGET"                       = "1"
        "WARM_PREFIX_TARGET"                    = "1"
      }
      "resources" = {
        "requests" = {
          "cpu" = "25m"
        }
      }
      "nodeAgent" = {
        "resources" = {
          "requests" = {
            "cpu" = "25m"
          }
        }
      }
    })
    "coredns" = jsonencode({
      corefile       = ".:53 {\n    errors\n    health {\n        lameduck 5s\n      }\n    ready\n    kubernetes cluster.local in-addr.arpa ip6.arpa {\n      pods insecure\n      fallthrough in-addr.arpa ip6.arpa\n    }\n    prometheus :9153\n    forward . /etc/resolv.conf\n    cache 30\n    loop\n    reload\n    loadbalance\n}\n"
      "replicaCount" = 2
      "resources" = {
        "limits" = {
          "memory" = "170Mi"
        }
        "requests" = {
          "cpu"    = "100m"
          "memory" = "70Mi"
        }
      }
      "podDisruptionBudget" = {
        "enabled"        = true
        "maxUnavailable" = 1
      }
    })
  }
}
