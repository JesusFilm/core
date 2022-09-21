data "aws_caller_identity" "current" {}

data "aws_acm_certificate" "central_jesusfilm_org" {
  domain      = "*.central.jesusfilm.org"
  most_recent = true
}

data "aws_ecr_repository" "main" {
  name = "jfp-${local.identifier}"
}

data "aws_vpc" "main" {
  tags = { Name = "Main VPC" }
}

data "aws_subnets" "apps_public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  tags = {
    env  = local.env
    type = "apps"
  }
}
