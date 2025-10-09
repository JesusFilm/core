data "aws_acm_certificate" "acm_central_jesusfilm_org" {
  domain = "*.stage.central.jesusfilm.org"
}

data "aws_acm_certificate" "acm_nextstep_is" {
  domain = "*.nextstep.is"
}

data "aws_route53_zone" "route53_central_jesusfilm_org" {
  name = "central.jesusfilm.org"
}

data "aws_route53_zone" "route53_stage_central_jesusfilm_org" {
  name = "stage.central.jesusfilm.org"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "jfp-ecs-task-execution-role"
}

data "aws_ssm_parameter" "doppler_api_gateway_stage_token" {
  name = "/terraform/prd/DOPPLER_API_GATEWAY_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_analytics_stage_token" {
  name = "/terraform/prd/DOPPLER_API_ANALYTICS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_journeys_stage_token" {
  name = "/terraform/prd/DOPPLER_API_JOURNEYS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_languages_stage_token" {
  name = "/terraform/prd/DOPPLER_API_LANGUAGES_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_media_stage_token" {
  name = "/terraform/prd/DOPPLER_API_MEDIA_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_users_stage_token" {
  name = "/terraform/prd/DOPPLER_API_USERS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_arclight_stage_token" {
  name = "/terraform/prd/DOPPLER_ARCLIGHT_STAGE_TOKEN"
}

data "aws_ssm_parameter" "cloudflared_stage_token" {
  name = "/terraform/prd/CLOUDFLARED_STAGE_TOKEN"
}
data "aws_ssm_parameter" "doppler_journeys_admin_stage_token" {
  name = "/terraform/prd/DOPPLER_JOURNEYS_ADMIN_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_core_stage_token" {
  name = "/terraform/prd/DOPPLER_CORE_STAGE_TOKEN"
}

