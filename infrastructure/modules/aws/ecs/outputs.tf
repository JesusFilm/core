output "ecs_cluster" {
  value = {
    id   = aws_ecs_cluster.ecs_cluster.id
    name = aws_ecs_cluster.ecs_cluster.name
  }
}

output "public_ecs_security_group_id" {
  value = aws_security_group.public_security_group.id
}

output "internal_ecs_security_group_id" {
  value = aws_security_group.internal_security_group.id
}
