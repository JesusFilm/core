# Set common variables for the region. This is automatically pulled in in the root terragrunt.hcl configuration to
locals {
  aws_region  = "us-east-2"
  provider_region_content = {
    region = local.aws_region
  }
}