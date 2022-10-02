output "vpc_id" {
  value = aws_vpc.vpc.id
}

output "internal_subnets" {
  value = [for subnet in aws_subnet.private_subnet : subnet.id]
}

output "public_subnets" {
  value = [for subnet in aws_subnet.public_subnet : subnet.id]
}
