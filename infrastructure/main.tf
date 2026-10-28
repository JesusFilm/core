module "iam" {
  source = "./modules/aws/iam"
}

module "route53_jesusfilm_org_zone" {
  source      = "./modules/aws/route53/domain"
  domain_name = "jesusfilm.org"
}

module "route53_central_jesusfilm_org" {
  source         = "./modules/aws/route53/subdomain"
  domain_name    = "central.jesusfilm.org"
  parent_zone_id = module.route53_jesusfilm_org_zone.zone_id
}

module "acm_central_jesusfilm_org" {
  source      = "./modules/aws/acm"
  domain_name = "*.central.jesusfilm.org"
  zone_id     = module.route53_central_jesusfilm_org.zone_id
}

module "prod" {
  source                       = "./environments/prod"
  allow_aurora_major_upgrade   = var.allow_prod_aurora_major_upgrade
  datadog_forwarder_lambda_arn = module.datadog.log_forwarder_lambda_arn
  versions = {
    eks_cluster = local.upgrade.prod_eks
    eks_nodes   = local.upgrade.prod_nodes
    aurora      = local.upgrade.prod_pg
  }
  eks_addon_versions = local.upgrade.prod_addons ? merge(local.prod_addon_versions, {
    eks-node-monitoring-agent = "v1.4.0-eksbuild.2"
  }) : {}
}

module "stage" {
  source                       = "./environments/stage"
  allow_aurora_major_upgrade   = var.allow_stage_aurora_major_upgrade
  datadog_forwarder_lambda_arn = module.datadog.log_forwarder_lambda_arn
  versions = {
    eks_cluster = local.upgrade.stage_eks
    eks_nodes   = local.upgrade.stage_eks
    aurora      = local.upgrade.stage_pg
  }
  eks_addon_versions = merge(local.stage_addon_versions, {
    eks-node-monitoring-agent = var.upgrade_phase == "prepare" ? "v1.1.0-eksbuild.1" : "v1.4.0-eksbuild.2"
  })
}

module "datadog" {
  source = "./modules/aws/datadog"
}
