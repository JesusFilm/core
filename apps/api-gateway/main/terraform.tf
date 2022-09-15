provider "aws" {
  region = "us-east-2"
}

terraform {
	backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "apps/api-gateway/main/terraform.tfstate"
  }
	required_providers {
		aws = {
	    version = "~> 4.28.0"
		}
  }
}


data "terraform_remote_state" "main_alb" {
  backend = "s3"
  config = {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "aws/ec2/applications-alb/main/terraform.tfstate"
  }
}