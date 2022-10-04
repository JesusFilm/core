module "ecs-task" {
  source         = "../../../modules/aws/ecs-task"
  ecs_config     = var.ecs_config
  service_config = local.service_config
}
