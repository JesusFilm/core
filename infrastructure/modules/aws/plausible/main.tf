module "plausible" {
  source                = "../../../infrastructure/modules/aws/ecs-task-base"
  ecs_config            = var.ecs_config
  service_config        = local.plausible.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.plausible.environment_variables
  docker_image          = "plausible/analytics:v2"
}

module "clickhouse" {
  source                = "../../../infrastructure/modules/aws/ecs-task-base"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  docker_image          = "clickhouse/clickhouse-server:23.3.7.5-alpine"
}

module "postgres" {
  source                  = "../../../infrastructure/modules/aws/aurora"
  name                    = local.service_config.name
  env                     = var.env
  doppler_token           = var.doppler_token
  doppler_project         = local.service_config.name
  subnet_group_name       = var.subnet_group_name
  vpc_security_group_id   = var.vpc_security_group_id
  PG_DATABASE_URL_ENV_VAR = "PG_DATABASE_URL_PLAUSIBLE"
}
