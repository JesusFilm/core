output "aws_rds_cluster" {
  value     = aws_rds_cluster.default
  sensitive = true
}

output "random_password" {
  value     = random_password.password
  sensitive = true
}
