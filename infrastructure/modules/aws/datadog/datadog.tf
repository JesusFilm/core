terraform {
  required_providers {
    datadog = {
      source = "DataDog/datadog"
      # Pin to 3.x: v4.0.0 removed datadog_integration_aws in favor of
      # datadog_integration_aws_account, which requires a separate schema
      # rewrite + state import. Track that work separately.
      version = "~> 3.72"
    }
  }
}

# Configure the Datadog provider
provider "datadog" {
  api_key = data.aws_ssm_parameter.datadog_api_key.value
  app_key = data.aws_ssm_parameter.datadog_app_key.value
}
