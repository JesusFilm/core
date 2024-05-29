module "plausible" {
  source                = "../../../infrastructure/modules/aws/ecs-task-base"
  ecs_config            = var.public_ecs_config
  service_config        = local.plausible.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.plausible.environment_variables
  docker_image          = "plausible/analytics:v2"
}

module "clickhouse" {
  source                = "../../../infrastructure/modules/aws/ecs-task-base"
  ecs_config            = var.internal_ecs_config
  service_config        = local.clickhouse.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.clickhouse.environment_variables
  docker_image          = "clickhouse/clickhouse-server:23.3.7.5-alpine"
}

module "postgresql" {
  source                  = "../../../infrastructure/modules/aws/aurora"
  name                    = "plausible"
  env                     = var.env
  doppler_token           = var.doppler_token
  doppler_project         = "plausible"
  subnet_group_name       = var.subnet_group_name
  vpc_security_group_id   = var.vpc_security_group_id
  PG_DATABASE_URL_ENV_VAR = "DATABASE_URL"
}
