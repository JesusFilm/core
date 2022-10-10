# output "internal_service_dns" {
#   value = aws_route53_zone.private_zone
# }

output "id" {
  value = aws_route53_zone.private_zone.id
}
