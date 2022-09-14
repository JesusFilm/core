locals {
  identifier = "jfp-alb-logs"

  tags = {
    Name       = local.identifier,
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    comment    = "ALB/ELB logs by hostname prefix"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
