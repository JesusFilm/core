data "aws_acm_certificate" "acm_central_jesusfilm_org" {
  domain = "*.central.jesusfilm.org"
}

data "aws_route53_zone" "route53_central_jesusfilm_org" {
  name = "central.jesusfilm.org"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "jfp-ecs-task-execution-role"
}

data "aws_ssm_parameter" "doppler_api_gateway_prod_token" {
  name = "/terraform/prd/DOPPLER_API_GATEWAY_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_journeys_prod_token" {
  name = "/terraform/prd/DOPPLER_API_JOURNEYS_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_languages_prod_token" {
  name = "/terraform/prd/DOPPLER_API_LANGUAGES_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_tags_prod_token" {
  name = "/terraform/prd/DOPPLER_API_TAGS_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_users_prod_token" {
  name = "/terraform/prd/DOPPLER_API_USERS_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_videos_prod_token" {
  name = "/terraform/prd/DOPPLER_API_VIDEOS_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_media_prod_token" {
  name = "/terraform/prd/DOPPLER_API_MEDIA_PROD_TOKEN"
}

data "aws_ssm_parameter" "cloudflared_prod_token" {
  name = "/terraform/prd/CLOUDFLARED_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_journeys_admin_prod_token" {
  name = "/terraform/prd/DOPPLER_JOURNEYS_ADMIN_PROD_TOKEN"
}
