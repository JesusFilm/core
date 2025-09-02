module "alb-listener" {
  source   = "../../../infrastructure/modules/aws/alb-listener"
  alb_arn  = var.alb.arn
  port     = local.port
  protocol = "HTTP"
}

module "ecs-task" {
  source                = "../../../infrastructure/modules/aws/ecs-task"
  ecs_config            = var.ecs_config
  service_config        = local.service_config
  env                   = var.env
  doppler_token         = var.doppler_token
  environment_variables = local.environment_variables
  alb_listener_arn      = module.alb-listener.arn
  alb_dns_name          = var.alb.dns_name
  dd_source             = "graphql-yoga"
  include_aws_env_vars  = true
}
