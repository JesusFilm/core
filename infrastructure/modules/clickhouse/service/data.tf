data "aws_ssm_parameter" "clickhouse_org_id" {
  name = "/terraform/prd/CLICKHOUSE_ORG_ID"
}

data "aws_ssm_parameter" "clickhouse_api_key" {
  name = "/terraform/prd/CLICKHOUSE_CLOUD_API_KEY"
}

data "aws_ssm_parameter" "clickhouse_api_secret" {
  name = "/terraform/prd/CLICKHOUSE_CLOUD_API_SECRET"
}
