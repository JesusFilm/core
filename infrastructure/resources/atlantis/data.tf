
data "aws_availability_zones" "current" {}

data "aws_iam_user" "jfp_terraform_user" {
  user_name = "jfp-terraform-user"
}
