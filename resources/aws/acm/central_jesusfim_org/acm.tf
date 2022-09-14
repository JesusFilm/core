data "aws_route53_zone" "jesusfilm_org" {
  name     = "jesusfilm.org"
}

data "aws_route53_zone" "central_jesusfilm_org" {
  name     = "central.jesusfilm.org"
}

# TODO: Possibly add graphql & graphql-stage
resource "aws_acm_certificate" "central_jesusfilm_org" {
  domain_name       = "*.central.jesusfilm.org"
  validation_method = "DNS"
  subject_alternative_names =  ["*.central.jesusfilm.org"] # , "graphql-stage.jesusfilm.org", "graphql.jesusfilm.org"]
  tags = {
    Name       = "central.jesusfim.org wildcard certificate"
    # owner      = "dave.perlow@athletesinaction.org"
    managed_by = "terraform"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}

resource "aws_acm_certificate_validation" "central_jesusfilm_org" {
  certificate_arn = aws_acm_certificate.central_jesusfilm_org.arn
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for validation in aws_acm_certificate.central_jesusfilm_org.domain_validation_options :
    validation.domain_name => validation
  }
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = "300"
  records         = [each.value.resource_record_value]
  allow_overwrite = true
  zone_id         = data.aws_route53_zone.central_jesusfilm_org.zone_id
}
