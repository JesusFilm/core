locals {
  identifier = "route53"
  name       = "${local.identifier}-prod"
  tags = {
    Name       = local.name
    function   = "util"
    type       = local.identifier
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
