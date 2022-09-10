locals {
  identifier = "ecs"
  env        = "stage"
  name       = "${local.identifier}-${local.env}"

  tags = {
    Name       = local.name
    env        = local.env
    managed_by = "terraform"
    # owner      = "devops-engineering-team@cru.org"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }

  # datadog_tags = [for k, v in local.tags : "${k}:${v}"]
}
