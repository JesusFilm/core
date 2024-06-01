module "clickhouse" {
  source                = "../../../../infrastructure/modules/aws/ecs-task-clickhouse"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  docker_image          = "clickhouse/clickhouse-server:24.3.3.102-alpine"
}

