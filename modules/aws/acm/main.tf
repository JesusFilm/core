resource "aws_acm_certificate" "main" {
  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = concat([var.domain_name], var.alternative_names)
}

resource "aws_acm_certificate_validation" "main" {
  certificate_arn = aws_acm_certificate.main.arn
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for validation in aws_acm_certificate.main.domain_validation_options :
    validation.domain_name => validation
  }
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = "300"
  records         = [each.value.resource_record_value]
  allow_overwrite = true
  zone_id         = var.zone_id
}
