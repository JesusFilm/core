data "terraform_remote_state" "sg" {
  backend = "local"

  config = {
    path = "../../../generated/aws/sg/terraform.tfstate"
  }
}

data "terraform_remote_state" "subnet" {
  backend = "local"

  config = {
    path = "../../../generated/aws/subnet/terraform.tfstate"
  }
}
