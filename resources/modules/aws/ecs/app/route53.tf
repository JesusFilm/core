data "aws_route53_zone" "zone" {
  count   = var.zone_id == "" ? 0 : 1
  zone_id = var.zone_id
}

resource "aws_route53_record" "alb_cname" {
  count   = var.zone_id == "" ? 0 : 1
  zone_id = var.zone_id
  name    = local.dns_name
  type    = "CNAME"
  ttl     = "300"
  records = [
    var.load_balancer_arn == "" ? data.aws_lb.alb[0].dns_name : data.aws_lb.shared_alb[0].dns_name
  ]
}

output "domain_name" {
  description = "Route53 record name created if zone_id was present"
  value       = local.dns_name
}
