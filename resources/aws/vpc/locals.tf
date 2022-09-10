locals {
  tags = {
    env        = "prod"
    managed_by = "terraform"
    # owner      = "dps-ndpt@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
