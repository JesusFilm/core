terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "datadog/terraform.tfstate"
  }
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.8"
    }
  }

  required_version = ">= 1.0.9"
}

variable "datadog_api_key" {}

provider "datadog" {
  # TODO: Set DD_API_KEY default env var
  api_key = var.datadog_api_key
}
