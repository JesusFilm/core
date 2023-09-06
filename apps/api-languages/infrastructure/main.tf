module "ecs-task" {
  source                = "../../../infrastructure/modules/aws/ecs-task"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
}

module "seed" {
  source        = "../../../infrastructure/modules/aws/ecs-task-job"
  name          = "${local.service_config.name}-seed"
  doppler_token = var.doppler_token
  environment_variables = [
    "ARCLIGHT_API_KEY",
    "DATABASE_DB",
    "DATABASE_PASS",
    "DATABASE_URL",
    "DATABASE_USER",
    "PG_DATABASE_URL"
  ]
  task_execution_role_arn = var.ecs_config.task_execution_role_arn
  env                     = var.env
}

module "database" {
  source                = "../../../infrastructure/modules/aws/aurora"
  name                  = local.service_config.name
  env                   = var.env
  doppler_token         = var.doppler_token
  doppler_project       = local.service_config.name
  subnet_group_name     = var.subnet_group_name
  vpc_security_group_id = var.vpc_security_group_id
}
