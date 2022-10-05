resource "aws_route53_zone" "sub_zone" {
  name = var.domain_name
  vpc {
    vpc_id = var.vpc_id
  }
}

resource "aws_route53_record" "zone_ns" {
  allow_overwrite = true
  zone_id         = var.parent_zone_id
  name            = aws_route53_zone.sub_zone.name
  type            = "NS"
  ttl             = "172800"
  records         = aws_route53_zone.sub_zone.name_servers
}
