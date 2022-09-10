terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "terraform/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.14"
    }
  }
  required_version = ">= 0.14.3"
}

provider "aws" {
  region = "us-east-2"
  default_tags {
    tags = local.tags
  }
}