# Lookup the aws sso instance
data "aws_ssoadmin_instances" "current" {}

locals {
  instance_arn      = tolist(data.aws_ssoadmin_instances.current.arns)[0]
  identity_store_id = tolist(data.aws_ssoadmin_instances.current.identity_store_ids)[0]
}

# Lookup the organization
data "aws_organizations_organization" "current" {}

locals {
  account_ids = toset(length(var.aws_account_ids) == 0 ? [data.aws_organizations_organization.current.master_account_id] : var.aws_account_ids)
}

# Create the Permission Set
resource "aws_ssoadmin_permission_set" "this" {
  name             = var.name
  description      = var.description
  instance_arn     = local.instance_arn
  relay_state      = var.landing_page
  session_duration = var.session_duration
  tags             = local.tags

  # It takes a little time for `aws_ssoadmin_account_assignment` resource destruction to propagate in AWS.
  # Delete of `aws_ssoadmin_permission_set` will fail if they haven't, so we wait a little before destroying.
  provisioner "local-exec" {
    when    = destroy
    command = "sleep 10"
  }
}

# Empty policy document to use if no iam_policy_document_json is provided.
data "aws_iam_policy_document" "empty" {
  statement {
    sid       = "EmptyStatement"
    effect    = "Allow"
    resources = ["*"]
    actions   = ["none:null"]
  }
}

# Attach inline policy to the Permission Set if it exists
# This is always created even if iam_policy_document_json isn't provided since `count` was causing too many issues
resource "aws_ssoadmin_permission_set_inline_policy" "this" {
  instance_arn       = aws_ssoadmin_permission_set.this.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.this.arn
  inline_policy      = var.iam_policy_document_json != null ? var.iam_policy_document_json : data.aws_iam_policy_document.empty.json
}

# Add IAM policies to the Permission Set
resource "aws_ssoadmin_managed_policy_attachment" "policies" {
  for_each = toset(var.iam_policy_arns)

  instance_arn       = aws_ssoadmin_permission_set.this.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.this.arn
  managed_policy_arn = each.value
}

# Lookup users in the AWS identity Store
data "aws_identitystore_user" "users" {
  for_each = local.logins

  identity_store_id = local.identity_store_id
  filter {
    attribute_path  = "UserName"
    attribute_value = each.value
  }

  depends_on = [
    // User will not exist in AWS until they have been assigned to the app in Okta
    okta_app_group_assignment.groups,
    okta_app_user.users,
  ]
}

locals {
  # Convert users to a list since for_each produces a map, and the values of the map can't be know until after apply,
  #   we can't use them in another for_each. Instead we use a list and access it by index. This could result in random
  #   destroy/create/renaming, but that seems a small price to pay for getting the module to plan in a single
  #   run (without targeted applies).
  user_ids = values(data.aws_identitystore_user.users)[*].id
  keys     = keys(data.aws_identitystore_user.users)

  # Create Cartesian Product of account * users
  assignments = [
    for pair in setproduct(local.account_ids, range(length(data.aws_identitystore_user.users))) : {
      account_id = pair[0]
      user_index = pair[1]
    }
  ]
}

# Assign Users to the Permission Set in each account
resource "aws_ssoadmin_account_assignment" "assignments" {
  for_each = {
    for assignment in local.assignments : "${assignment.account_id}_${local.keys[assignment.user_index]}" => assignment
  }

  instance_arn       = aws_ssoadmin_permission_set.this.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.this.arn

  principal_id   = local.user_ids[each.value.user_index]
  principal_type = "USER"

  target_id   = each.value.account_id
  target_type = "AWS_ACCOUNT"
}
