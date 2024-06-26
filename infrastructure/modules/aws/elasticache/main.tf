resource "aws_elasticache_subnet_group" "default" {
  name       = "redis-subnet-group-${var.env}"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "default" {
  apply_immediately    = true
  replication_group_id = var.cluster_id
  description          = "Managed by Terraform"
  subnet_group_name    = aws_elasticache_subnet_group.default.name
  node_type            = "cache.t2.medium"
  num_cache_clusters   = 1
  port                 = 6379
  security_group_ids   = [aws_security_group.redis.id]
}

resource "aws_security_group" "redis" {
  name   = "jfp-redis-internal-sg-${var.env}"
  vpc_id = var.vpc_id

  ingress = [{
    description      = "Managed by Terraform"
    security_groups  = [var.security_group_id]
    from_port        = 6379
    to_port          = 6379
    cidr_blocks      = [var.cidr]
    ipv6_cidr_blocks = []
    protocol         = "tcp"
    prefix_list_ids  = []
    self             = false
  }]
}
