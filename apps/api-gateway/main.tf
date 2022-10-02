module "ecs-task" {
  source                      = "../../modules/aws/ecs-task"
  account                     = var.account
  region                      = var.region
  ecs_task_execution_role_arn = var.ecs_task_execution_role_arn
  ecs_cluster_id              = var.ecs_cluster_id
  vpc_id                      = var.vpc_id
  internal_subnets            = var.internal_subnets
  public_subnets              = var.public_subnets
  public_alb_security_group   = var.public_alb_security_group
  internal_alb_security_group = var.internal_alb_security_group
  service_config              = local.service_config
  # internal_alb_target_groups  = var.internal_alb_target_groups
  # public_alb_target_groups    = var.public_alb_target_groups
}
