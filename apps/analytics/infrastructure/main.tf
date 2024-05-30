module "plausible" {
  source                = "../../../infrastructure/modules/aws/ecs-task-base"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  docker_image          = "plausible/analytics:v2"
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
