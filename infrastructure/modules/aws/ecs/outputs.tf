output "ecs_cluster" {
  value = {
    id   = aws_ecs_cluster.ecs_cluster.id
    name = aws_ecs_cluster.ecs_cluster.name
    arn  = aws_ecs_cluster.ecs_cluster.arn
  }

  # A service that selects FARGATE_SPOT is rejected until the provider is
  # associated with the cluster, so every consumer waits for that first.
  depends_on = [aws_ecs_cluster_capacity_providers.ecs_cluster]
}

output "public_ecs_security_group_id" {
  value = aws_security_group.public_security_group.id
}

output "internal_ecs_security_group_id" {
  value = aws_security_group.internal_security_group.id
}
