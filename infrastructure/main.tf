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
    aurora = local.upgrade.prod_pg
  }
}

module "stage" {
  source                       = "./environments/stage"
  allow_aurora_major_upgrade   = var.allow_stage_aurora_major_upgrade
  datadog_forwarder_lambda_arn = module.datadog.log_forwarder_lambda_arn
  versions = {
    aurora = local.upgrade.stage_pg
  }
}

module "datadog" {
  source = "./modules/aws/datadog"
}
