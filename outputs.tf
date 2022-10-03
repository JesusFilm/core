output "vpc_id" {
  value = module.vpc.vpc_id
}

output "internal_subnets" {
  value = module.vpc.internal_subnets
}

output "public_subnets" {
  value = module.vpc.public_subnets
}

output "internal_alb_dns" {
  value = module.internal_alb.internal_alb_dns
}

output "ecs_task_execution_role_arn" {
  value = module.iam.ecs_task_execution_role_arn
}
