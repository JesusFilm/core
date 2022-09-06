provider "aws" {
  region = "us-east-2"
}

terraform {
	required_providers {
		aws = {
	    version = "~> 4.28.0"
		}
  }
	# comment this out on initial creation or it will fail. Then reinit
	backend "s3" {
    bucket         = "jfp-core-terraform"
    key            = "aws/terraform-state.tfstate"
    region         = "us-east-2"
    dynamodb_table = "jfp-core-terraform-locks"
    encrypt        = true
  }
}
