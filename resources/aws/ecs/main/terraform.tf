terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "aws/ecs/main/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.15"
    }
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.12"
    }
  }
  required_version = ">= 1.1.7"
}

provider "aws" {
  region = "us-east-2"
  default_tags {
    tags = local.tags
  }
}

# data "terraform_remote_state" "applications_alb_prod" {
#   backend = "s3"
#   config = {
#     encrypt        = true
#     bucket         = "jfp-terraform-state"
#     dynamodb_table = "jfp-terraform-state-lock"
#     region         = "us-east-2"
#     key            = "aws/ec2/applications-alb/main/terraform.tfstate"
#   }
# }

# data "terraform_remote_state" "applications_internal_alb_prod" {
#   backend = "s3"
#   config = {
#     encrypt        = true
#     bucket         = "jfp-terraform-state-state"
#     dynamodb_table = "jfp-terraform-state-lock"
#     region         = "us-east-2"
#     key            = "aws/ec2/applications-alb/internal/main/terraform.tfstate"
#   }
# }