# Terraform module which creates KMS Key AWS.
#
# https://docs.aws.amazon.com/kms/?id=docs_gateway

# https://www.terraform.io/docs/providers/aws/r/kms_key.html
resource "aws_kms_key" "default" {
  description             = var.description
  policy                  = data.aws_iam_policy_document.kms_key_with_alias_policy_document.json
  enable_key_rotation     = var.enable_key_rotation
  deletion_window_in_days = var.deletion_window_in_days
  tags                    = local.key_tags
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
      identifiers = var.trusted_kms_arns
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }
  statement {
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
  statement {
    sid    = "Allow use of the key"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = var.trusted_kms_role_arns
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
  }
  statement {
    sid    = "Allow attachment of persistent resources"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = var.trusted_kms_role_arns
    }
    actions = [
      "kms:CreateGrant",
      "kms:ListGrants",
      "kms:RevokeGrant"
    ]
    resources = ["*"]
    condition {
      test     = "Bool"
      variable = "kms:GrantIsForAWSResource"
      values   = [true]
    }
  }
}

locals {
  application_tag = var.application != "" ? { "application" = var.application } : {}
  environment_tag = var.environment != "" ? { "environment" = var.environment } : {}
  key_tags        = merge(local.application_tag, local.environment_tag, var.key_tags)
}
