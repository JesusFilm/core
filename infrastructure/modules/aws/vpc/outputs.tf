output "vpc_id" {
  value = aws_vpc.vpc.id
}

output "internal_subnets" {
  value = [for subnet in aws_subnet.internal_subnet : subnet.id]
}

output "public_subnets" {
  value = [for subnet in aws_subnet.public_subnet : subnet.id]
}

output "db_subnet_group_name" {
  value = aws_db_subnet_group.default.name
}
