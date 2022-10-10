module "iam" {
  source = "./modules/aws/iam"
}

module "route53_jesusfilm_org_zone" {
  source      = "./modules/aws/route53/domain"
  domain_name = "jesusfilm.org"
  # vpc_id      = module.base.vpc_id
}

module "route53_central_jesusfilm_org" {
  source         = "./modules/aws/route53/subdomain"
  domain_name    = "central.jesusfilm.org"
  parent_zone_id = module.route53_jesusfilm_org_zone.zone_id
  # vpc_id         = module.base.vpc_id
}

module "acm_central_jesusfilm_org" {
  source      = "./modules/aws/acm"
  domain_name = "*.central.jesusfilm.org"
  zone_id     = module.route53_central_jesusfilm_org.zone_id
}

locals {
  services = [
    "api-gateway",
    "api-journeys",
    "api-languages",
    "api-media",
    "api-users",
    "api-videos",
    "arangodb-bigquery-etl",
    "arangodb-s3-backup"
  ]
}
resource "aws_ecr_repository" "ecr_repository" {
  for_each = toset(local.services)
  name     = "jfp-${each.key}"
}
