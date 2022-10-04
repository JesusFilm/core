data "aws_route53_zone" "zone" {
  name = var.parent_domain_name
}

resource "aws_route53_zone" "sub_zone" {
  name = var.domain_name
}

resource "aws_route53_record" "zone_ns" {
  allow_overwrite = true
  zone_id         = data.aws_route53_zone.zone.zone_id
  name            = aws_route53_zone.sub_zone.name
  type            = "NS"
  ttl             = "172800"
  records         = aws_route53_zone.sub_zone.name_servers
}
