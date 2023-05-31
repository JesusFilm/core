output "vpc" {
  value = {
    id                   = module.vpc.vpc_id
    public_subnets       = module.vpc.public_subnets
    internal_subnets     = module.vpc.internal_subnets
    db_subnet_group_name = module.vpc.db_subnet_group_name
  }
}

output "ecs_cluster" {
  value = {
    id   = module.ecs.ecs_cluster.id
    name = module.ecs.ecs_cluster.name
  }
}

output "public_alb" {
  value = {
    arn              = module.public_alb.arn
    aws_alb_listener = module.public_alb.alb_listener
    dns_name         = module.public_alb.dns_name
  }
}

output "internal_alb" {
  value = {
    arn              = module.internal_alb.arn
    aws_alb_listener = module.internal_alb.alb_listener
    dns_name         = module.internal_alb.dns_name
  }
}

output "public_alb_security_group_id" {
  value = module.public_alb_security_group.security_group_id
}

output "private_rds_security_group_id" {
  value = module.internal_rds_security_group.security_group_id
}

output "public_bastion_security_group_id" {
  value = module.public_bastion_security_group.security_group_id
}

output "ecs" {
  value = {
    ecs_cluster                    = module.ecs.ecs_cluster
    public_ecs_security_group_id   = module.ecs.public_ecs_security_group_id
    internal_ecs_security_group_id = module.ecs.internal_ecs_security_group_id
  }
}

output "route53_private_zone_id" {
  value = module.route53_private_zone.id
}
