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
    "PG_DATABASE_URL_VIDEOS"
  ]
  cpu                     = 1024
  memory                  = 4096
  task_execution_role_arn = var.ecs_config.task_execution_role_arn
  env                     = var.env
}

module "database" {
  source                  = "../../../infrastructure/modules/aws/aurora"
  name                    = local.service_config.name
  env                     = var.env
  doppler_token           = var.doppler_token
  doppler_project         = local.service_config.name
  subnet_group_name       = var.subnet_group_name
  vpc_security_group_id   = var.vpc_security_group_id
  PG_DATABASE_URL_ENV_VAR = "PG_DATABASE_URL_VIDEOS"
}

module "algolia" {
  source        = "../../../infrastructure/modules/aws/ecs-scheduled-task"
  name          = "${local.service_config.name}-alogolia-seed"
  doppler_token = var.doppler_token
  environment_variables = [
    "ALGOLIA_APP_ID",
    "ALGOLIA_API_KEY",
    "PG_DATABASE_URL_VIDEOS"
  ]
  cpu                            = 1024
  memory                         = 4096
  task_execution_role_arn        = var.ecs_config.task_execution_role_arn
  env                            = var.env
  cloudwatch_schedule_expression = "cron(0 2 * * ? *)"
  cluster_arn                    = var.ecs_config.cluster.arn
  subnet_ids                     = var.ecs_config.subnets
}
