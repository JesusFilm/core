terraform {
  backend "s3" {
    encrypt      = true
    bucket       = "jfp-terraform-state"
    region       = "us-east-2"
    key          = "atlantis/terraform.tfstate"
    use_lockfile = true
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  required_version = ">= 1.1.7"
}

provider "aws" {
  region = "us-east-2"
}
