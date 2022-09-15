locals {
  identifier  = "api-users"
  env         = "main"
  environment = "production"

  tags = {
    Name         = "${local.identifier}-${local.env}"
    env          = local.env
    project_name = local.identifier
    application  = local.identifier
    # owner        = "apps@cru.org"
    managed_by   = "terraform"
    terraform    = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }

  developers = []

  notification_recipients = []
}
