data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# data "terraform_remote_state" "elasticache" {
#   backend = "s3"
#   config = {
#     encrypt        = true
#     bucket         = "jfp-terraform-state"
#     dynamodb_table = "jfp-terraform-state-lock"
#     region         = "us-east-2"
#     key            = "aws/elasticache/terraform.tfstate"
#   }
# }

data "aws_ecs_cluster" "cluster" {
  cluster_name = var.env
}

data "aws_iam_role" "ecs_service_role" {
  name = "ecsServiceRole"
}

data "terraform_remote_state" "github_oidc" {
  backend = "s3"
  config = {
    encrypt        = true
    bucket         = "jfp-terraform-state"
    dynamodb_table = "jfp-terraform-state-lock"
    region         = "us-east-2"
    key            = "aws/iam/github-oidc/terraform.tfstate"
  }
}

data "github_repository" "repo" {
  name = local.repo
}

data "aws_dynamodb_table" "build_numbers" {
  name = "ECSBuildNumbers"
}
