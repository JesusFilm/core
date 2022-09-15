locals {
  roles = {
    "read_only" = "Datadog Read Only Role"
    "standard"  = "Datadog Standard Role"
    "admin"     = "Datadog Admin Role"
  }

  users = {
    "dj.mikeallison@gmail.com"            = "admin",
  }
}

data "datadog_role" "roles" {
  for_each = local.roles
  filter   = each.value
}

resource "datadog_user" "users" {
  for_each = local.users

  email                = each.key
  roles                = [data.datadog_role.roles[each.value].id]
  send_user_invitation = true

  lifecycle {
    ignore_changes = [name]
  }

}
