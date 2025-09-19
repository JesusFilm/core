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
  datadog_forwarder_lambda_arn = module.datadog.log_forwarder_lambda_arn
}

module "stage" {
  source                       = "./environments/stage"
  datadog_forwarder_lambda_arn = module.datadog.log_forwarder_lambda_arn
}

module "datadog" {
  source = "./modules/aws/datadog"
}
