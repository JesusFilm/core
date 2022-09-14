locals {
  identifier  = "applications-alb"
  env         = "stage"
  environment = "staging"

  tags = {
    name       = local.identifier
    env        = local.env
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
