resource "aws_route53_zone" "zone" {
  name = local.domain_name
  tags = local.tags
}