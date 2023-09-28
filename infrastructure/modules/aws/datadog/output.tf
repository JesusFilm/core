output "datadog_api_key" {
  value = data.aws_ssm_parameter.datadog_api_key.value
}
