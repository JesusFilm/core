terraform {
  backend "s3" {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "github/CruGlobal/terraform.tfstate"
  }
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 4.19"
    }
  }

  required_version = ">= 1.0.9"
}

provider "github" {
  owner = "JesusFilm"
}
