data "doppler_secrets" "app" {
  provider = doppler
}

data "aws_region" "current" {}
