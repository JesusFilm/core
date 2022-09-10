terraform {
  backend "s3" {
    bucket         = "jfp-core-terraform"
    key            = "global/s3/vpc.tfstate"
    region         = "us-east-2"
    dynamodb_table = "jfp-core-terraform-locks"
    encrypt        = true
  }
}

resource "aws_vpc" "tfer--vpc-b896f6d1" {
  assign_generated_ipv6_cidr_block = "false"
  cidr_block                       = "172.31.0.0/16"
  enable_classiclink               = "false"
  enable_classiclink_dns_support   = "false"
  enable_dns_hostnames             = "true"
  enable_dns_support               = "true"
  instance_tenancy                 = "default"
  ipv6_netmask_length              = "0"
}
