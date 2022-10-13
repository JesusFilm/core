data "doppler_secrets" "app" {
  provider = doppler
}

data "aws_region" "current" {}

data "aws_availability_zones" "current" {
  filter {
    name   = "region-name"
    values = [data.aws_region.current.name]
  }
}

data "aws_db_subnet_group" "current" {
  name = var.env
}
