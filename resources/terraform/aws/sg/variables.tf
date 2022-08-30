data "terraform_remote_state" "sg" {
  backend = "local"

  config = {
    path = "../../../generated/aws/sg/terraform.tfstate"
  }
}
