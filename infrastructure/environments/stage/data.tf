data "aws_acm_certificate" "acm_central_jesusfilm_org" {
  domain = "*.stage.central.jesusfilm.org"
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

data "aws_ssm_parameter" "doppler_api_journeys_stage_token" {
  name = "/terraform/prd/DOPPLER_API_JOURNEYS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_languages_stage_token" {
  name = "/terraform/prd/DOPPLER_API_LANGUAGES_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_media_stage_token" {
  name = "/terraform/prd/DOPPLER_API_MEDIA_STAGE_TOKEN"
}


data "aws_ssm_parameter" "doppler_api_tags_stage_token" {
  name = "/terraform/prd/DOPPLER_API_TAGS_STAGE_TOKEN"
}


data "aws_ssm_parameter" "doppler_api_users_stage_token" {
  name = "/terraform/prd/DOPPLER_API_USERS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_videos_stage_token" {
  name = "/terraform/prd/DOPPLER_API_VIDEOS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "cloudflared_stage_token" {
  name = "/terraform/prd/CLOUDFLARED_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_journeys_stage_token" {
  name = "/terraform/prd/DOPPLER_JOURNEYS_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_journeys_admin_stage_token" {
  name = "/terraform/prd/DOPPLER_JOURNEYS_ADMIN_STAGE_TOKEN"
}

data "aws_ssm_parameter" "doppler_watch_stage_token" {
  name = "/terraform/prd/DOPPLER_WATCH_STAGE_TOKEN"
}
