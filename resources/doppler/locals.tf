locals {
  identifier = "global-database-users"

  tags = {
    name       = local.identifier
    env        = "main"
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }

  # database users which should exist in every postgres environment
  global_users = [
    "mike.allison",
    "tataihono.nikora",
    "jfp-terraform-user",
    "datadog" # used for monitoring via db queries
  ]
}
