locals {
  domain_name = "jesusfilm.org"

  tags = {
    Name       = local.domain_name
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
