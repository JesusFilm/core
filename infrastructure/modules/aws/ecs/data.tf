data "aws_ssm_parameter" "datadog_api_key" {
  name = "/terraform/prd/DATADOG_API_KEY"
}
