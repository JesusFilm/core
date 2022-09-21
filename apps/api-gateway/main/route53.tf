data "aws_route53_zone" "central_jesusfilm_org" {
  name = "central.jesusfilm.org"
}

resource "aws_route53_record" "api" {
  name    = local.public_url
  type    = "CNAME"
  ttl     = 300
  zone_id = data.aws_route53_zone.central_jesusfilm_org.zone_id
  records = [aws_lb.application_load_balancer.dns_name]
}