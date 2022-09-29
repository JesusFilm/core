locals {
  identifier = "global-database-users"

  tags = {
    name       = local.identifier
    env        = "main"
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
