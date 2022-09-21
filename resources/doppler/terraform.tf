terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "doppler/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.24"
    }
    doppler = {
      source = "DopplerHQ/doppler"
      version = "1.1.2" # Always specify the latest version
    }
  }
  required_version = ">= 1.1.7"
}

provider "aws" {
  region = "us-east-2"
}