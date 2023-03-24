data "doppler_secrets" "app" {
  provider = doppler
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
