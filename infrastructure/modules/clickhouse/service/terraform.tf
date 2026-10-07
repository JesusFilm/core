terraform {
  required_providers {
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = "~> 3.34"
    }
    doppler = {
      source = "DopplerHQ/doppler"
    }
    random = {
      source = "hashicorp/random"
    }
  }
  required_version = ">= 1.11.0"
}

# Organisation-level API key (Admin role), kept in SSM like the Datadog keys.
provider "clickhouse" {
  organization_id = data.aws_ssm_parameter.clickhouse_org_id.value
  token_key       = data.aws_ssm_parameter.clickhouse_api_key.value
  token_secret    = data.aws_ssm_parameter.clickhouse_api_secret.value
}

provider "doppler" {
  doppler_token = var.doppler_token
}
