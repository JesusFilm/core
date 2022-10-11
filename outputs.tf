output "vpc_id" {
  value = module.prod.vpc.id
}

output "internal_subnets" {
  value = module.prod.vpc.internal_subnets
}

output "public_subnets" {
  value = module.prod.vpc.public_subnets
}

output "internal_alb_dns" {
  value = module.prod.internal_alb.dns_name
}

output "ecs_task_execution_role_arn" {
  value = module.iam.ecs_task_execution_role_arn
}

output "atlantis_url" {
  description = "URL of Atlantis"
  value       = module.atlantis.atlantis_url
}
