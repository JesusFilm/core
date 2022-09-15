terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.74.0, < 5.0.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 3.47"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
