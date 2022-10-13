data "aws_availability_zones" "current" {}

data "aws_iam_user" "jfp_terraform_user" {
  user_name = "jfp-terraform-user"
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

data "aws_ssm_parameter" "doppler_api_users_prod_token" {
  name = "/terraform/prd/DOPPLER_API_USERS_PROD_TOKEN"
}

data "aws_ssm_parameter" "doppler_api_videos_prod_token" {
  name = "/terraform/prd/DOPPLER_API_VIDEOS_PROD_TOKEN"
}
