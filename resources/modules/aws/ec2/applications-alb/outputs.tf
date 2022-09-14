output "load_balancer_arn" {
  description = "Load balancer ARN"
  value       = aws_lb.this.arn
}

output "http_listener_arn" {
  description = "HTTP listener ARN"
  value       = var.add_http_listener ? aws_lb_listener.http[0].arn : ""
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = aws_lb_listener.https.arn
}
