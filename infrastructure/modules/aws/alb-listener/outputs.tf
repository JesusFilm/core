output "arn" {
  value = aws_alb_listener.alb_listener.arn
}

output "port" {
  value = aws_alb_listener.alb_listener.port
}
