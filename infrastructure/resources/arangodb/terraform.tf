terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "arangodb/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    oasis = {
      source  = "arangodb-managed/oasis"
      version = ">=2.1.0"
    }
  }
}

provider "aws" {
  region = "us-east-2"
}

provider "oasis" {
  api_key_id     = data.aws_ssm_parameter.oasis_api_key.value
  api_key_secret = data.aws_ssm_parameter.oasis_api_secret.value
}
