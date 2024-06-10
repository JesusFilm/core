
resource "aws_alb_listener" "alb_listener" {
  load_balancer_arn = var.ecs_config.alb.arn
  port              = local.port
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "No routes defined"
      status_code  = "200"
    }
  }
}

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
    "PG_DATABASE_URL_JOURNEYS"
  ]
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
  PG_DATABASE_URL_ENV_VAR = "PG_DATABASE_URL_JOURNEYS"
}
