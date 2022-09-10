provider "aws" {
  region = "us-east-2"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.28.0"
    }
    doppler = {
      source = "DopplerHQ/doppler"
      version = "1.1.2" # Always specify the latest version
    }
    helm = {
      source = "hashicorp/helm"
      version = "~> 2.6.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.13.1"
    }  
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

variable "doppler_token" {
  type = string
  description = "Replaced by doppler cli"
}

provider "doppler" {
  doppler_token = var.doppler_token
}

# Define our data source to fetch secrets
data "doppler_secrets" "this" {}