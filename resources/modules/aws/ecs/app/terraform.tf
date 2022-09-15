terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.74.0, < 5.0.0"
    }
    external = {
      source  = "hashicorp/external"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.10"
    }
    okta = {
      source  = "okta/okta"
      version = ">= 3.20, < 4.0.0"
    }
    github = {
      source  = "integrations/github"
      version = ">= 4.20.0, < 5.0.0"
    }
  }
}
