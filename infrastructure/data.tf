data "aws_ssm_parameter" "doppler_api_gateway_prod_token" {
  name = "/terraform/prd/DOPPLER_API_GATEWAY_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_journeys_prod_token" {
  name = "/terraform/prd/DOPPLER_API_JOURNEYS_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_languages_prod_token" {
  name = "/terraform/prd/DOPPLER_API_LANGUAGES_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_users_prod_token" {
  name = "/terraform/prd/DOPPLER_API_USERS_PROD_TOKEN"
}

data "aws_acm_certificate" "acm_core_arclight_org" {
  domain = "core.arclight.org"
}

data "aws_acm_certificate" "acm_core_stage_arclight_org" {
  domain = "core-stage.arclight.org"
}
