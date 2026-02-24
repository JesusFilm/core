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
  }
  required_version = ">= 1.0.9"
}

provider "aws" {
  region = "us-east-2"
}
