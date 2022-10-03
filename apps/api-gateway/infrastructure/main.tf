module "ecs-task" {
  source                         = "../../../modules/aws/ecs-task"
  account                        = var.account
  region                         = var.region
  ecs_task_execution_role_arn    = var.ecs_task_execution_role_arn
  ecs_cluster                    = var.ecs_cluster
  public_ecs_security_group_id   = var.public_ecs_security_group_id
  internal_ecs_security_group_id = var.internal_ecs_security_group_id
  vpc_id                         = var.vpc_id
  internal_subnets               = var.internal_subnets
  public_subnets                 = var.public_subnets
  public_alb_security_group      = var.public_alb_security_group
  public_alb_listener            = var.public_alb_listener
  internal_alb_security_group    = var.internal_alb_security_group
  internal_alb_listener          = var.internal_alb_listener
  service_config                 = local.service_config
}
