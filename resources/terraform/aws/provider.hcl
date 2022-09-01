# Set common variables for the region. This is automatically pulled in in the root terragrunt.hcl configuration to
locals {
  provider_name    = "aws"
  provider_version = "~> 4.28.0"
}
