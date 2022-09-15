terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.74.0, < 5.0.0"
    }
    okta = {
      source  = "okta/okta"
      version = ">= 3.10.1, < 4.0.0"
    }
  }
}
