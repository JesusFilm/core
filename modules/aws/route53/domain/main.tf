resource "aws_route53_zone" "zone" {
  name = var.domain_name
  vpc {
    vpc_id = var.vpc_id
  }
}
