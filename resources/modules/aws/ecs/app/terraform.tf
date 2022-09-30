terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.30.0"
    }    
    github = {
      source  = "integrations/github"
      version = "~> 4.30.0"
    }
  }
}

# provider "postgresql" {
#   host = aws_rds_cluster.default.address
#   port = 1433
#   username = "root"
#   password = var.database_root_pass
#   expected_version = ""
# }