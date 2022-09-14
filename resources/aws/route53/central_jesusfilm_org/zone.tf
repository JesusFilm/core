data "aws_route53_zone" "zone" {
  name = "jesusfilm.org"  
}

resource "aws_route53_zone" "central_zone" {
  name = "central.jesusfilm.org"
  tags = local.tags
}

resource "aws_route53_record" "central_jesusfilm_org_ns" {
  allow_overwrite = true
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = aws_route53_zone.central_zone.name
  type    = "NS"
  ttl     = "172800"
  records = aws_route53_zone.central_zone.name_servers
}