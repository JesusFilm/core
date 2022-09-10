resource "aws_vpc" "main" {
  cidr_block = "10.16.0.0/16"

  enable_dns_hostnames = true

  tags = merge(local.tags, {
    Name = "Main VPC"
  })
}

output "main_vpc_id" {
  description = "The ID of the Main VPC"
  value       = aws_vpc.main.id
}
