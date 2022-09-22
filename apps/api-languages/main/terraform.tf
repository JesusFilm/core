provider "aws" {
  region = "us-east-2"
}

terraform {
	backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "apps/api-languages/main/terraform.tfstate"
  }
	required_providers {
		aws = {
	    version = "~> 4.28.0"
		}
    github = {
      source  = "integrations/github"
      version = "~> 4.25"
    }
  }
}

provider "github" { owner = "JesusFilm" }