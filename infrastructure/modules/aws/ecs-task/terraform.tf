terraform {
  # backend "s3" {
  #   encrypt        = true
  #   bucket         = "jfp-terraform-state"
  #   dynamodb_table = "jfp-terraform-state-lock"
  #   region         = "us-east-2"
  #   key            = "/ecs/task/terraform.tfstate"
  # }

  required_providers {
    doppler = {
      source = "DopplerHQ/doppler"
    }
  }
  required_version = ">= 1.0.9"
}

provider "doppler" {
  doppler_token = var.doppler_token
}
