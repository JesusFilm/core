locals {
  tags = {
    env        = "main"
    managed_by = "terraform"
    # owner      = "dps-ndpt@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
