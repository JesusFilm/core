output "dns_name" {
  value = aws_alb.alb.dns_name
}
output "id" {
  value = aws_alb.alb.id
}

output "zone_id" {
  value = aws_alb.alb.zone_id
}

output "alb_listener" {
  value = aws_alb_listener.alb_listener
}
