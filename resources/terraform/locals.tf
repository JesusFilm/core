data "aws_caller_identity" "current" {}

locals {
  iam_account_id = data.aws_caller_identity.current.account_id

  tags = {
    managed_by  = "terraform"
    application = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }

  # datadog_tags = [for k, v in local.tags : "${k}:${v}"]
}