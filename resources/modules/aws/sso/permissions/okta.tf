# Lookup AWS SSO Okta saml app
data "okta_app_saml" "aws" {
  label = "AWS Single Sign-on"
}

# Lookup provided users in Okta
data "okta_user" "users" {
  for_each = toset(var.okta_users)

  search {
    name  = "profile.login"
    value = each.value
  }
}

# Lookup provided groups in Okta
data "okta_group" "groups" {
  for_each = toset(var.okta_groups)

  name          = each.value
  include_users = true
}

# Lookup users on groups in Okta
data "okta_user" "groups" {
  for_each = toset(flatten([for group in data.okta_group.groups : group.users]))

  user_id = each.value
}

# Assign provided groups to Okta AWS SSO app
resource "okta_app_group_assignment" "groups" {
  for_each = data.okta_group.groups

  app_id            = data.okta_app_saml.aws.id
  group_id          = each.value.id
  retain_assignment = true

  # priority isn't an exposed attribute, but it's set in state and is dynamic, so we need to ignore it
  # See https://github.com/oktadeveloper/terraform-provider-okta/issues/71
  lifecycle { ignore_changes = [priority] }

  provisioner "local-exec" {
    # Give Okta a little time to provision group users to AWS Identity Store
    command = "sleep 10"
  }
}

# Assign provided users to Okta AWS SSO app
resource "okta_app_user" "users" {
  for_each = data.okta_user.users

  app_id            = data.okta_app_saml.aws.id
  user_id           = each.value.id
  username          = each.value.login
  retain_assignment = true

  provisioner "local-exec" {
    # Give Okta a little time to provision user to AWS Identity Store
    command = "sleep 10"
  }
}

locals {
  # Combine users logins from groups and users into a single set
  logins = toset(flatten([
    [for user in data.okta_user.users : user.login],
    [for user in data.okta_user.groups : user.login]
  ]))
}
