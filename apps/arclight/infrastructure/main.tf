module "ecs-task" {
  source                = "../../../infrastructure/modules/aws/ecs-task"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  alb_listener_arn      = var.alb_listener_arn
  alb_dns_name          = var.alb_dns_name
  host_name             = var.host_name
  host_names            = var.host_names
  dd_source             = "nextjs"
}
