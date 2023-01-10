data "aws_ssm_parameter" "dd_api_key" {
  name = "/terraform/prd/DD_API_KEY"
}
