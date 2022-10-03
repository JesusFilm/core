output "internal_alb_dns" {
  value = aws_alb.alb.dns_name
}
output "internal_alb_id" {
  value = aws_alb.alb.id
}

output "aws_alb_listener" {
  value = aws_alb_listener.alb_listener
}

output "internal_alb" {
  value = aws_alb.alb
}
