terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "aws/iam/github-oidc/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.70"
    }
  }
  required_version = ">= 1.0.9"
}

provider "aws" {
  region = "us-east-2"
  default_tags {
    tags = {
      Name       = "github-oidc",
      managed_by = "terraform"
      #owner      = "devops-engineering-team@cru.org"
      terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
    }
  }
}
