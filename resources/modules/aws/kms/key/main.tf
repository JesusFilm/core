# Terraform module which creates KMS Key AWS.
#
# https://docs.aws.amazon.com/kms/?id=docs_gateway

data "aws_caller_identity" "current" {}

# https://www.terraform.io/docs/providers/aws/r/kms_key.html
resource "aws_kms_key" "default" {
  description             = var.description
  policy                  = data.aws_iam_policy_document.kms_key_with_alias_policy_document.json
  enable_key_rotation     = var.enable_key_rotation
  deletion_window_in_days = var.deletion_window_in_days
  tags                    = var.key_tags
}

# https://www.terraform.io/docs/providers/aws/r/kms_alias.html
resource "aws_kms_alias" "default" {
  name          = var.name
  target_key_id = aws_kms_key.default.key_id
}

data "aws_iam_policy_document" "kms_key_with_alias_policy_document" {
  statement {
    sid    = "Enable IAM User Permissions"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  # Don't include this statement if trusted_kms_admins is empty
  dynamic "statement" {
    for_each = length(var.trusted_kms_admin_arns) == 0 ? [] : [""]
    content {
      sid    = "Allow access for Key Administrators"
      effect = "Allow"
      principals {
        type        = "AWS"
        identifiers = var.trusted_kms_admin_arns
      }
      actions = [
        "kms:Create*",
        "kms:Describe*",
        "kms:Enable*",
        "kms:List*",
        "kms:Put*",
        "kms:Update*",
        "kms:Revoke*",
        "kms:Disable*",
        "kms:Get*",
        "kms:Delete*",
        "kms:Tagresource",
        "kms:Untagresource",
        "kms:ScheduleKeyDeletion",
        "kms:CancelKeyDeletion"
      ]
      resources = ["*"]
    }
  }
}
