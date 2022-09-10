# Retrieve EKS cluster information
provider "aws" {
  region = "us-east-2"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.28.0"
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