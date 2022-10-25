data "aws_acm_certificate" "acm_central_jesusfilm_org" {
  domain = "*.central.jesusfilm.org"
}

data "aws_route53_zone" "route53_central_jesusfilm_org" {
  name = "central.jesusfilm.org"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "jfp-ecs-task-execution-role"
}

data "aws_ssm_parameter" "doppler_api_gateway_stage_token" {
  name = "/terraform/prd/DOPPLER_API_GATEWAY_STAGE_TOKEN"
}
