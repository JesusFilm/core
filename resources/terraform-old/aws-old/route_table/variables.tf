data "terraform_remote_state" "route_table" {
  backend = "local"

  config = {
    path = "../../../generated/aws/route_table/terraform.tfstate"
  }
}

data "terraform_remote_state" "subnet" {
  backend = "local"

  config = {
    path = "../../../generated/aws/subnet/terraform.tfstate"
  }
}

data "terraform_remote_state" "vpc" {
  backend = "local"

  config = {
    path = "../../../generated/aws/vpc/terraform.tfstate"
  }
}
