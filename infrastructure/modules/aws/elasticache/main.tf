resource "aws_elasticache_subnet_group" "default" {
  name       = "redis-subnet-group-${var.env}"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "default" {
  replication_group_id = var.cluster_id
  description          = "Managed by Terraform"
  subnet_group_name    = aws_elasticache_subnet_group.default.name
  node_type            = "cache.t2.small"
  num_cache_clusters   = 1
  port                 = 6379
}
