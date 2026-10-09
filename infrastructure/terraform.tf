terraform {
  backend "s3" {
    encrypt      = true
    bucket       = "jfp-terraform-state"
    region       = "us-east-2"
    key          = "core.tfstate"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    doppler = {
      source = "DopplerHQ/doppler"
    }
    # Declared here so the import block in imports.tf resolves
    # `clickhouse_service` to this provider; it is configured inside
    # modules/clickhouse/service.
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = "~> 3.34"
    }
  }
  required_version = ">= 1.11.0"
}

provider "aws" {
  region = "us-east-2"
}
