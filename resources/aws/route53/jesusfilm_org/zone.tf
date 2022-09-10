resource "aws_route53_zone" "zone" {
  name = local.domain_name
  tags = local.tags
}

resource "aws_route53_zone" "core_zone" {
  name = "core.jesusfilm.org"
  tags = local.tags
}

resource "aws_route53_record" "core_jesusfilm_org_ns" {
  allow_overwrite = true
  zone_id = aws_route53_zone.core_zone.zone_id
  name    = aws_route53_zone.core_zone.name
  type    = "NS"
  ttl     = "172800"
  records = aws_route53_zone.core_zone.name_servers
}