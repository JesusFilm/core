
data "aws_availability_zones" "current" {}

data "aws_iam_user" "jfp_terraform_user" {
  user_name = "jfp-terraform-user"
}

data "aws_acm_certificate" "acm_central_jesusfilm_org" {
  domain = "*.central.jesusfilm.org"
}

data "aws_route53_zone" "route53_central_jesusfilm_org" {
  name = "central.jesusfilm.org"
}

data "aws_ecs_cluster" "ecs_cluster" {
  cluster_name = "jfp-ecs-cluster-prod"
}

data "aws_vpc" "vpc" {
  tags = {
    Name = "jfp-vpc-prod"
  }
}

data "aws_subnets" "public_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }

  tags = {
    Tier = "Public"
  }
}

data "aws_subnets" "internal_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }

  tags = {
    Tier = "Internal"
  }
}

data "aws_ssm_parameter" "atlantis_github_user_token" {
  name = "/terraform/prd/ATLANTIS_GITHUB_USER_TOKEN"
}

data "aws_ssm_parameter" "atlantis_github_webhook_secret" {
  name = "/terraform/prd/ATLANTIS_GITHUB_WEBHOOK_SECRET"
}
