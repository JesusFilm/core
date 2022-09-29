module "main" {
  source = "../../resources/modules/aws/ecs/scheduled_task"

  identifier    = local.identifier
  env           = local.env
  env_secrets   = local.env_secrets
  cloudwatch_schedule_expression = local.cloudwatch_schedule_expression
  tags          = local.tags
}