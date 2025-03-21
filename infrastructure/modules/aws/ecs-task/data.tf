data "doppler_secrets" "app" {
  provider = doppler
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

data "aws_route53_zone" "zone" {
  zone_id = var.service_config.zone_id
}

data "aws_iam_role" "ecs_task_role" {
  name = "terraform-ecs-task-role-${var.env}"
}
